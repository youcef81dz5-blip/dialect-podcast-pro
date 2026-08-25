import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, Download, Languages, Loader2, WandSparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { translateEpisode } from "@/lib/translation.functions";
import { convertEpisodeToMsa } from "@/lib/msa.functions";
import { downloadText, safeFileName, toSrt, toTxt, toVtt, type SubtitleCue } from "@/lib/subtitles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/episodes/$id")({
  head: () => ({
    meta: [
      { title: "نص الحلقة — صدى" },
      { name: "description", content: "اقرأ وحرّر نص التفريغ العربي وترجمته الإنجليزية، وصدّرها SRT/VTT/TXT." },
      { property: "og:title", content: "نص الحلقة — صدى" },
      { property: "og:description", content: "تفريغ عربي منقّح وترجمة إنجليزية قابلة للتحرير والتصدير." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EpisodeTranscript,
});

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function EpisodeTranscript() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const runTranslate = useServerFn(translateEpisode);
  const runMsa = useServerFn(convertEpisodeToMsa);


  const { data, isLoading } = useQuery({
    queryKey: ["episode-transcript", id],
    queryFn: async () => {
      const { data: episode, error: episodeError } = await supabase
        .from("episodes")
        .select("id, title, status, dialect, error_message")
        .eq("id", id)
        .maybeSingle();
      if (episodeError) throw episodeError;

      const { data: transcript, error: transcriptError } = await supabase
        .from("transcripts")
        .select("id")
        .eq("episode_id", id)
        .maybeSingle();
      if (transcriptError) throw transcriptError;

      if (!transcript) return { episode, segments: [], translations: {} as Record<number, { id: string; text: string }> };

      const { data: segments, error: segmentsError } = await supabase
        .from("transcript_segments")
        .select("id, idx, start_ms, end_ms, text")
        .eq("transcript_id", transcript.id)
        .order("idx", { ascending: true });
      if (segmentsError) throw segmentsError;

      const { data: translation } = await supabase
        .from("translations")
        .select("id")
        .eq("transcript_id", transcript.id)
        .eq("target_language", "en")
        .maybeSingle();

      const translations: Record<number, { id: string; text: string }> = {};
      if (translation) {
        const { data: rows } = await supabase
          .from("translation_segments")
          .select("id, idx, text")
          .eq("translation_id", translation.id)
          .order("idx", { ascending: true });
        for (const row of rows ?? []) translations[row.idx] = { id: row.id, text: row.text };
      }

      return { episode, segments: segments ?? [], translations };
    },
  });

  const save = useMutation({
    mutationFn: async ({
      table,
      rowId,
      text,
    }: {
      table: "transcript_segments" | "translation_segments";
      rowId: string;
      text: string;
    }) => {
      const { error } = await supabase.from(table).update({ text }).eq("id", rowId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ التعديل.");
      void queryClient.invalidateQueries({ queryKey: ["episode-transcript", id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const translate = useMutation({
    mutationFn: () => runTranslate({ data: { episodeId: id } }),
    onSuccess: () => {
      toast.success("تمت الترجمة إلى الإنجليزية.");
      void queryClient.invalidateQueries({ queryKey: ["episode-transcript", id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-3xl items-center justify-center px-6 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="ms-2">جارٍ التحميل…</span>
      </main>
    );
  }

  const episode = data?.episode;
  const segments = data?.segments ?? [];
  const translations = data?.translations ?? {};
  const hasTranslation = Object.keys(translations).length > 0;

  const cues: SubtitleCue[] = segments.map((segment) => ({
    start_ms: segment.start_ms,
    end_ms: segment.end_ms,
    text: segment.text,
    translation: translations[segment.idx]?.text,
  }));

  const englishCues: SubtitleCue[] = cues.map((cue) => ({
    start_ms: cue.start_ms,
    end_ms: cue.end_ms,
    text: cue.translation ?? cue.text,
  }));

  const base = safeFileName(episode?.title ?? "episode");

  const exportFile = (kind: "srt" | "vtt" | "txt", mode: "ar" | "en" | "both") => {
    const source = mode === "en" ? englishCues : cues;
    const bilingual = mode === "both";
    const render = kind === "srt" ? toSrt : kind === "vtt" ? toVtt : toTxt;
    downloadText(`${base}-${mode}.${kind}`, render(source, bilingual));
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app">
          <ArrowRight className="size-4" />
          رجوع إلى الحلقات
        </Link>
      </Button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{episode?.title ?? "حلقة"}</h1>
        {segments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={translate.isPending}
              onClick={() => translate.mutate()}
            >
              {translate.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Languages className="size-4" />
              )}
              {hasTranslation ? "إعادة الترجمة" : "ترجمة إنجليزية"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="size-4" />
                  تصدير
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>العربية</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => exportFile("srt", "ar")}>SRT عربي</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportFile("vtt", "ar")}>VTT عربي</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportFile("txt", "ar")}>TXT عربي</DropdownMenuItem>
                {hasTranslation && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>الإنجليزية</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => exportFile("srt", "en")}>SRT إنجليزي</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportFile("vtt", "en")}>VTT إنجليزي</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportFile("txt", "en")}>TXT إنجليزي</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>ثنائي اللغة</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => exportFile("srt", "both")}>SRT ثنائي</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportFile("vtt", "both")}>VTT ثنائي</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportFile("txt", "both")}>TXT ثنائي</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {episode?.error_message && (
        <p className="mt-2 text-sm text-destructive">{episode.error_message}</p>
      )}

      {segments.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          لا يوجد نص بعد. شغّل التفريغ من صفحة الحلقات.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {segments.map((segment) => {
            const translated = translations[segment.idx];
            return (
              <li key={segment.id} className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {formatTime(segment.start_ms)} — {formatTime(segment.end_ms)}
                </p>
                <div className={translated ? "mt-2 grid gap-3 md:grid-cols-2" : "mt-2"}>
                  <Textarea
                    className="min-h-16 resize-y"
                    defaultValue={segment.text}
                    onBlur={(e) => {
                      const text = e.target.value.trim();
                      if (text && text !== segment.text) {
                        save.mutate({ table: "transcript_segments", rowId: segment.id, text });
                      }
                    }}
                  />
                  {translated && (
                    <Textarea
                      dir="ltr"
                      className="min-h-16 resize-y text-left"
                      defaultValue={translated.text}
                      onBlur={(e) => {
                        const text = e.target.value.trim();
                        if (text && text !== translated.text) {
                          save.mutate({ table: "translation_segments", rowId: translated.id, text });
                        }
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
