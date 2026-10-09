import { useEffect, useRef, useState } from "react";
import { Download, Film, Loader2, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { safeFileName, toVtt, type SubtitleCue } from "@/lib/subtitles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type Version = { value: string; label: string; cues: SubtitleCue[]; language: string };
const LIMIT = 200 * 1024 * 1024;

export function VideoSubtitleDialog({ title, versions }: { title: string; versions: Version[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("ar");
  const [mode, setMode] = useState("lossless");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [track, setTrack] = useState("");
  const [result, setResult] = useState<{ url: string; extension: string } | null>(null);
  const [dimensions, setDimensions] = useState("");
  const controller = useRef<AbortController | null>(null);
  const selected = versions.find((item) => item.value === version) ?? versions[0];

  useEffect(() => {
    if (!file) { setSource(""); return; }
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([toVtt(selected.cues)], { type: "text/vtt" }));
    setTrack(url);
    return () => URL.revokeObjectURL(url);
  }, [selected]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  useEffect(() => () => controller.current?.abort(), []);

  const clearResult = () => { setResult(null); setError(""); setProgress(0); };
  const merge = async () => {
    if (!file || !selected || busy) return;
    clearResult();
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const { mergeVideoSubtitles } = await import("@/lib/video-subtitles");
      const blob = await mergeVideoSubtitles({ file, cues: selected.cues, language: selected.language, mode: mode === "burn" ? "burn" : "lossless", signal: abort.signal, onProgress: setProgress, onStage: setStage });
      if (!abort.signal.aborted) setResult({ url: URL.createObjectURL(blob), extension: mode === "burn" ? "mp4" : "mkv" });
    } catch (cause) {
      if (!abort.signal.aborted) setError(t(cause instanceof Error ? cause.message : "تعذّر إنشاء الفيديو المترجم."));
    } finally {
      controller.current = null;
      setBusy(false);
    }
  };

  return <Dialog open={open} onOpenChange={(next) => { if (!next) controller.current?.abort(); setOpen(next); }}>
    <DialogTrigger asChild><Button variant="outline"><Film className="size-4" />{t("دمج الفيديو مع الترجمة")}</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{t("دمج الفيديو مع الترجمة")}</DialogTitle>
        <DialogDescription>{t("اختر الفيديو الأصلي المطابق لهذه الحلقة. تبقى أبعاد الفيديو الأصلية دون تصغير.")}</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="subtitle-video">{t("الفيديو الأصلي — حتى 200 ميجابايت")}</Label>
        <Input id="subtitle-video" type="file" accept="video/*,.mp4,.mov,.mkv,.webm,.m4v" disabled={busy} onChange={(event) => {
          clearResult(); setDimensions("");
          const next = event.target.files?.[0] ?? null;
          if (next && next.size > LIMIT) { setFile(null); setError(t("حجم الملف يتجاوز 200 ميجابايت.")); return; }
          setFile(next);
        }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="video-language">{t("لغة الترجمة")}</Label>
          <Select value={selected?.value} disabled={busy} onValueChange={(value) => { setVersion(value); clearResult(); }}><SelectTrigger id="video-language"><SelectValue /></SelectTrigger><SelectContent>{versions.map((item) => <SelectItem key={item.value} value={item.value}>{t(item.label)}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-2"><Label htmlFor="video-mode">{t("نوع الدمج")}</Label>
          <Select value={mode} disabled={busy} onValueChange={(value) => { setMode(value); clearResult(); }}><SelectTrigger id="video-mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lossless">{t("الجودة الأصلية — MKV")}</SelectItem><SelectItem value="burn">{t("كتابة ثابتة — MP4")}</SelectItem></SelectContent></Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t(mode === "lossless" ? "ترجمة قابلة للتشغيل والإيقاف؛ الصورة والصوت دون إعادة ترميز. يُفتح في مشغّل يدعم MKV مثل VLC." : "ترجمة ظاهرة دائماً للنشر، بنفس الأبعاد وبجودة عالية؛ يتطلب إعادة ترميز وقد يستغرق وقتاً طويلاً.")}</p>
      {source && <div className="space-y-2">
        <video key={source} controls playsInline preload="metadata" className="max-h-64 w-full rounded-md bg-muted" onLoadedMetadata={(event) => { const video = event.currentTarget; setDimensions(`${video.videoWidth} × ${video.videoHeight}`); }} onError={() => setError(t("المعاينة غير متاحة لهذا التنسيق؛ يمكنك تجربة دمج الجودة الأصلية."))}>
          <source src={source} />
          {track && selected && <track key={track} kind="subtitles" src={track} srcLang={selected.language === "ara" ? "ar" : "en"} label={t(selected.label)} default />}
        </video>
        {dimensions && <p className="text-xs text-muted-foreground">{t("الأبعاد الأصلية")}: <span dir="ltr">{dimensions}</span></p>}
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {busy && <div className="space-y-2" role="status"><p className="text-sm">{t(stage === "loading" ? "جارٍ تجهيز معالجة الفيديو…" : "جارٍ دمج الترجمة…")} {stage === "processing" ? `${progress}%` : ""}</p><Progress value={progress} /></div>}
      {result && <div className="space-y-3">
        <p role="status" className="text-sm">{t("الفيديو المترجم جاهز للتنزيل.")}</p>
        {result.extension === "mp4" && <video controls playsInline src={result.url} className="max-h-64 w-full rounded-md bg-muted" />}
        <Button asChild className="w-full"><a href={result.url} download={`${safeFileName(title)}-${version}.${result.extension}`}><Download className="size-4" />{t("تنزيل الفيديو المترجم")}</a></Button>
      </div>}
      <div className="flex gap-2"><Button className="flex-1" disabled={!file || !selected || busy} onClick={() => void merge()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-4" />}{t("إنشاء الفيديو المترجم")}</Button>{busy && <Button variant="outline" onClick={() => controller.current?.abort()}><X className="size-4" />{t("إلغاء")}</Button>}</div>
    </DialogContent>
  </Dialog>;
}