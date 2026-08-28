import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, Link2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/lib/media-resolve.functions";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIALECTS = [
  { value: "msa", label: "الفصحى" },
  { value: "gulf", label: "الخليجية" },
  { value: "egyptian", label: "المصرية" },
  { value: "levantine", label: "الشامية" },
  { value: "maghrebi", label: "المغاربية" },
] as const;

type Dialect = (typeof DIALECTS)[number]["value"];

const MAX_BYTES = 200 * 1024 * 1024;

function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.addEventListener("loadedmetadata", () =>
      done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null),
    );
    audio.addEventListener("error", () => done(null));
    audio.src = url;
    window.setTimeout(() => done(null), 8000);
  });
}

export function UploadEpisodeDialog({ minutesLeft }: { minutesLeft: number }) {
  const { user } = useAuth();
  const t = useT();
  const queryClient = useQueryClient();
  const resolveMedia = useServerFn(resolveMediaUrl);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dialect, setDialect] = useState<Dialect>("msa");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState<"upload" | "url">("upload");

  const reset = () => {
    setTitle("");
    setFile(null);
    setUrl("");
    setDialect("msa");
    setTab("upload");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t("يجب تسجيل الدخول."));
      if (minutesLeft <= 0) throw new Error(t("انتهى رصيد الدقائق في خطتك الحالية."));

      let storagePath: string | null = null;
      let sourceUrl: string | null = null;
      let duration: number | null = null;
      let resolvedTitle: string | null = null;
      const finalTitle = title.trim();


      if (tab === "upload") {
        if (!file) throw new Error(t("اختر ملفاً صوتياً أولاً."));
        if (file.size > MAX_BYTES) throw new Error(t("حجم الملف يتجاوز 200 ميجابايت."));
        duration = await readDuration(file);
        if (duration && duration / 60 > minutesLeft) {
          throw new Error(t("مدة الحلقة تتجاوز رصيد الدقائق المتبقي."));
        }
        const ext = file.name.split(".").pop() ?? "mp3";
        storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("episode-audio")
          .upload(storagePath, file, { contentType: file.type || "audio/mpeg" });
        if (uploadError) throw uploadError;
      } else {
        const trimmed = url.trim();
        if (!/^https:\/\/\S+$/i.test(trimmed)) {
          throw new Error(t("أدخل رابطاً صالحاً يبدأ بـ https://"));
        }
        const resolved = await resolveMedia({ data: { url: trimmed } });
        sourceUrl = trimmed;
        storagePath = resolved.storagePath;
        duration = resolved.durationSeconds;
        if (!title.trim() && resolved.title) resolvedTitle = resolved.title;
        if (duration && duration / 60 > minutesLeft) {
          throw new Error(t("مدة الحلقة تتجاوز رصيد الدقائق المتبقي."));
        }
      }


      const { data: episode, error } = await supabase
        .from("episodes")
        .insert({
          user_id: user.id,
          title: finalTitle || resolvedTitle || (file?.name ?? t("حلقة بدون عنوان")),
          source_type: tab,
          source_url: sourceUrl,
          storage_path: storagePath,
          duration_seconds: duration,
          dialect,
          status: "queued",
        })
        .select("id")
        .single();
      if (error) throw error;
      return episode;
    },
    onSuccess: () => {
      toast.success(t("تمت إضافة الحلقة إلى قائمة الانتظار."));
      void queryClient.invalidateQueries({ queryKey: ["episodes"] });
      setOpen(false);
      reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" />
          {t("رفع حلقة")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-right">
          <DialogTitle>{t("حلقة جديدة")}</DialogTitle>
          <DialogDescription>
            {t("ارفع ملفاً صوتياً حتى 200 ميجابايت، أو الصق رابط يوتيوب / Apple Podcasts / خلاصة RSS / رابط صوتي مباشر ونستخرج الصوت تلقائياً.")}
          </DialogDescription>

        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "url")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="size-4" />
              {t("ملف صوتي")}
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="size-4" />
              {t("رابط")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4">
            <Label htmlFor="audio-file">{t("الملف الصوتي")}</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              className="mt-2"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </TabsContent>
          <TabsContent value="url" className="pt-4">
            <Label htmlFor="audio-url">{t("رابط الحلقة أو الفيديو")}</Label>
            <Input
              id="audio-url"
              dir="ltr"
              placeholder={t("https://youtube.com/watch?v=… أو رابط RSS/MP3")}
              className="mt-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("مدعوم: يوتيوب، Apple Podcasts، خلاصات RSS، وروابط MP3/M4A/WAV المباشرة.")}
            </p>
          </TabsContent>

        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="episode-title">{t("عنوان الحلقة")}</Label>
            <Input
              id="episode-title"
              className="mt-2"
              placeholder={t("مثال: الحلقة 12 — ريادة الأعمال")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("اللهجة")}</Label>
            <Select value={dialect} onValueChange={(v) => setDialect(v as Dialect)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIALECTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {t(d.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("رصيد الدقائق")}: {Math.max(0, minutesLeft).toFixed(0)}
        </p>

        <Button
          className="w-full"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          {mutation.isPending ? t("جارٍ الرفع…") : t("إضافة الحلقة")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
