import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/episodes/$id")({
  head: () => ({
    meta: [
      { title: "نص الحلقة — صدى" },
      { name: "description", content: "اقرأ وحرّر نص التفريغ العربي لحلقتك مقطعاً بمقطع." },
      { property: "og:title", content: "نص الحلقة — صدى" },
      { property: "og:description", content: "تفريغ عربي منقّح بمقاطع زمنية قابلة للتحرير." },
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

      if (!transcript) return { episode, segments: [] };

      const { data: segments, error: segmentsError } = await supabase
        .from("transcript_segments")
        .select("id, idx, start_ms, end_ms, text")
        .eq("transcript_id", transcript.id)
        .order("idx", { ascending: true });
      if (segmentsError) throw segmentsError;

      return { episode, segments: segments ?? [] };
    },
  });

  const save = useMutation({
    mutationFn: async ({ segmentId, text }: { segmentId: string; text: string }) => {
      const { error } = await supabase
        .from("transcript_segments")
        .update({ text })
        .eq("id", segmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ التعديل.");
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app">
          <ArrowRight className="size-4" />
          رجوع إلى الحلقات
        </Link>
      </Button>

      <h1 className="mt-4 text-2xl font-bold">{episode?.title ?? "حلقة"}</h1>
      {episode?.error_message && (
        <p className="mt-2 text-sm text-destructive">{episode.error_message}</p>
      )}

      {segments.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          لا يوجد نص بعد. شغّل التفريغ من صفحة الحلقات.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {segments.map((segment) => (
            <li key={segment.id} className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground" dir="ltr">
                {formatTime(segment.start_ms)} — {formatTime(segment.end_ms)}
              </p>
              <Textarea
                className="mt-2 min-h-16 resize-y"
                defaultValue={segment.text}
                onBlur={(e) => {
                  const text = e.target.value.trim();
                  if (text && text !== segment.text) {
                    save.mutate({ segmentId: segment.id, text });
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
