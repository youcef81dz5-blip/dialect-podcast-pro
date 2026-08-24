import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AudioLines, FileText, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { transcribeEpisode } from "@/lib/transcription.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
  queued: { label: "في الانتظار", variant: "secondary" },
  processing: { label: "قيد المعالجة", variant: "default" },
  ready: { label: "جاهزة", variant: "outline" },
  failed: { label: "فشلت", variant: "destructive" },
};

const DIALECT_LABEL: Record<string, string> = {
  msa: "الفصحى",
  gulf: "الخليجية",
  egyptian: "المصرية",
  levantine: "الشامية",
  maghrebi: "المغاربية",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function EpisodeList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: episodes, isLoading } = useQuery({
    queryKey: ["episodes", user?.id],
    enabled: !!user,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, title, status, dialect, duration_seconds, source_type, storage_path, error_message, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (episode: { id: string; storage_path: string | null }) => {
      if (episode.storage_path) {
        await supabase.storage.from("episode-audio").remove([episode.storage_path]);
      }
      const { error } = await supabase.from("episodes").delete().eq("id", episode.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الحلقة.");
      void queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border p-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="ms-2">جارٍ تحميل الحلقات…</span>
      </div>
    );
  }

  if (!episodes?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 p-12 text-center">
        <Upload className="size-8 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">لا توجد حلقات بعد</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          ارفع ملفاً صوتياً أو الصق رابط حلقة لتضاف إلى قائمة الانتظار.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {episodes.map((episode) => {
        const status = STATUS_LABEL[episode.status] ?? STATUS_LABEL["queued"]!;
        return (
          <li
            key={episode.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4"
          >
            <AudioLines className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{episode.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {DIALECT_LABEL[episode.dialect] ?? episode.dialect} ·{" "}
                {formatDuration(episode.duration_seconds)} ·{" "}
                {episode.source_type === "upload" ? "ملف مرفوع" : "رابط"}
              </p>
              {episode.error_message && (
                <p className="mt-1 text-xs text-destructive">{episode.error_message}</p>
              )}
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="حذف الحلقة"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate({ id: episode.id, storage_path: episode.storage_path })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
