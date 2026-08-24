import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { UploadEpisodeDialog } from "@/components/UploadEpisodeDialog";
import { EpisodeList } from "@/components/EpisodeList";


export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — صدى" },
      { name: "description", content: "حلقاتك، حالة التفريغ، والدقائق المتبقية في اشتراكك." },
      { property: "og:title", content: "لوحة التحكم — صدى" },
      { property: "og:description", content: "تابع حلقاتك ورصيد الدقائق في حسابك." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status, minutes_quota, minutes_used, current_period_end")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const used = Number(subscription?.minutes_used ?? 0);
  const quota = subscription?.minutes_quota ?? 30;
  const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">حلقاتي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ارفع حلقة لتبدأ التفريغ والترجمة.
          </p>
        </div>
        <UploadEpisodeDialog minutesLeft={Math.max(0, quota - used)} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 md:col-span-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            رصيد الدقائق
          </div>
          <p className="mt-3 text-2xl font-bold">
            {Math.max(0, quota - used).toFixed(0)}{" "}
            <span className="text-sm font-normal text-muted-foreground">من {quota} دقيقة</span>
          </p>
          <Progress value={pct} className="mt-4" />
          <p className="mt-3 text-xs text-muted-foreground">
            الخطة الحالية: {subscription?.plan === "pro" ? "احترافي" : "مجاني"}
          </p>
          {quota - used <= 0 && (
            <p className="mt-2 text-xs text-destructive">
              انتهى رصيدك.{" "}
              <Link to="/pricing" className="underline">
                رقِّ خطتك
              </Link>{" "}
              للمتابعة.
            </p>
          )}

        </div>

        <div className="md:col-span-2">
          <EpisodeList />
        </div>
      </div>

    </main>
  );
}
