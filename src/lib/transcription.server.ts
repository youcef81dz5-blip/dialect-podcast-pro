// Server-only helpers for the transcription pipeline.
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type Segment = { idx: number; start_ms: number; end_ms: number; text: string };

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("مفتاح خدمة الذكاء غير متوفر.");
  return key;
}

function gatewayError(status: number, body: string) {
  if (status === 429) return new Error("تم تجاوز حد الطلبات، حاول بعد قليل.");
  if (status === 402) return new Error("انتهى رصيد الذكاء الاصطناعي في مساحة العمل.");
  return new Error(`فشل التفريغ (${status}): ${body.slice(0, 200)}`);
}

export async function fetchAudio(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("تعذر تنزيل الملف الصوتي من المصدر.");
  const blob = await response.blob();
  if (blob.size === 0) throw new Error("الملف الصوتي فارغ.");
  if (blob.size > 200 * 1024 * 1024) throw new Error("حجم الملف الصوتي يتجاوز الحد المسموح.");
  return blob;
}

type RawSegment = { start?: number; end?: number; text?: string };

export async function transcribeAudio(
  audio: Blob,
  filename: string,
): Promise<{ text: string; segments: Segment[]; model: string; duration: number | null }> {
  const model = "openai/gpt-4o-transcribe";
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", model);
  form.append("language", "ar");
  form.append("response_format", "verbose_json");

  let response = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });

  if (!response.ok && response.status === 400) {
    // Some models reject verbose_json; retry with plain json.
    const fallback = new FormData();
    fallback.append("file", audio, filename);
    fallback.append("model", model);
    fallback.append("language", "ar");
    response = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}` },
      body: fallback,
    });
  }

  if (!response.ok) throw gatewayError(response.status, await response.text());

  const payload = (await response.json()) as {
    text?: string;
    duration?: number;
    segments?: RawSegment[];
  };
  const text = (payload.text ?? "").trim();
  if (!text) throw new Error("لم يُنتج النموذج أي نص من هذا الملف.");

  const duration = typeof payload.duration === "number" ? payload.duration : null;
  const raw = payload.segments ?? [];
  const segments: Segment[] = raw.length
    ? raw.map((segment, idx) => ({
        idx,
        start_ms: Math.round((segment.start ?? 0) * 1000),
        end_ms: Math.round((segment.end ?? segment.start ?? 0) * 1000),
        text: (segment.text ?? "").trim(),
      }))
    : splitTextIntoSegments(text, duration ?? 0);

  return { text, segments: segments.filter((s) => s.text.length > 0), model, duration };
}

// Fallback when the model returns no timestamps: split on sentence boundaries
// and distribute the known duration proportionally to sentence length.
export function splitTextIntoSegments(text: string, durationSeconds: number): Segment[] {
  const parts = text
    .split(/(?<=[.!?؟،:]|\n)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return [];
  const totalChars = parts.reduce((sum, part) => sum + part.length, 0);
  const totalMs = Math.max(1, Math.round(durationSeconds * 1000));
  let cursor = 0;
  return parts.map((part, idx) => {
    const span = Math.max(500, Math.round((part.length / totalChars) * totalMs));
    const start = cursor;
    cursor = Math.min(totalMs, start + span);
    return { idx, start_ms: start, end_ms: cursor, text: part };
  });
}

const DIALECT_HINT: Record<string, string> = {
  msa: "العربية الفصحى",
  gulf: "اللهجة الخليجية",
  egyptian: "اللهجة المصرية",
  levantine: "اللهجة الشامية",
  maghrebi: "اللهجة المغاربية",
};

export async function refineSegments(
  segments: Segment[],
  dialect: string,
): Promise<Segment[]> {
  if (!segments.length) return segments;
  const hint = DIALECT_HINT[dialect] ?? DIALECT_HINT["msa"];
  const payload = segments.map((s) => ({ i: s.idx, t: s.text }));

  try {
    const response = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              `أنت محرر نصوص عربية. النص مفرَّغ من بودكاست بـ${hint}. ` +
              "صحّح الترقيم والإملاء وأزل كلمات الحشو مع الحفاظ على المعنى واللهجة. " +
              "أعد JSON فقط بالشكل {\"segments\":[{\"i\":رقم,\"t\":\"النص\"}]} بنفس عدد المقاطع وبنفس الفهارس.",
          },
          { role: "user", content: JSON.stringify({ segments: payload }) },
        ],
      }),
    });
    if (!response.ok) return segments;
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const json = content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as { segments?: { i: number; t: string }[] };
    const map = new Map((parsed.segments ?? []).map((s) => [s.i, s.t]));
    if (map.size !== segments.length) return segments;
    return segments.map((s) => ({ ...s, text: (map.get(s.idx) ?? s.text).trim() || s.text }));
  } catch {
    return segments;
  }
}
