import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines, Languages, FileDown, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صدى — تفريغ وترجمة البودكاست العربي آلياً" },
      {
        name: "description",
        content:
          "ارفع حلقة بودكاست عربية واحصل على نص منقّح يدعم اللهجات، ترجمة إنجليزية، وملفات SRT/VTT/TXT جاهزة.",
      },
      { property: "og:title", content: "صدى — تفريغ وترجمة البودكاست العربي آلياً" },
      {
        property: "og:description",
        content: "تفريغ عربي دقيق مع دعم اللهجات، ترجمة إنجليزية، وتصدير ملفات الترجمة.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Mic2,
    title: "تفريغ يفهم لهجتك",
    body: "خليجي، مصري، شامي، مغربي أو فصحى — النص يُنقّح بعد التفريغ بترقيم وإزالة الحشو.",
  },
  {
    icon: Languages,
    title: "ترجمة إنجليزية مطابقة",
    body: "كل مقطع يُترجم مع الحفاظ على توقيته، جاهز للنشر لجمهور عالمي.",
  },
  {
    icon: FileDown,
    title: "تصدير فوري",
    body: "ملفات SRT وVTT وTXT، بالعربية أو الإنجليزية أو ثنائية اللغة.",
  },
];

function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <AudioLines className="size-6 text-primary" />
          <span className="text-lg font-bold">صدى</span>
        </div>
        <Button asChild variant={user ? "default" : "outline"} size="sm" disabled={loading}>
          <Link to={user ? "/app" : "/auth"}>{user ? "لوحة التحكم" : "تسجيل الدخول"}</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 text-center">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            لصنّاع المحتوى العربي
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-tight md:text-6xl">
            حلقتك الصوتية تتحول إلى نص وترجمة في دقائق
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            ارفع ملفاً صوتياً أو رابط حلقة، واحصل على تفريغ عربي منقّح يراعي اللهجة، وترجمة
            إنجليزية، وملفات ترجمة جاهزة للنشر.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={user ? "/app" : "/auth"}>ابدأ مجاناً — 30 دقيقة شهرياً</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 text-right">
              <f.icon className="size-6 text-accent" />
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        صدى — أداة تفريغ وترجمة البودكاست العربي
      </footer>
    </div>
  );
}
