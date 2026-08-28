/** استخراج المسار الصوتي من ملف فيديو داخل المتصفح وتحويله إلى WAV أحادي 16kHz */

const TARGET_RATE = 16000;

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(file.name);
}

export async function extractAudioFromVideo(
  file: File,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const Ctx: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error("متصفحك لا يدعم استخراج الصوت من الفيديو.");
  const ctx = new Ctx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(arrayBuffer);
  } catch {
    throw new Error("تعذّر استخراج الصوت من هذا الفيديو. جرّب صيغة MP4 أو WEBM.");
  } finally {
    void ctx.close();
  }

  const frames = Math.ceil(decoded.duration * TARGET_RATE);
  const OfflineCtx: typeof OfflineAudioContext =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offline = new OfflineCtx(1, frames, TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();

  return {
    blob: encodeWav(rendered.getChannelData(0), TARGET_RATE),
    durationSeconds: Math.round(decoded.duration),
  };
}
