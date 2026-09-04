import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { mergeSegmentBatches, parseBatchSegments, type TranscriptSegment } from "./transcription-segments";

const DIALECT_HINT: Record<string, string> = {
  msa: "العربية الفصحى",
  gulf: "اللهجة الخليجية",
  egyptian: "اللهجة المصرية",
  levantine: "اللهجة الشامية",
  maghrebi: "اللهجة المغاربية",
};
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;
const WINDOW_MS = 150_000;
const OVERLAP_MS = 5_000;
const COVERAGE_TOLERANCE_MS = 2_000;

type AuthContext = { supabase: SupabaseClient<Database>; userId: string };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function formatGatewayError(status: number, detail: string): Error {
  let gatewayMessage = "";
  try {
    const body = JSON.parse(detail) as { error?: { message?: string }; message?: string };
    gatewayMessage = body.error?.message ?? body.message ?? "";
  } catch {
    gatewayMessage = "";
  }
  if (status === 401) return new Error("خدمة الذكاء غير مهيأة بشكل صحيح.");
  if (status === 402) return new Error(gatewayMessage || "انتهى رصيد الذكاء الاصطناعي في مساحة العمل.");
  if (status === 403) return new Error(gatewayMessage || "خدمة الذكاء الاصطناعي متوقفة في مساحة العمل.");
  if (status === 429) return new Error("تم تجاوز حد الطلبات، حاول بعد قليل.");
  return new Error(gatewayMessage || "فشل التفريغ لدى مزود الذكاء الاصطناعي.");
}

async function requestBatch(options: {
  apiKey: string;
  audioBase64: string;
  mime: string;
  title: string;
  dialect: string;
  startMs: number;
  endMs: number;
}): Promise<TranscriptSegment[]> {
  const { apiKey, audioBase64, mime, title, dialect, startMs, endMs } = options;
  const prompt =
    `حلّل فقط المدة من ${startMs} إلى ${endMs} ملي ثانية من الصوت، وتجاهل كل ما قبلها وبعدها. ` +
    "استخدم طوابع زمنية مطلقة من بداية الملف. أعد JSON فقط بالشكل " +
    '{"segments":[{"start_ms":0,"end_ms":5000,"text":"..."}],"covered_until_ms":150000}. ' +
    `يجب أن تساوي covered_until_ms القيمة ${endMs} بعد فحص النافذة كاملة، حتى إذا انتهت بصمت.`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              `أنت مفرّغ صوتي عربي محترف. المتحدث يستخدم ${dialect}. ` +
              "فرّغ الكلام كاملاً إلى نص عربي منقّح مع الترقيم، دون حذف المعنى، في مقاطع من 5 إلى 15 ثانية.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `عنوان الحلقة: ${title}\n${prompt}` },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: mime.includes("wav") ? "wav" : mime.includes("m4a") || mime.includes("mp4") ? "m4a" : "mp3",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[transcribe] gateway batch error", response.status, detail.slice(0, 500));
      lastError = formatGatewayError(response.status, detail);
      if (response.status !== 429 && response.status < 500) throw lastError;
      if (attempt === 0) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : 1500));
        continue;
      }
      throw lastError;
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = parseBatchSegments(payload.choices?.[0]?.message?.content ?? "");
    if (parsed.coveredUntilMs !== null && parsed.coveredUntilMs >= endMs - COVERAGE_TOLERANCE_MS) {
      return parsed.segments.filter((segment) => segment.end_ms >= startMs && segment.start_ms <= endMs);
    }
    lastError = new Error(`لم يكتمل تفريغ الجزء ${Math.floor(startMs / 60000) + 1}.`);
  }
  throw lastError ?? new Error("لم يكتمل تفريغ جزء من الحلقة.");
}

