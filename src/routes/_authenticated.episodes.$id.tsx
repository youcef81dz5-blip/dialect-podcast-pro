import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/episodes/$id")({
  head: () => ({
    meta: [
      { title: "نص الحلقة — صدى" },
      { name: "description", content: "اعرض نص الحلقة العربي مع الطوابع الزمنية لكل مقطع." },
      { property: "og:title", content: "نص الحلقة — صدى" },
      { property: "og:description", content: "نص عربي منقّح مقسّم إلى مقاطع زمنية." },
    ],
  }),
  component: EpisodeDetail,
});

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function EpisodeDetail() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["episode", id],
    refetchInterval: (query) =>
      query.state.data?.episode?.status === "processing" ||
      query.state.data?.episode?.status === "queued"
        ? 5000
        : false,
    queryFn: async () => {
      const { data: episode, error } = await supabase
        .from("episodes")
        .select("id, title, status, dialect, error_message, duration_seconds")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;

      const { data: transcript } = await supabase
        .from("transcripts")
        .select("id")
        .eq("episode_id", id)
        .eq("language", "ar")
        .maybeSingle();

      let segments: { id: string; idx: number; start_ms: number; end_ms: number; text: string }[] = [];
      if (transcript) {
        const { data: rows, error: segError } = await supabase
          .from("transcript_segments")
          .select("id, idx, start_ms, end_ms, text")
          .eq("transcript_id", transcript.id)
          .order("idx");
        if (segError) throw segError;
        segments = rows ?? [];
      }
      return { episode, segments };
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-4xl items-center justify-center px-6 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="ms-2">جارٍ التحميل…</span>
      </main>
    );
  }

  if (!data?.episode) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-xl font-bold">الحلقة غير موجودة</h1>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/app">العودة إلى الحلقات</Link>
        </Button>
      </main>
    );
  }

  const { episode, segments } = data;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app">
          <ArrowRight className="size-4" />
          الحلقات
        </Link>
      </Button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{episode.title}</h1>
        <Badge variant={episode.status === "failed" ? "destructive" : "secondary"}>
          {episode.status === "ready"
            ? "جاهزة"
            : episode.status === "processing"
              ? "قيد المعالجة"
              : episode.status === "failed"
                ? "فشلت"
                : "في الانتظار"}
        </Badge>
      </div>

      {episode.error_message && (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {episode.error_message}
        </p>
      )}

      {segments.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {episode.status === "processing"
            ? "جارٍ التفريغ… ستظهر المقاطع هنا تلقائياً."
            : "لا يوجد نص لهذه الحلقة بعد."}
        </p>
      ) : (
        <ol className="mt-8 space-y-3">
          {segments.map((segment) => (
            <li key={segment.id} className="flex gap-4 rounded-xl border bg-card p-4">
              <span className="shrink-0 font-mono text-xs text-muted-foreground" dir="ltr">
                {formatTime(segment.start_ms)}
              </span>
              <p className="leading-relaxed">{segment.text}</p>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
