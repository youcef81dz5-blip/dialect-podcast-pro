import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";
import workerURL from "./video-worker?worker&url";
import fontURL from "@/assets/Tajawal-Regular.ttf?url";
import { toSrt, type SubtitleCue } from "./subtitles";

export type VideoExportMode = "lossless" | "burn";

export async function mergeVideoSubtitles(options: {
  file: File;
  cues: SubtitleCue[];
  mode: VideoExportMode;
  language: string;
  signal: AbortSignal;
  onProgress: (value: number) => void;
  onStage: (stage: "loading" | "processing") => void;
}): Promise<Blob> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  const stop = () => ffmpeg.terminate();
  options.signal.addEventListener("abort", stop, { once: true });
  try {
    options.signal.throwIfAborted();
    options.onStage("loading");
    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL: workerURL });
    options.signal.throwIfAborted();
    const ext = options.file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "mp4";
    const input = `input.${ext}`;
    await ffmpeg.writeFile(input, new Uint8Array(await options.file.arrayBuffer()));
    await ffmpeg.writeFile("captions.srt", toSrt(options.cues));
    ffmpeg.on("progress", ({ progress }) => options.onProgress(Math.min(99, Math.max(0, Math.round(progress * 100)))));
    const lossless = options.mode === "lossless";
    const output = lossless ? "output.mkv" : "output.mp4";
    let args: string[];
    if (lossless) {
      args = ["-i", input, "-i", "captions.srt", "-map", "0:v:0", "-map", "0:a?", "-map", "1:0", "-c:v", "copy", "-c:a", "copy", "-c:s", "srt", "-metadata:s:s:0", `language=${options.language}`, "-disposition:s:0", "default", output];
    } else {
      const fontResponse = await fetch(fontURL, { signal: options.signal });
      if (!fontResponse.ok) throw new Error("تعذّر تحميل الخط العربي.");
      await ffmpeg.createDir("fonts");
      await ffmpeg.writeFile("fonts/Tajawal-Regular.ttf", new Uint8Array(await fontResponse.arrayBuffer()));
      args = ["-i", input, "-map", "0:v:0", "-map", "0:a?", "-vf", "subtitles=captions.srt:fontsdir=fonts:force_style='FontName=Tajawal,FontSize=20,Outline=1,Shadow=0,MarginV=20'", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output];
    }
    options.onStage("processing");
    const code = await ffmpeg.exec(args);
    options.signal.throwIfAborted();
    if (code !== 0) throw new Error("تعذّر دمج هذا الفيديو. جرّب خيار الجودة الأصلية أو ملف MP4 آخر.");
    const data = await ffmpeg.readFile(output);
    if (typeof data === "string" || data.byteLength === 0) throw new Error("تعذّر إنشاء الفيديو المترجم.");
    options.onProgress(100);
    return new Blob([new Uint8Array(data)], { type: lossless ? "video/x-matroska" : "video/mp4" });
  } finally {
    options.signal.removeEventListener("abort", stop);
    ffmpeg.terminate();
  }
}