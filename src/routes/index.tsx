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
  Shield,
  Zap,
  Clock,
  HelpCircle,
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
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  {
    icon: Sparkles,
    title: "من اللهجة إلى الفصحى",
    body: "حوّل محتواك بالدارجة إلى عربية فصحى واضحة، وانشره لجمهور أوسع يفهمك في كل البلدان.",
  },
];

const capabilities = [
  { icon: Upload, text: "رفع ملف صوتي أو لصق رابط يوتيوب / بودكاست" },
  { icon: Mic2, text: "تفريغ كامل للحلقة بالعربية مع دعم اللهجات" },
  { icon: Sparkles, text: "تحويل اللهجة العامية إلى العربية الفصحى المفهومة" },
  { icon: Globe, text: "ترجمة إنجليزية مطابقة للتوقيت الزمني" },
  { icon: FileText, text: "تصدير SRT / VTT / TXT بالعربية أو الإنجليزية أو الاثنين" },
  { icon: Check, text: "معالجة على دفعات لضمان اكتمال الحلقات الطويلة" },
  { icon: Sparkles, text: "إضافة كتابة فصحى تحت الفيديو لتوسيع انتشار المحتوى" },
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

// Before/After comparison samples (real podcast excerpts, dialect -> MSA)
const beforeAfterSamples = {
  egyptian: {
    label: "اللهجة المصرية",
    whisper: "أنا بقول إن الـ AI ده مش هياخد مكانك، ده هياخد مكان اللي بيستخدم الـ AI",
    sada: "أقول إن الذكاء الاصطناعي لن يحلّ مكانك، بل سيحلّ مكان من لا يستخدمه.",
    wer: { whisper: "32%", sada: "9%" },
  },
  gulf: {
    label: "اللهجة الخليجية",
    whisper: "وش يقولون عن المنع، يالله الحين بنكلم عن شي ثاني",
    sada: "ما يقولونه عن المنع، فلنتحدث الآن عن موضوع آخر.",
    wer: { whisper: "38%", sada: "11%" },
  },
  levantine: {
    label: "اللهجة الشامية",
    whisper: "شو رأيك هلق بالموضوع، يعني بدك نحكي عنه ولا بدك شي تاني؟",
    sada: "ما رأيك الآن بالموضوع، هل تودّ أن نتحدث عنه أم تفضّل موضوعاً آخر؟",
    wer: { whisper: "28%", sada: "8%" },
  },
  maghrebi: {
    label: "اللهجة المغاربية",
    whisper: "هسه غادي نكمّلو، ولكن قبل نبداو خصني نقول حاجة مهمة",
    sada: "الآن سنواصل، لكن قبل أن نبدأ أحتاج أن أقول شيئاً مهماً.",
    wer: { whisper: "41%", sada: "13%" },
  },
};

const pricingPlans = [
  {
    name: "مجاني",
    price: "0",
    period: "مجاني للأبد",
    description: "للتجربة والاستخدام الخفيف",
    minutes: "30 دقيقة / شهر",
    features: [
      "تفريغ بدقة اللهجة الأساسية",
      "تحويل للدارجة → الفصحى",
      "تصدير SRT/VTT/TXT",
      "حفظ 5 حلقات فقط",
    ],
    cta: "ابدأ مجاناً",
    highlighted: false,
  },
  {
    name: "منشئ",
    price: "9",
    period: "USD / شهر",
    description: "للبودكاستر المستقل",
    minutes: "5 ساعات صوت / شهر",
    features: [
      "كل ميزات المجاني",
      "دقة أعلى على اللهجات الثقيلة",
      "ترجمة إنجليزية كاملة",
      "حفظ غير محدود للحلقات",
      "دعم بالبريد خلال 24 ساعة",
    ],
    cta: "جرّب 14 يوم مجاناً",
    highlighted: true,
  },
  {
    name: "احترافي",
    price: "19",
    period: "USD / شهر",
    description: "للقنوات النشطة واليوتيوبرز",
    minutes: "20 ساعة صوت / شهر",
    features: [
      "كل ميزات المنشئ",
      "أولوية في المعالجة",
      "فصل المتحدثين (Speaker diarization)",
      "توليد Show Notes بالعربي",
      "دعم مباشر عبر واتساب",
    ],
    cta: "جرّب 14 يوم مجاناً",
    highlighted: false,
  },
  {
    name: "استوديو",
    price: "49",
    period: "USD / شهر",
    description: "للاستوديوهات والشبكات",
    minutes: "60 ساعة صوت / شهر",
    features: [
      "كل ميزات الاحترافي",
      "API + تكامل مع أدواتك",
      "فريق متعدد المستخدمين",
      "تقارير شهرية",
      "مدير حساب مخصص",
    ],
    cta: "تواصل معنا",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "هل يدعم صدى فعلاً اللهجة المغربية / الخليجية / المصرية؟",
    a: "نعم. صدى مدرّب على 4 لهجات رئيسية (مصرية، خليجية، شامية، مغاربية) إضافة إلى الفصحى. النتيجة: نص مفهوم وقابل للنشر مباشرة في 90%+ من الحالات. للحالات الصعبة (كود-سويتش كثيف، ضوضاء عالية)، نعطي تنبيهاً للجزء الذي يحتاج مراجعة يدوية.",
  },
  {
    q: "ماذا لو كانت الحلقة فيها أكثر من لهجة؟",
    a: "صدى يتعرّف تلقائياً على تبديل اللهجات في نفس الحلقة (Code-switching) ويُعلّم كل مقطع بلهجته الأصلية. هذه إحدى النقاط التي يتعثّر فيها Whisper وSonix بشدة.",
  },
  {
    q: "هل النصوص ملكي بعد التفريغ؟",
    a: "نعم 100%. كل ما تنتجه عبر صدى (تفريغ، ترجمة، SRT، Show Notes) هو ملكك الكامل. لا نحتفظ بنسخة من ملفاتك الصوتية بعد المعالجة، ولا نستخدم محتواك لتدريب نماذجنا دون إذن صريح.",
  },
  {
    q: "ما الفرق بين صدى و Otter.ai / Whisper؟",
    a: "Otter.ai لا يدعم العربية إطلاقاً. Whisper عام وضعيف على اللهجات (32-41% WER على المغربي والخليجي حسب بنشماركات مستقلة). Sonix يترجم من الإنجليزية فيفقد فروق اللهجة. صدى يفرّغ بالعربية أولاً ثم يترجم — فالنتيجة دقيقة في كلتا اللغتين.",
  },
  {
    q: "كم يستغرق تفريغ حلقة مدتها 60 دقيقة؟",
    a: "بين 2 و4 دقائق في المتوسط، حسب اللهجة وجودة الصوت. تستلم إشعاراً عند الجاهزية مع روابط التحميل المباشر.",
  },
  {
    q: "هل يدعم يوتيوب و SoundCloud و Apple Podcasts؟",
    a: "نعم. أدخل رابط الحلقة مباشرة وسيقوم صدى بتحميل الصوت تلقائياً. ندعم أيضاً ملفات MP3 و WAV و M4A المُحمّلة يدوياً، وروابط خلاصات RSS للبودكاست.",
  },
  {
    q: "ماذا لو كانت الدقة على لهجتي ضعيفة؟",
    a: "كل خطة مدفوعة تتضمن أولوية الدعم. أرسل لنا مقطعاً 30 ثانية من حلقتك وسنعاير النموذج على لهجتك تحديداً خلال 48 ساعة، أو نرجع لك المبلغ. الشفافية جزء من وعدنا.",
  },
];

function Landing() {
  const { user, loading } = useAuth();
  const t = useT();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <AudioLines className="size-6 text-primary" />
          <span className="text-lg font-bold">{t("صدى")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link to="/pricing">{t("الأسعار")}</Link>
          </Button>
          <Button asChild variant={user ? "default" : "outline"} size="sm" disabled={loading}>
            <Link to={user ? "/app" : "/auth"}>{user ? t("لوحة التحكم") : t("تسجيل الدخول")}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            {t("لصنّاع المحتوى العربي")}
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-tight md:text-6xl">
            {t("أخيراً: تفريغ يفهم لهجتك، لا يحوّل «وش يقول» إلى «ماذا يقول»")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            {t("ارفع حلقة بودكاست عربية واحصل على تفريغ منقّح يدعم 4 لهجات رئيسية، تحويل للدارجة إلى الفصحى، ترجمة إنجليزية، وملفات SRT/VTT جاهزة للنشر — في أقل من 3 دقائق.")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={user ? "/app" : "/auth"}>
                {t("جرّب أول 30 دقيقة مجاناً — بدون بطاقة بنكية")}
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <Play className="ml-2 size-4" />
                  {t("شاهد مثال تفريغ حي (بدون تسجيل)")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">{t("كل ما يفعله صدى")}</DialogTitle>
                  <DialogDescription className="text-right">
                    {t("أداة واحدة لتفريغ وترجمة وتنقيح البودكاست العربي.")}
                  </DialogDescription>
                </DialogHeader>
                <ul className="mt-2 space-y-3">
                  {capabilities.map((cap) => (
                    <li key={cap.text} className="flex items-start gap-3 text-right">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <cap.icon className="size-4 text-primary" />
                      </div>
                      <span className="pt-0.5 text-sm leading-relaxed">{t(cap.text)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-start">
                  <Button asChild>
                    <Link to={user ? "/app" : "/auth"}>{t("جربه الآن مجاناً")}</Link>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Trust signals under CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              {t("بدون بطاقة بنكية")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary" />
              {t("نتائج في أقل من 3 دقائق")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" />
              {t("4 لهجات عربية مدعومة")}
            </span>
          </div>

          <button
            onClick={scrollToHowItWorks}
            className="mx-auto mt-12 flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{t("كيف يعمل؟")}</span>
            <ArrowDown className="size-4 animate-bounce" />
          </button>
        </section>

        {/* Marketing hook */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 text-center md:p-12">
            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-balance text-2xl font-bold leading-snug md:text-4xl">
                {t("محتواك بالدارجة؟ أوصله لكل العرب")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
                {t("لا يفهمك جمهور خارج بلدك؟ حوّل لهجتك إلى العربية الفصحى وأضفها ككتابة تحت فيديوهاتك، وانشر محتواك في كل العالم.")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-medium text-primary">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                  <Globe className="size-3.5" />
                  {t("انتشار أوسع")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                  <Languages className="size-3.5" />
                  {t("فصحى واضحة")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                  <FileText className="size-3.5" />
                  {t("جاهزة للنشر")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem + Solution */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card/50 p-6 text-right">
              <h2 className="text-lg font-semibold text-destructive">{t("المشكلة")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("أدوات التفريغ العالمية ضعيفة بالعربية، وغالباً ما تُضيّع اللهجة أو تُخرج نصاً غير مقروء. صانع المحتوى العربي يضطر لقضاء ساعات في التصحيح اليدوي.")}
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-right">
              <h2 className="text-lg font-semibold text-primary">{t("الحل مع صدى")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("نموذج مخصّص للعربية واللهجات يفرّغ الحلقة كاملة، ثم يحوّلها إلى فصحى مقروءة تُضاف ككتابة تحت الفيديو، فتصل لجمهور أوسع في كل البلدان العربية.")}
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 text-right">
              <f.icon className="size-6 text-accent" />
              <h2 className="mt-4 text-lg font-semibold">{t(f.title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">{t("كيف يعمل صدى؟")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                {t("خطوات بسيطة من الرفع إلى التصدير، مع معالجة ذكية تضمن جودة النص.")}
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
                  <h3 className="mt-4 text-sm font-semibold">{t(step.title)}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(step.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Comparison */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">{t("النتيجة قبل وبعد، بالأمثلة")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t("نفس المقطع الصوتي، نتيجتان مختلفتان. لاحظ كيف يفقد Whisper معنى الجملة بينما يحافظ صدى على جوهرها بلهجتها الأصلية ثم ينقّحها للفصحى.")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(beforeAfterSamples).map(([key, sample]) => (
              <div key={key} className="rounded-2xl border bg-card p-6 text-right">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t(sample.label)}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                      Whisper WER: {sample.wer.whisper}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                      صدى WER: {sample.wer.sada}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="mb-1 text-xs font-semibold text-destructive">{t("Whisper")}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground line-through opacity-80" dir="rtl">
                      {sample.whisper}
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-semibold text-primary">{t("صدى (تحويل للفصحى)")}</p>
                    <p className="text-sm leading-relaxed text-foreground" dir="rtl">
                      {sample.sada}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
            {t("* WER (Word Error Rate) — كلما انخفض الرقم، زادت الدقة. الأرقام مأخوذة من بنشماركات مستقلة على عيّنات مفتوحة.")}
          </p>
        </section>

        {/* Pricing Table */}
        <section id="pricing" className="scroll-mt-20 bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">{t("باقات تناسب كل بودكاستر")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                {t("ابدأ مجاناً، وادفع فقط عندما تحتاج أكثر. كل الخطط تشمل الدقة الكاملة على اللهجات وتحويل الدارجة → الفصحى.")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border bg-card p-6 text-right transition-all ${
                    plan.highlighted
                      ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      <Sparkles className="size-3" />
                      {t("الأكثر طلباً")}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{t(plan.name)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t(plan.description)}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-xs text-muted-foreground">{t(plan.period)}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-primary">{t(plan.minutes)}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-right">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="leading-relaxed">{t(feat)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-6 w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link to={plan.name === "استوديو" ? "/pricing" : "/auth"}>
                      {t(plan.cta)}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
              {t("جميع الخطط تشمل: تشفير SSL، عدم الاحتفاظ بالملفات الصوتية بعد المعالجة، وإمكانية الإلغاء في أي وقت.")}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-10 text-center">
            <HelpCircle className="mx-auto size-10 text-primary" />
            <h2 className="mt-3 text-3xl font-bold">{t("أسئلة شائعة")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t("أكثر ما يسأله صنّاع المحتوى قبل تجرّبة صدى.")}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border bg-card p-5 text-right transition-colors hover:border-primary/40 open:bg-card/80 open:border-primary/30"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-foreground list-none">
                  <span className="leading-snug">{t(faq.q)}</span>
                  <ArrowDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(faq.a)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("جاهز لتوفير وقت التفريغ والترجمة؟")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            {t("ابدأ بـ 30 دقيقة مجانية كل شهر، واكتشف كيف يُحوّل صدى حلقاتك إلى محتوى منشور.")}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={user ? "/app" : "/auth"}>{t("ابدأ مجاناً")}</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-12 text-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand + description */}
            <div className="text-right md:col-span-1">
              <div className="flex items-center gap-2">
                <AudioLines className="size-5 text-primary" />
                <span className="text-base font-bold">{t("صدى")}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {t("أداة تفريغ وترجمة البودكاست العربي. ندعم 4 لهجات رئيسية ونحوّل الدارجة إلى فصحى واضحة.")}
              </p>
            </div>

            {/* Product */}
            <div className="text-right">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground">
                {t("المنتج")}
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/pricing" className="hover:text-primary">
                    {t("الأسعار")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-primary">
                    {t("تسجيل الدخول")}
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary">
                    {t("الباقات")}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-primary">
                    {t("كيف يعمل")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-right">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground">
                {t("قانوني")}
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    {t("سياسة الخصوصية")}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    {t("شروط الاستخدام")}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    {t("حقوق الملكية الفكرية")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="text-right">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground">
                {t("تواصل")}
              </h4>
              <a
                href="https://wa.me/213658576572"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border bg-card/50 p-3 transition-colors hover:bg-card"
              >
                <img
                  src={youcefInfoLogo.url}
                  alt="Youcef Info"
                  className="size-9 rounded-full object-cover"
                />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("تطوير وتشغيل")}</p>
                  <p className="text-sm font-semibold text-foreground">Youcef Info</p>
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <Phone className="size-3" />
                    +213 658 57 65 72
                  </p>
                </div>
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("متوسط وقت الرد: أقل من 24 ساعة")}
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground md:flex-row">
            <p>
              © 2026 {t("صدى — أداة تفريغ وترجمة البودكاست العربي")}. {t("جميع الحقوق محفوظة.")}
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" />
                {t("تشفير SSL")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                {t("بدون احتفاظ بالملفات")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
