import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AudioLines,
  Languages,
  FileDown,
  Mic2,
  Check,
  ArrowDown,
  Play,
  Sparkles,
  Upload,
  Globe,
  FileText,
  Phone,
} from "lucide-react";
import youcefInfoLogo from "@/assets/youcef-info-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const capabilities = [
  { icon: Upload, text: "رفع ملف صوتي أو لصق رابط يوتيوب / بودكاست" },
  { icon: Mic2, text: "تفريغ كامل للحلقة بالعربية مع دعم اللهجات" },
  { icon: Sparkles, text: "تحويل اللهجة العامية إلى العربية الفصحى المفهومة" },
  { icon: Globe, text: "ترجمة إنجليزية مطابقة للتوقيت الزمني" },
  { icon: FileText, text: "تصدير SRT / VTT / TXT بالعربية أو الإنجليزية أو الاثنين" },
  { icon: Check, text: "معالجة على دفعات لضمان اكتمال الحلقات الطويلة" },
];

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "ارفع أو الصق الرابط",
    body: "اختر ملفاً صوتياً من جهازك، أو ضع رابط يوتيوب أو خلاصة بودكاست.",
  },
  {
    number: "2",
    icon: Play,
    title: "يستخرج الصوت ويحفظه",
    body: "نحمّل الصوت إلى مخزن آمن ونحسب المدة بدقة قبل بدء المعالجة.",
  },
  {
    number: "3",
    icon: Mic2,
    title: "يفرّغ الحلقة كاملة",
    body: "نقسّم الحلقة لدفعات زمنية متداخلة لضمان عدم فقدان أي كلمة — حتى لو كانت ساعة كاملة.",
  },
  {
    number: "4",
    icon: Sparkles,
    title: "يترجم ويحوّل للفصحى",
    body: "كل مقطع يُترجم للإنجليزية ويُحوّل من اللهجة إلى العربية الفصحى المقروءة.",
  },
  {
    number: "5",
    icon: FileDown,
    title: "تصدير جاهز للنشر",
    body: "حمّل النصوص بصيغ SRT أو VTT أو TXT واستخدمها مباشرة على منصاتك.",
  },
];

function Landing() {
  const { user, loading } = useAuth();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <AudioLines className="size-6 text-primary" />
          <span className="text-lg font-bold">صدى</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/pricing">الأسعار</Link>
          </Button>
          <Button asChild variant={user ? "default" : "outline"} size="sm" disabled={loading}>
            <Link to={user ? "/app" : "/auth"}>{user ? "لوحة التحكم" : "تسجيل الدخول"}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  اكتشف كل ما يفعله
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">كل ما يفعله صدى</DialogTitle>
                  <DialogDescription className="text-right">
                    أداة واحدة لتفريغ وترجمة وتنقيح البودكاست العربي.
                  </DialogDescription>
                </DialogHeader>
                <ul className="mt-2 space-y-3">
                  {capabilities.map((cap) => (
                    <li key={cap.text} className="flex items-start gap-3 text-right">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <cap.icon className="size-4 text-primary" />
                      </div>
                      <span className="pt-0.5 text-sm leading-relaxed">{cap.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-start">
                  <Button asChild>
                    <Link to={user ? "/app" : "/auth"}>جربه الآن مجاناً</Link>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <button
            onClick={scrollToHowItWorks}
            className="mx-auto mt-12 flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>كيف يعمل؟</span>
            <ArrowDown className="size-4 animate-bounce" />
          </button>
        </section>

        {/* Problem + Solution */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card/50 p-6 text-right">
              <h2 className="text-lg font-semibold text-destructive">المشكلة</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                أدوات التفريغ العالمية ضعيفة بالعربية، وغالباً ما تُضيّع اللهجة أو تُخرج نصاً غير
                مقروء. صانع المحتوى العربي يضطر لقضاء ساعات في التصحيح اليدوي.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-right">
              <h2 className="text-lg font-semibold text-primary">الحل مع صدى</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                نموذج مخصّص للعربية واللهجات يفرّغ الحلقة كاملة، ثم يُحسّن النص ويترجمه ويحوّله
                للفصحى، لتنشر المحتوى بلهجتك الأصلية أو بلغة عالمية واضحة.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 text-right">
              <f.icon className="size-6 text-accent" />
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">كيف يعمل صدى؟</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                خطوات بسيطة من الرفع إلى التصدير، مع معالجة ذكية تضمن جودة النص.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-5">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border bg-card p-5 text-right"
                >
                  <span className="absolute -top-3 right-4 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.number}
                  </span>
                  <step.icon className="mt-2 size-6 text-accent" />
                  <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">جاهز لتوفير وقت التفريغ والترجمة؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            ابدأ بـ 30 دقيقة مجانية كل شهر، واكتشف كيف يُحوّل صدى حلقاتك إلى محتوى منشور.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={user ? "/app" : "/auth"}>ابدأ مجاناً</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>صدى — أداة تفريغ وترجمة البودكاست العربي</span>
            <Link to="/pricing" className="hover:text-foreground">
              الأسعار
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              سياسة الخصوصية
            </Link>
          </div>

          <a
            href="https://wa.me/213658576572"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border bg-card/50 px-4 py-3 transition-colors hover:bg-card"
          >
            <img
              src={youcefInfoLogo.url}
              alt="Youcef Info"
              className="size-10 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">تطوير وتشغيل</p>
              <p className="font-semibold text-foreground">Youcef Info</p>
              <p className="flex items-center gap-1 text-xs text-primary">
                <Phone className="size-3" />
                +213 658 57 65 72
              </p>
            </div>
          </a>
        </div>
      </footer>
    </div>
  );
}