export async function runTranscription(episodeId: string, context: AuthContext) {
  const { supabase, userId } = context;
  const { data: episode, error: episodeError } = await supabase
    .from("episodes")
    .select("id, title, dialect, source_url, storage_path, duration_seconds, status")
    .eq("id", episodeId)
    .maybeSingle();
  if (episodeError) throw new Error(episodeError.message);
  if (!episode) throw new Error("الحلقة غير موجودة.");
  if (episode.status === "processing") throw new Error("الحلقة قيد المعالجة بالفعل.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existingTranscript } = await supabaseAdmin
    .from("transcripts")
    .select("id")
    .eq("episode_id", episode.id)
    .eq("language", "ar")
    .maybeSingle();
  if (!existingTranscript) {
    // فحص الحصة الذرّي عبر دالة claim_quota_minutes لمنع race conditions.
    // الدالة تستخدم SELECT ... FOR UPDATE وتجدد الفترة تلقائياً.
    const durationMin = (episode.duration_seconds ?? 0) / 60;
    const { data: claim, error: claimError } = await (supabaseAdmin.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>)("claim_quota_minutes", {
      p_user_id: userId,
      p_minutes: durationMin,
    });
    if (claimError) throw new Error(claimError.message);
    const rows = claim as Array<{ granted: boolean; remaining_minutes: number }> | null;
    const granted = Array.isArray(rows) ? rows[0]?.granted === true : false;
    if (!granted) {
      throw new Error("انتهى رصيد الدقائق الشهري. رقِّ خطتك للمتابعة.");
    }
  }

  await supabaseAdmin.from("episodes").update({ status: "processing", error_message: null }).eq("id", episode.id);
  try {
    let bytes: Uint8Array;
    let mime = "audio/mpeg";
    if (episode.storage_path) {
      const { data: file, error } = await supabaseAdmin.storage.from("episode-audio").download(episode.storage_path);
      if (error || !file) throw new Error("تعذّر تنزيل الملف الصوتي.");
      mime = file.type || mime;
      bytes = new Uint8Array(await file.arrayBuffer());
    } else if (episode.source_url) {
      const response = await fetch(episode.source_url);
      if (!response.ok) throw new Error("تعذّر تنزيل الصوت من الرابط.");
      mime = response.headers.get("content-type") ?? mime;
      bytes = new Uint8Array(await response.arrayBuffer());
    } else throw new Error("لا يوجد مصدر صوتي لهذه الحلقة.");
    if (bytes.byteLength > MAX_AUDIO_BYTES) throw new Error("حجم الصوت كبير على التفريغ الآلي حالياً (الحد 24 ميجابايت).");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("خدمة الذكاء غير مهيأة.");
    const durationMs = Math.round((episode.duration_seconds ?? 0) * 1000);
    if (durationMs <= 0) throw new Error("تعذّر تحديد مدة الحلقة قبل التفريغ.");
    const audioBase64 = toBase64(bytes);
    const batches: TranscriptSegment[][] = [];
    for (let startMs = 0; startMs < durationMs; startMs += WINDOW_MS - OVERLAP_MS) {
      const endMs = Math.min(durationMs, startMs + WINDOW_MS);
      batches.push(await requestBatch({
        apiKey,
        audioBase64,
        mime,
        title: episode.title,
        dialect: DIALECT_HINT[episode.dialect] ?? "العربية الفصحى",
        startMs,
        endMs,
      }));
      if (endMs === durationMs) break;
    }
    const segments = mergeSegmentBatches(batches);
    if (!segments.length) throw new Error("لم يُعثر على كلام في الملف الصوتي.");

    const rawText = segments.map((segment) => segment.text).join(" ");
    let transcriptId = existingTranscript?.id;
    if (transcriptId) {
      const { error: clearError } = await supabaseAdmin
        .from("transcript_segments")
        .delete()
        .eq("transcript_id", transcriptId);
      if (clearError) throw new Error(clearError.message);
      const { error: updateError } = await supabaseAdmin
        .from("transcripts")
        .update({ model: "google/gemini-2.5-flash", raw_text: rawText, refined_text: rawText })
        .eq("id", transcriptId);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { data: transcript, error: insertError } = await supabaseAdmin
        .from("transcripts")
        .insert({ episode_id: episode.id, language: "ar", model: "google/gemini-2.5-flash", raw_text: rawText, refined_text: rawText })
        .select("id")
        .single();
      if (insertError || !transcript) throw new Error(insertError?.message ?? "تعذّر حفظ التفريغ.");
      transcriptId = transcript.id;
    }
    if (!transcriptId) throw new Error("تعذّر تحديد سجل التفريغ.");
    const { error: segmentsError } = await supabaseAdmin.from("transcript_segments").insert(
      segments.map((segment, index) => ({ transcript_id: transcriptId, idx: index, ...segment })),
    );
    if (segmentsError) {
      throw new Error(segmentsError.message);
    }
    await supabaseAdmin.from("episodes").update({ status: "ready", error_message: null }).eq("id", episode.id);
    // لا حاجة لتحديث minutes_used يدوياً: دالة claim_quota_minutes خصمت الحصة ذرّياً قبل البدء.
    return { ok: true as const, segments: segments.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل التفريغ.";
    await supabaseAdmin
      .from("episodes")
      .update({ status: existingTranscript ? "ready" : "failed", error_message: message })
      .eq("id", episode.id);
    throw new Error(message);
  }
}