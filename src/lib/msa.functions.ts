import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BATCH_SIZE = 20;
const TARGET = "ar-msa";

type Row = { idx: number; start_ms: number; end_ms: number; text: string };

function parseArray(raw: string): string[] {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("تعذّر قراءة نتيجة التفصيح.");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("تعذّر قراءة نتيجة التفصيح.");
  return parsed.map((item) => String(item ?? "").trim());
}

async function convertBatch(apiKey: string, batch: Row[]): Promise<string[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      messages: [
        {
          role: "system",
          content:
            "أنت محرّر لغوي عربي محترف. تستقبل مصفوفة JSON من أسطر مفرّغة بلهجة عامية عربية. " +
            "حوّل كل سطر إلى عربية فصحى معاصرة واضحة ومفهومة، مع الحفاظ على المعنى والنبرة، " +
            "وتصحيح كلمات اللهجة إلى مقابلها الفصيح، وإبقاء السطر قصيراً مناسباً للترجمة النصية. " +
            "أعد فقط مصفوفة JSON من النصوص بنفس العدد وبنفس الترتيب، دون أي تعليق.",
        },
        { role: "user", content: JSON.stringify(batch.map((r) => r.text)) },
      ],
    }),
  });

  if (response.status === 429) throw new Error("تم تجاوز حد الطلبات، حاول بعد قليل.");
  if (response.status === 402) throw new Error("انتهى رصيد الذكاء الاصطناعي في مساحة العمل.");
  if (!response.ok) {
    console.error("[msa] gateway error", response.status, await response.text());
    throw new Error("فشل التفصيح لدى مزود الذكاء الاصطناعي.");
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const out = parseArray(payload.choices?.[0]?.message?.content ?? "");
  if (out.length !== batch.length) {
    return batch.map((r, i) => out[i] ?? r.text);
  }
  return out;
}

export const convertEpisodeToMsa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { episodeId: string }) => {
    if (!input?.episodeId || typeof input.episodeId !== "string") {
      throw new Error("معرّف الحلقة مطلوب.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: transcript, error: transcriptError } = await supabase
      .from("transcripts")
      .select("id, episode_id")
      .eq("episode_id", data.episodeId)
      .maybeSingle();
    if (transcriptError) throw new Error(transcriptError.message);
    if (!transcript) throw new Error("لا يوجد تفريغ لهذه الحلقة بعد.");

    const { data: segments, error: segmentsError } = await supabase
      .from("transcript_segments")
      .select("idx, start_ms, end_ms, text")
      .eq("transcript_id", transcript.id)
      .order("idx", { ascending: true });
    if (segmentsError) throw new Error(segmentsError.message);
    if (!segments?.length) throw new Error("لا توجد مقاطع للتفصيح.");

    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) throw new Error("خدمة الذكاء غير مهيأة.");

    const rows = segments as Row[];
    const converted: string[] = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      converted.push(...(await convertBatch(apiKey, rows.slice(i, i + BATCH_SIZE))));
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("translations")
      .delete()
      .eq("transcript_id", transcript.id)
      .eq("target_language", TARGET);

    const { data: translation, error: insertError } = await supabaseAdmin
      .from("translations")
      .insert({
        transcript_id: transcript.id,
        target_language: TARGET,
        status: "ready",
        model: "openai/gpt-5.6-sol",
      })
      .select("id")
      .single();
    if (insertError || !translation) throw new Error(insertError?.message ?? "تعذّر حفظ النص الفصيح.");

    const { error: rowsError } = await supabaseAdmin.from("translation_segments").insert(
      rows.map((r, i) => ({
        translation_id: translation.id,
        idx: r.idx,
        start_ms: r.start_ms,
        end_ms: r.end_ms,
        text: converted[i] ?? r.text,
      })),
    );
    if (rowsError) throw new Error(rowsError.message);

    return { ok: true as const, segments: rows.length };
  });
