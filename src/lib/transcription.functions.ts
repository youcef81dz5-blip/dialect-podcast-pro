import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DIALECT_HINT: Record<string, string> = {
  msa: "العربية الفصحى",
  gulf: "اللهجة الخليجية",
  egyptian: "اللهجة المصرية",
  levantine: "اللهجة الشامية",
  maghrebi: "اللهجة المغاربية",
};

const MAX_AUDIO_BYTES = 24 * 1024 * 1024;

type Segment = { start_ms: number; end_ms: number; text: string };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function parseSegments(raw: string): Segment[] {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("تعذّر قراءة نتيجة التفريغ.");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) throw new Error("تعذّر قراءة نتيجة التفريغ.");
  return parsed
    .map((item, idx) => {
      const row = item as Record<string, unknown>;
      const startMs = Math.max(0, Math.round(Number(row['start_ms'] ?? row['start'] ?? idx * 5000)));
      const endMs = Math.max(startMs, Math.round(Number(row['end_ms'] ?? row['end'] ?? startMs + 5000)));
      return { start_ms: startMs, end_ms: endMs, text: String(row['text'] ?? "").trim() };
    })
    .filter((s) => s.text.length > 0);
}

export const transcribeEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { episodeId: string }) => {
    if (!input?.episodeId || typeof input.episodeId !== "string") {
      throw new Error("معرّف الحلقة مطلوب.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("id, title, dialect, source_type, source_url, storage_path, duration_seconds, status")
      .eq("id", data.episodeId)
      .maybeSingle();
    if (episodeError) throw new Error(episodeError.message);
    if (!episode) throw new Error("الحلقة غير موجودة.");
    if (episode.status === "processing") throw new Error("الحلقة قيد المعالجة بالفعل.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("episodes")
      .update({ status: "processing", error_message: null })
      .eq("id", episode.id);

    try {
      let bytes: Uint8Array;
      let mime = "audio/mpeg";

      if (episode.storage_path) {
        const { data: file, error } = await supabaseAdmin.storage
          .from("episode-audio")
          .download(episode.storage_path);
        if (error || !file) throw new Error("تعذّر تنزيل الملف الصوتي.");
        mime = file.type || mime;
        bytes = new Uint8Array(await file.arrayBuffer());
      } else if (episode.source_url) {
        const res = await fetch(episode.source_url);
        if (!res.ok) throw new Error("تعذّر تنزيل الصوت من الرابط.");
        mime = res.headers.get("content-type") ?? mime;
        bytes = new Uint8Array(await res.arrayBuffer());
      } else {
        throw new Error("لا يوجد مصدر صوتي لهذه الحلقة.");
      }

      if (bytes.byteLength > MAX_AUDIO_BYTES) {
        throw new Error("حجم الصوت كبير على التفريغ الآلي حالياً (الحد 24 ميجابايت).");
      }

      const apiKey = process.env['LOVABLE_API_KEY'];
      if (!apiKey) throw new Error("خدمة الذكاء غير مهيأة.");

      const dialect = DIALECT_HINT[episode.dialect] ?? "العربية الفصحى";
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                `أنت مفرّغ صوتي عربي محترف. المتحدث يستخدم ${dialect}. ` +
                "فرّغ الصوت كاملاً إلى نص عربي منقّح: أضف الترقيم، أزل كلمات الحشو والتكرار، ووحّد أسماء الأعلام. " +
                "أعد النتيجة كمصفوفة JSON فقط بالشكل [{\"start_ms\":0,\"end_ms\":5000,\"text\":\"...\"}] " +
                "بمقاطع قصيرة (5-15 ثانية) وبطوابع زمنية دقيقة. لا تكتب أي شرح خارج JSON.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `عنوان الحلقة: ${episode.title}` },
                {
                  type: "input_audio",
                  input_audio: {
                    data: toBase64(bytes),
                    format: mime.includes("wav") ? "wav" : mime.includes("m4a") || mime.includes("mp4") ? "m4a" : "mp3",
                  },
                },
              ],
            },
          ],
        }),
      });

      if (response.status === 429) throw new Error("تم تجاوز حد الطلبات، حاول بعد قليل.");
      if (response.status === 402) throw new Error("انتهى رصيد الذكاء الاصطناعي في مساحة العمل.");
      if (!response.ok) {
        const detail = await response.text();
        console.error("[transcribe] gateway error", response.status, detail);
        throw new Error("فشل التفريغ لدى مزود الذكاء الاصطناعي.");
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content ?? "";
      const segments = parseSegments(content);
      if (!segments.length) throw new Error("لم يُعثر على كلام في الملف الصوتي.");

      const rawText = segments.map((s) => s.text).join(" ");

      await supabaseAdmin.from("transcripts").delete().eq("episode_id", episode.id);
      const { data: transcript, error: insertError } = await supabaseAdmin
        .from("transcripts")
        .insert({
          episode_id: episode.id,
          language: "ar",
          model: "google/gemini-2.5-flash",
          raw_text: rawText,
          refined_text: rawText,
        })
        .select("id")
        .single();
      if (insertError || !transcript) throw new Error(insertError?.message ?? "تعذّر حفظ التفريغ.");

      const { error: segmentsError } = await supabaseAdmin.from("transcript_segments").insert(
        segments.map((s, idx) => ({
          transcript_id: transcript.id,
          idx,
          start_ms: s.start_ms,
          end_ms: s.end_ms,
          text: s.text,
        })),
      );
      if (segmentsError) throw new Error(segmentsError.message);

      const lastEnd = segments[segments.length - 1]?.end_ms ?? 0;
      const durationSeconds = episode.duration_seconds ?? Math.round(lastEnd / 1000);

      await supabaseAdmin
        .from("episodes")
        .update({ status: "ready", duration_seconds: durationSeconds, error_message: null })
        .eq("id", episode.id);

      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("id, minutes_used")
        .eq("user_id", userId)
        .maybeSingle();
      if (sub) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ minutes_used: Number(sub.minutes_used ?? 0) + durationSeconds / 60 })
          .eq("id", sub.id);
      }

      return { ok: true as const, segments: segments.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل التفريغ.";
      await supabaseAdmin
        .from("episodes")
        .update({ status: "failed", error_message: message })
        .eq("id", episode.id);
      throw new Error(message);
    }
  });
