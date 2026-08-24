import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "الأسعار — صدى لتفريغ وترجمة البودكاست" },
      {
        name: "description",
        content: "خطة مجانية بـ 30 دقيقة شهرياً وخطة احترافية بـ 600 دقيقة مع ترجمة وتصدير غير محدود.",
      },
      { property: "og:title", content: "الأسعار — صدى" },
      { property: "og:description", content: "قارن بين الخطة المجانية والاحترافية لتفريغ وترجمة حلقاتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const PLANS = [
  {
    name: "مجاني",
    price: "0",
    period: "شهرياً",
    highlight: false,
    features: [
      "30 دقيقة تفريغ شهرياً",
      "دعم كل اللهجات العربية",
      "ترجمة إنجليزية للمقاطع",
      "تصدير SRT / VTT / TXT",
    ],
  },
  {
    name: "احترافي",
    price: "19$",
    period: "شهرياً",
    highlight: true,
    features: [
      "600 دقيقة تفريغ شهرياً",
      "أولوية في المعالجة",
      "تصدير ثنائي اللغة",
      "دعم عبر البريد خلال 24 ساعة",
    ],
  },
];

function Pricing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <AudioLines className="size-6 text-primary" />
          <span className="text-lg font-bold">صدى</span>
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link to={user ? "/app" : "/auth"}>{user ? "لوحة التحكم" : "تسجيل الدخول"}</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
        <h1 className="text-center text-3xl font-bold md:text-4xl">خطط بسيطة حسب دقائقك</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          ابدأ مجاناً بـ 30 دقيقة شهرياً، وارفع الحد حين ينمو إنتاجك. يتجدد الرصيد تلقائياً كل شهر.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlight
                  ? "rounded-3xl border-2 border-primary bg-card p-8"
                  : "rounded-3xl border bg-card p-8"
              }
            >
              {plan.highlight && (
                <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  الأكثر ملاءمة للبودكاسترز
                </span>
              )}
              <h2 className="mt-4 text-xl font-bold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-bold">
                {plan.price}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ {plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild={!plan.highlight}
                className="mt-8 w-full"
                variant={plan.highlight ? "default" : "outline"}
                disabled={plan.highlight}
              >
                {plan.highlight ? (
                  <span>الترقية قريباً</span>
                ) : (
                  <Link to={user ? "/app" : "/auth"}>ابدأ الآن مجاناً</Link>
                )}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          الدفع الإلكتروني قيد الإعداد؛ حتى ذلك الحين كل الحسابات على الخطة المجانية بـ 30 دقيقة شهرياً.
        </p>
      </main>
    </div>
  );
}
