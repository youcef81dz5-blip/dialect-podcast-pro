export type SubtitleCue = {
  start_ms: number;
  end_ms: number;
  text: string;
  translation?: string | undefined;
};

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0");
}

function stamp(ms: number, sep: "," | ".") {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const msPart = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(msPart, 3)}`;
}

function body(cue: SubtitleCue, bilingual: boolean) {
  return bilingual && cue.translation ? `${cue.text}\n${cue.translation}` : cue.text;
}

export function toSrt(cues: SubtitleCue[], bilingual = false) {
  return cues
    .map((cue, i) => `${i + 1}\n${stamp(cue.start_ms, ",")} --> ${stamp(cue.end_ms, ",")}\n${body(cue, bilingual)}\n`)
    .join("\n");
}

export function toVtt(cues: SubtitleCue[], bilingual = false) {
  return (
    "WEBVTT\n\n" +
    cues
      .map((cue) => `${stamp(cue.start_ms, ".")} --> ${stamp(cue.end_ms, ".")}\n${body(cue, bilingual)}\n`)
      .join("\n")
  );
}

export function toTxt(cues: SubtitleCue[], bilingual = false) {
  return cues.map((cue) => body(cue, bilingual)).join("\n\n");
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function safeFileName(title: string) {
  return (title || "episode").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 60) || "episode";
}
