import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, Download, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { deleteMyAccount, exportMyData } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات الحساب — صدى" },
      {
        name: "description",
        content: "صدّر بياناتك بصيغة JSON أو احذف حسابك وكل حلقاتك ونصوصك نهائياً.",
      },
      { property: "og:title", content: "إعدادات الحساب — صدى" },
      { property: "og:description", content: "تصدير البيانات وحذف الحساب في صدى." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const t = useT();
  const navigate = useNavigate();
  const runExport = useServerFn(exportMyData);
  const runDelete = useServerFn(deleteMyAccount);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");

  async function handleExport() {
    setExporting(true);
    try {
      const data = await runExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sada-account-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("تم تصدير بياناتك"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("تعذّر التصدير"));
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await runDelete();
      await supabase.auth.signOut();
      toast.success(t("تم حذف الحساب"));
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("تعذّر حذف الحساب"));
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-right">
      <Link
        to="/app"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        {t("العودة للوحة")}
      </Link>
      <div className="mt-4 flex justify-end">
        <LanguageSwitcher />
      </div>

      <h1 className="mt-4 text-2xl font-bold">{t("إعدادات الحساب")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

      <section className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">{t("تصدير بياناتي")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("ملف JSON يحتوي حلقاتك، النصوص، الترجمات، وبيانات اشتراكك.")}
        </p>
        <Button className="mt-4" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {t("تصدير JSON")}
        </Button>
      </section>

      <section className="mt-6 rounded-2xl border border-destructive/40 bg-card p-6">
        <h2 className="text-lg font-semibold text-destructive">{t("حذف الحساب")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("سيُحذف حسابك مع كل الملفات الصوتية والنصوص والترجمات نهائياً. لا يمكن التراجع.")}
        </p>
        <div className="mt-4 max-w-xs">
          <Label htmlFor="confirm" className="text-sm">
            {t("اكتب «حذف» للتأكيد")}
          </Label>
          <Input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2"
            placeholder={t("حذف")}
          />
        </div>
        <Button
          variant="destructive"
          className="mt-4"
          disabled={confirm.trim() !== t("حذف") || deleting}
          onClick={handleDelete}
        >
          {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          {t("حذف الحساب نهائياً")}
        </Button>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        {t("اطّلع على")}{" "}
        <Link to="/privacy" className="underline">
          {t("سياسة الخصوصية")}
        </Link>
        .
      </p>
    </main>
  );
}
