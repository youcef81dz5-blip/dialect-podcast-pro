# Podcast Pal

أنت بوت المخطط. اكتب خطة تنفيذ MVP مفصّلة لمنتج SaaS: أداة توثيق وترجمة البودكاست العربية (Podcast transcription + translation بالعربية واللهجات). السياق: الفكرة من بحث بوت الباحث — صناع المحتوى العرب لا يجدون أتمتة للتفريغ/الترجمة باللهجة؛ أدوات الترجمة العالمية ضعيفة بالعربية. المنتج: تطبيق ويب يرفع المستخدم ملف صوتي أو رابط حلقة بودكاست، فيحوّله لنص عربي منقّح (مع دعم لهجات) + ترجمة إنجليزية، مع تصدير SRT/VTT/TXT، ونظام اشتراك بسيط.
اكتب الخطة كملف Markdown إلى podcast_tool_plan.md عبر execute_code، تتضمن:
1) نطاق MVP وما هو خارج النطاق
2) معمارية تقنية (Next.js frontend + Python FastAPI worker للـ Whisper/Llama API، PostgreSQL، تخزين مؤقت للملفات)
3) مراحل التنفيذ (مراحل 4-6 كل مرحلة بمهام قابلة للتسليم)
4) نموذج البيانات (جداول: users, episodes, transcripts, translations, subscriptions)
5) نقاط API الرئيسية
6) استراتيجية الاختبار (TDD - اختبارات قبل الكود)
7) المخاطر التقنية وخطة التخفيف
8) تقدير وقت كل مرحلة
اجعل الخطة عملية وقابلة للتنفيذ فوراً من مطور واحد.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dialect-podcast-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12cecb3a-6d2b-4cd0-bfe9-9a3c60040f72).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
