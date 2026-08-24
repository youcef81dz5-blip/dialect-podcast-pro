import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — صدى" },
      {
        name: "description",
        content:
          "كيف نعالج ملفاتك الصوتية والنصوص: التخزين الخاص، مدة الاحتفاظ، حذف الصوت، وحقك في تصدير أو حذف حسابك.",
      },
      { property: "og:title", content: "سياسة الخصوصية — صدى" },
      {
        property: "og:description",
        content: "تفاصيل معالجة الصوت والنصوص، الاحتفاظ بالبيانات، والحذف في منصة صدى.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

const sections = [
  {
    title: "ما الذي نجمعه",
    body: "بريدك الإلكتروني واسم العرض، الملفات الصوتية أو الروابط التي ترفعها، النصوص والترجمات الناتجة، وبيانات الاستهلاك (الدقائق المستخدمة شهرياً).",
  },
  {
    title: "أين تُخزَّن ملفاتك",
    body: "الملفات الصوتية تُحفظ في مخزن خاص غير عام، ولا يمكن الوصول إليها إلا من حسابك. النصوص والترجمات محمية بسياسات وصول على مستوى الصف، فلا يرى أي مستخدم بيانات غيره.",
  },
  {
    title: "معالجة الذكاء الاصطناعي",
    body: "يُرسَل الصوت والنص إلى نماذج ذكاء اصطناعي لغرض التفريغ والترجمة فقط. لا نستخدم محتواك لتدريب أي نموذج، ولا نبيعه أو نشاركه لأغراض تسويقية.",
  },
  {
    title: "مدة الاحتفاظ وحذف الصوت",
    body: "يبقى الملف الصوتي ما دامت الحلقة موجودة في حسابك. عند حذف الحلقة يُحذف الملف الصوتي ومقاطع النص والترجمة المرتبطة به نهائياً.",
  },
  {
    title: "حقوقك",
    body: "يمكنك تصدير كل بياناتك بصيغة JSON، أو حذف حسابك بالكامل من صفحة الإعدادات. الحذف نهائي ولا يمكن التراجع عنه.",
  },
  {
    title: "التواصل",
    body: "لأي سؤال يخص الخصوصية أو طلب حذف يدوي، راسلنا عبر بريد الدعم المرتبط بحسابك.",
  },
];

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <AudioLines className="size-5 text-primary" />
            صدى
          </Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            الأسعار
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14 text-right">
        <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          نشرح هنا بوضوح ما نفعله ببياناتك الصوتية والنصية.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        صدى — أداة تفريغ وترجمة البودكاست العربي
      </footer>
    </div>
  );
}
