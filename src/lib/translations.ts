// Dictionary keyed by the Arabic source string.
// Missing keys fall back to the Arabic text.
export type Lang = "ar" | "en" | "fr";

export const LANGUAGES: { code: Lang; label: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
];

type Entry = { en: string; fr: string };

export const dictionary: Record<string, Entry> = {
  // Brand + nav
  "صدى": { en: "Sada", fr: "Sada" },
  "الأسعار": { en: "Pricing", fr: "Tarifs" },
  "لوحة التحكم": { en: "Dashboard", fr: "Tableau de bord" },
  "تسجيل الدخول": { en: "Sign in", fr: "Se connecter" },
  "الإعدادات": { en: "Settings", fr: "Paramètres" },
  "سياسة الخصوصية": { en: "Privacy Policy", fr: "Politique de confidentialité" },
  "صدى — أداة تفريغ وترجمة البودكاست العربي": {
    en: "Sada — Arabic podcast transcription & translation",
    fr: "Sada — transcription et traduction de podcasts arabes",
  },
  "تطوير وتشغيل": { en: "Built & operated by", fr: "Développé et opéré par" },

  // Errors / 404
  "الصفحة غير موجودة": { en: "Page not found", fr: "Page introuvable" },
  "الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.": {
    en: "The link is invalid or the page has moved.",
    fr: "Le lien est invalide ou la page a été déplacée.",
  },
  "العودة للرئيسية": { en: "Back to home", fr: "Retour à l'accueil" },
  "تعذّر تحميل الصفحة": { en: "Could not load the page", fr: "Impossible de charger la page" },
  "حدث خطأ غير متوقع. جرّب التحديث أو العودة للرئيسية.": {
    en: "An unexpected error occurred. Try refreshing or go back home.",
    fr: "Une erreur inattendue s'est produite. Actualisez ou revenez à l'accueil.",
  },
  "إعادة المحاولة": { en: "Retry", fr: "Réessayer" },
  "الرئيسية": { en: "Home", fr: "Accueil" },

  // Landing hero
  "لصنّاع المحتوى العربي": { en: "For Arabic content creators", fr: "Pour les créateurs de contenu arabe" },
  "حلقتك الصوتية تتحول إلى نص وترجمة في دقائق": {
    en: "Turn your audio episode into text and translation in minutes",
    fr: "Transformez votre épisode audio en texte et traduction en quelques minutes",
  },
  "ارفع ملفاً صوتياً أو رابط حلقة، واحصل على تفريغ عربي منقّح يراعي اللهجة، وترجمة إنجليزية، وملفات ترجمة جاهزة للنشر.":
    {
      en: "Upload an audio file or an episode link and get a polished Arabic transcript that respects the dialect, an English translation, and subtitle files ready to publish.",
      fr: "Importez un fichier audio ou un lien d'épisode et obtenez une transcription arabe soignée respectant le dialecte, une traduction anglaise et des fichiers de sous-titres prêts à publier.",
    },
  "ابدأ مجاناً — 30 دقيقة شهرياً": { en: "Start free — 30 minutes monthly", fr: "Commencer gratuitement — 30 min/mois" },
  "اكتشف كل ما يفعله": { en: "See everything it does", fr: "Découvrir toutes les fonctions" },
  "كل ما يفعله صدى": { en: "Everything Sada does", fr: "Tout ce que fait Sada" },
  "أداة واحدة لتفريغ وترجمة وتنقيح البودكاست العربي.": {
    en: "One tool to transcribe, translate and polish Arabic podcasts.",
    fr: "Un seul outil pour transcrire, traduire et affiner les podcasts arabes.",
  },
  "جربه الآن مجاناً": { en: "Try it free", fr: "Essayer gratuitement" },
  "كيف يعمل؟": { en: "How it works?", fr: "Comment ça marche ?" },

  // Capabilities
  "رفع ملف صوتي أو لصق رابط يوتيوب / بودكاست": {
    en: "Upload audio or paste a YouTube / podcast link",
    fr: "Importer un audio ou coller un lien YouTube / podcast",
  },
  "تفريغ كامل للحلقة بالعربية مع دعم اللهجات": {
    en: "Full Arabic transcription with dialect support",
    fr: "Transcription arabe complète avec prise en charge des dialectes",
  },
  "تحويل اللهجة العامية إلى العربية الفصحى المفهومة": {
    en: "Convert colloquial dialect into clear Modern Standard Arabic",
    fr: "Convertir le dialecte en arabe standard moderne clair",
  },
  "ترجمة إنجليزية مطابقة للتوقيت الزمني": {
    en: "English translation matched to the timecodes",
    fr: "Traduction anglaise synchronisée aux timecodes",
  },
  "تصدير SRT / VTT / TXT بالعربية أو الإنجليزية أو الاثنين": {
    en: "Export SRT / VTT / TXT in Arabic, English or both",
    fr: "Export SRT / VTT / TXT en arabe, anglais ou les deux",
  },
  "معالجة على دفعات لضمان اكتمال الحلقات الطويلة": {
    en: "Batch processing so long episodes finish completely",
    fr: "Traitement par lots pour les épisodes longs complets",
  },
  "إضافة كتابة فصحى تحت الفيديو لتوسيع انتشار المحتوى": {
    en: "Add MSA captions under your videos to widen your reach",
    fr: "Ajouter des sous-titres en arabe standard pour élargir votre audience",
  },

  // Features
  "تفريغ يفهم لهجتك": { en: "Transcription that understands your dialect", fr: "Une transcription qui comprend votre dialecte" },
  "خليجي، مصري، شامي، مغربي أو فصحى — النص يُنقّح بعد التفريغ بترقيم وإزالة الحشو.": {
    en: "Gulf, Egyptian, Levantine, Maghrebi or MSA — the text is cleaned up with punctuation and filler removal.",
    fr: "Golfe, égyptien, levantin, maghrébin ou littéraire — le texte est nettoyé, ponctué et débarrassé des hésitations.",
  },
  "ترجمة إنجليزية مطابقة": { en: "Matching English translation", fr: "Traduction anglaise fidèle" },
  "كل مقطع يُترجم مع الحفاظ على توقيته، جاهز للنشر لجمهور عالمي.": {
    en: "Every segment is translated while keeping its timing, ready for a global audience.",
    fr: "Chaque segment est traduit en conservant son timing, prêt pour un public mondial.",
  },
  "تصدير فوري": { en: "Instant export", fr: "Export instantané" },
  "ملفات SRT وVTT وTXT، بالعربية أو الإنجليزية أو ثنائية اللغة.": {
    en: "SRT, VTT and TXT files in Arabic, English or bilingual.",
    fr: "Fichiers SRT, VTT et TXT en arabe, anglais ou bilingue.",
  },
  "من اللهجة إلى الفصحى": { en: "From dialect to MSA", fr: "Du dialecte à l'arabe standard" },
  "حوّل محتواك بالدارجة إلى عربية فصحى واضحة، وانشره لجمهور أوسع يفهمك في كل البلدان.": {
    en: "Turn your dialect content into clear Modern Standard Arabic and reach audiences in every country.",
    fr: "Transformez votre contenu en dialecte en arabe standard clair et touchez un public dans tous les pays.",
  },

  // Marketing hook
  "محتواك بالدارجة؟ أوصله لكل العرب": {
    en: "Content in dialect? Reach every Arab audience",
    fr: "Du contenu en dialecte ? Touchez tout le monde arabe",
  },
  "لا يفهمك جمهور خارج بلدك؟ حوّل لهجتك إلى العربية الفصحى وأضفها ككتابة تحت فيديوهاتك، وانشر محتواك في كل العالم.":
    {
      en: "Viewers outside your country can't follow you? Convert your dialect into Modern Standard Arabic, add it as captions under your videos, and publish worldwide.",
      fr: "Le public hors de votre pays ne vous comprend pas ? Convertissez votre dialecte en arabe standard, ajoutez-le en sous-titres et publiez partout.",
    },
  "انتشار أوسع": { en: "Wider reach", fr: "Portée élargie" },
  "فصحى واضحة": { en: "Clear MSA", fr: "Arabe standard clair" },
  "جاهزة للنشر": { en: "Ready to publish", fr: "Prêt à publier" },

  // Problem / solution
  "المشكلة": { en: "The problem", fr: "Le problème" },
  "أدوات التفريغ العالمية ضعيفة بالعربية، وغالباً ما تُضيّع اللهجة أو تُخرج نصاً غير مقروء. صانع المحتوى العربي يضطر لقضاء ساعات في التصحيح اليدوي.":
    {
      en: "Global transcription tools are weak in Arabic: they miss the dialect or produce unreadable text, forcing creators into hours of manual fixing.",
      fr: "Les outils mondiaux de transcription sont faibles en arabe : ils ratent le dialecte ou produisent un texte illisible, obligeant à des heures de correction manuelle.",
    },
  "الحل مع صدى": { en: "The Sada solution", fr: "La solution Sada" },
  "نموذج مخصّص للعربية واللهجات يفرّغ الحلقة كاملة، ثم يحوّلها إلى فصحى مقروءة تُضاف ككتابة تحت الفيديو، فتصل لجمهور أوسع في كل البلدان العربية.":
    {
      en: "A model tuned for Arabic and its dialects transcribes the whole episode, then turns it into readable MSA captions so you reach audiences across the Arab world.",
      fr: "Un modèle adapté à l'arabe et à ses dialectes transcrit l'épisode entier, puis le convertit en arabe standard lisible pour toucher tout le monde arabe.",
    },

  // Steps
  "كيف يعمل صدى؟": { en: "How does Sada work?", fr: "Comment fonctionne Sada ?" },
  "خطوات بسيطة من الرفع إلى التصدير، مع معالجة ذكية تضمن جودة النص.": {
    en: "Simple steps from upload to export, with smart processing that keeps quality high.",
    fr: "Des étapes simples, de l'import à l'export, avec un traitement intelligent qui garantit la qualité.",
  },
  "ارفع أو الصق الرابط": { en: "Upload or paste a link", fr: "Importer ou coller un lien" },
  "اختر ملفاً صوتياً من جهازك، أو ضع رابط يوتيوب أو خلاصة بودكاست.": {
    en: "Pick an audio file from your device, or paste a YouTube or podcast feed link.",
    fr: "Choisissez un fichier audio, ou collez un lien YouTube ou un flux podcast.",
  },
  "يستخرج الصوت ويحفظه": { en: "Audio is extracted and stored", fr: "L'audio est extrait et stocké" },
  "نحمّل الصوت إلى مخزن آمن ونحسب المدة بدقة قبل بدء المعالجة.": {
    en: "We save the audio to secure storage and measure its exact duration before processing.",
    fr: "Nous enregistrons l'audio dans un stockage sécurisé et mesurons sa durée exacte avant traitement.",
  },
  "يفرّغ الحلقة كاملة": { en: "The full episode is transcribed", fr: "L'épisode entier est transcrit" },
  "نقسّم الحلقة لدفعات زمنية متداخلة لضمان عدم فقدان أي كلمة — حتى لو كانت ساعة كاملة.": {
    en: "We split the episode into overlapping time windows so no word is lost — even for a full hour.",
    fr: "Nous découpons l'épisode en fenêtres temporelles chevauchantes pour ne perdre aucun mot — même sur une heure.",
  },
  "يترجم ويحوّل للفصحى": { en: "Translated and converted to MSA", fr: "Traduit et converti en arabe standard" },
  "كل مقطع يُترجم للإنجليزية ويُحوّل من اللهجة إلى العربية الفصحى المقروءة.": {
    en: "Each segment is translated into English and converted from dialect into readable MSA.",
    fr: "Chaque segment est traduit en anglais et converti du dialecte vers un arabe standard lisible.",
  },
  "تصدير جاهز للنشر": { en: "Export ready to publish", fr: "Export prêt à publier" },
  "حمّل النصوص بصيغ SRT أو VTT أو TXT واستخدمها مباشرة على منصاتك.": {
    en: "Download SRT, VTT or TXT files and use them directly on your platforms.",
    fr: "Téléchargez les fichiers SRT, VTT ou TXT et utilisez-les directement sur vos plateformes.",
  },

  // CTA
  "جاهز لتوفير وقت التفريغ والترجمة؟": {
    en: "Ready to save hours of transcription and translation?",
    fr: "Prêt à gagner des heures de transcription et de traduction ?",
  },
  "ابدأ بـ 30 دقيقة مجانية كل شهر، واكتشف كيف يُحوّل صدى حلقاتك إلى محتوى منشور.": {
    en: "Start with 30 free minutes every month and see how Sada turns your episodes into published content.",
    fr: "Commencez avec 30 minutes gratuites par mois et voyez comment Sada publie vos épisodes.",
  },
  "ابدأ مجاناً": { en: "Start free", fr: "Commencer gratuitement" },

  // Auth
  "دخول": { en: "Sign in", fr: "Connexion" },
  "حساب جديد": { en: "Sign up", fr: "Créer un compte" },
  "البريد الإلكتروني": { en: "Email", fr: "E-mail" },
  "كلمة المرور": { en: "Password", fr: "Mot de passe" },
  "الاسم": { en: "Name", fr: "Nom" },
  "إنشاء الحساب": { en: "Create account", fr: "Créer le compte" },
  "أو": { en: "or", fr: "ou" },
  "المتابعة عبر Google": { en: "Continue with Google", fr: "Continuer avec Google" },
  "تم إنشاء الحساب. تحقق من بريدك إن طُلب التأكيد.": {
    en: "Account created. Check your inbox if confirmation is required.",
    fr: "Compte créé. Vérifiez votre boîte mail si une confirmation est demandée.",
  },
  "تعذّر تسجيل الدخول عبر Google": {
    en: "Google sign-in failed",
    fr: "Échec de la connexion Google",
  },

  // Pricing
  "خطط بسيطة حسب دقائقك": { en: "Simple plans based on your minutes", fr: "Des offres simples selon vos minutes" },
  "ابدأ مجاناً بـ 30 دقيقة شهرياً، وارفع الحد حين ينمو إنتاجك. يتجدد الرصيد تلقائياً كل شهر.": {
    en: "Start free with 30 minutes a month and upgrade as you grow. The balance renews automatically each month.",
    fr: "Commencez gratuitement avec 30 minutes par mois et évoluez ensuite. Le crédit se renouvelle chaque mois.",
  },
  "مجاني": { en: "Free", fr: "Gratuit" },
  "احترافي": { en: "Pro", fr: "Pro" },
  "شهرياً": { en: "monthly", fr: "par mois" },
  "الأكثر ملاءمة للبودكاسترز": { en: "Best for podcasters", fr: "Idéal pour les podcasteurs" },
  "30 دقيقة تفريغ شهرياً": { en: "30 transcription minutes per month", fr: "30 minutes de transcription par mois" },
  "دعم كل اللهجات العربية": { en: "All Arabic dialects supported", fr: "Tous les dialectes arabes pris en charge" },
  "ترجمة إنجليزية للمقاطع": { en: "English translation of segments", fr: "Traduction anglaise des segments" },
  "تصدير SRT / VTT / TXT": { en: "SRT / VTT / TXT export", fr: "Export SRT / VTT / TXT" },
  "600 دقيقة تفريغ شهرياً": { en: "600 transcription minutes per month", fr: "600 minutes de transcription par mois" },
  "أولوية في المعالجة": { en: "Priority processing", fr: "Traitement prioritaire" },
  "تصدير ثنائي اللغة": { en: "Bilingual export", fr: "Export bilingue" },
  "دعم عبر البريد خلال 24 ساعة": { en: "Email support within 24 hours", fr: "Support par e-mail sous 24 h" },
  "الترقية قريباً": { en: "Upgrade coming soon", fr: "Mise à niveau bientôt" },
  "ابدأ الآن مجاناً": { en: "Start now for free", fr: "Commencer gratuitement" },
  "الدفع الإلكتروني قيد الإعداد؛ حتى ذلك الحين كل الحسابات على الخطة المجانية بـ 30 دقيقة شهرياً.": {
    en: "Online payment is being set up; until then every account is on the free 30-minute plan.",
    fr: "Le paiement en ligne est en préparation ; d'ici là, tous les comptes sont sur l'offre gratuite de 30 minutes.",
  },

  // Privacy
  "نشرح هنا بوضوح ما نفعله ببياناتك الصوتية والنصية.": {
    en: "Here we explain plainly what we do with your audio and text data.",
    fr: "Nous expliquons ici clairement ce que nous faisons de vos données audio et texte.",
  },
  "ما الذي نجمعه": { en: "What we collect", fr: "Ce que nous collectons" },
  "بريدك الإلكتروني واسم العرض، الملفات الصوتية أو الروابط التي ترفعها، النصوص والترجمات الناتجة، وبيانات الاستهلاك (الدقائق المستخدمة شهرياً).":
    {
      en: "Your email and display name, the audio files or links you submit, the resulting transcripts and translations, and usage data (minutes used per month).",
      fr: "Votre e-mail et nom affiché, les fichiers audio ou liens envoyés, les transcriptions et traductions produites, et les données d'usage (minutes utilisées par mois).",
    },
  "أين تُخزَّن ملفاتك": { en: "Where your files are stored", fr: "Où vos fichiers sont stockés" },
  "الملفات الصوتية تُحفظ في مخزن خاص غير عام، ولا يمكن الوصول إليها إلا من حسابك. النصوص والترجمات محمية بسياسات وصول على مستوى الصف، فلا يرى أي مستخدم بيانات غيره.":
    {
      en: "Audio files live in private, non-public storage reachable only from your account. Transcripts and translations are protected by row-level access policies, so no user can see another's data.",
      fr: "Les fichiers audio sont dans un stockage privé accessible uniquement depuis votre compte. Les transcriptions et traductions sont protégées par des politiques d'accès par ligne.",
    },
  "معالجة الذكاء الاصطناعي": { en: "AI processing", fr: "Traitement par IA" },
  "يُرسَل الصوت والنص إلى نماذج ذكاء اصطناعي لغرض التفريغ والترجمة فقط. لا نستخدم محتواك لتدريب أي نموذج، ولا نبيعه أو نشاركه لأغراض تسويقية.":
    {
      en: "Audio and text are sent to AI models solely for transcription and translation. We never use your content to train models, nor sell or share it for marketing.",
      fr: "L'audio et le texte sont envoyés à des modèles d'IA uniquement pour la transcription et la traduction. Votre contenu n'entraîne aucun modèle et n'est ni vendu ni partagé.",
    },
  "مدة الاحتفاظ وحذف الصوت": { en: "Retention and audio deletion", fr: "Conservation et suppression de l'audio" },
  "يبقى الملف الصوتي ما دامت الحلقة موجودة في حسابك. عند حذف الحلقة يُحذف الملف الصوتي ومقاطع النص والترجمة المرتبطة به نهائياً.":
    {
      en: "The audio file stays as long as the episode exists in your account. Deleting the episode permanently removes the audio, transcript segments and translations.",
      fr: "Le fichier audio reste tant que l'épisode existe dans votre compte. Sa suppression efface définitivement l'audio, les segments et les traductions.",
    },
  "حقوقك": { en: "Your rights", fr: "Vos droits" },
  "يمكنك تصدير كل بياناتك بصيغة JSON، أو حذف حسابك بالكامل من صفحة الإعدادات. الحذف نهائي ولا يمكن التراجع عنه.":
    {
      en: "You can export all your data as JSON, or delete your account entirely from the settings page. Deletion is permanent and irreversible.",
      fr: "Vous pouvez exporter toutes vos données en JSON ou supprimer définitivement votre compte depuis les paramètres.",
    },
  "التواصل": { en: "Contact", fr: "Contact" },
  "لأي سؤال يخص الخصوصية أو طلب حذف يدوي، راسلنا عبر بريد الدعم المرتبط بحسابك.": {
    en: "For any privacy question or manual deletion request, email the support address linked to your account.",
    fr: "Pour toute question de confidentialité ou demande de suppression manuelle, écrivez à l'adresse de support liée à votre compte.",
  },

  // Dashboard
  "حلقاتي": { en: "My episodes", fr: "Mes épisodes" },
  "ارفع حلقة لتبدأ التفريغ والترجمة.": {
    en: "Upload an episode to start transcribing and translating.",
    fr: "Importez un épisode pour lancer la transcription et la traduction.",
  },
  "رصيد الدقائق": { en: "Minutes balance", fr: "Crédit de minutes" },
  "الخطة الحالية:": { en: "Current plan:", fr: "Offre actuelle :" },
  "انتهى رصيدك.": { en: "Your balance is used up.", fr: "Votre crédit est épuisé." },
  "رقِّ خطتك": { en: "Upgrade your plan", fr: "Passez à une offre supérieure" },
  "للمتابعة.": { en: "to continue.", fr: "pour continuer." },

  // Settings
  "إعدادات الحساب": { en: "Account settings", fr: "Paramètres du compte" },
  "تصدير بياناتي": { en: "Export my data", fr: "Exporter mes données" },
  "حذف الحساب": { en: "Delete account", fr: "Supprimer le compte" },
  "حذف": { en: "Delete", fr: "Supprimer" },
  "تم تصدير بياناتك": { en: "Your data was exported", fr: "Vos données ont été exportées" },
  "تعذّر التصدير": { en: "Export failed", fr: "Échec de l'export" },
  "تم حذف الحساب": { en: "Account deleted", fr: "Compte supprimé" },
  "تعذّر حذف الحساب": { en: "Could not delete the account", fr: "Impossible de supprimer le compte" },

  // Episode page
  "حلقة": { en: "Episode", fr: "Épisode" },
  "جارٍ التحميل…": { en: "Loading…", fr: "Chargement…" },
  "تم حفظ التعديل.": { en: "Change saved.", fr: "Modification enregistrée." },
  "تمت الترجمة إلى الإنجليزية.": { en: "Translated into English.", fr: "Traduit en anglais." },
  "جارٍ التحويل إلى الفصحى…": { en: "Converting to MSA…", fr: "Conversion en arabe standard…" },
  "تم تحويل النص إلى الفصحى.": { en: "Text converted to MSA.", fr: "Texte converti en arabe standard." },
  "إعادة الترجمة": { en: "Re-translate", fr: "Retraduire" },
  "ترجمة إنجليزية": { en: "English translation", fr: "Traduction anglaise" },
  "إعادة التفصيح": { en: "Redo MSA", fr: "Refaire l'arabe standard" },
  "تحويل إلى الفصحى": { en: "Convert to MSA", fr: "Convertir en arabe standard" },
  "العربية": { en: "Arabic", fr: "Arabe" },
  "الفصحى": { en: "MSA", fr: "Arabe standard" },
  "الإنجليزية": { en: "English", fr: "Anglais" },
  "ثنائي اللغة": { en: "Bilingual", fr: "Bilingue" },
  "اللهجة": { en: "Dialect", fr: "Dialecte" },
  "SRT عربي": { en: "SRT Arabic", fr: "SRT arabe" },
  "VTT عربي": { en: "VTT Arabic", fr: "VTT arabe" },
  "TXT عربي": { en: "TXT Arabic", fr: "TXT arabe" },
  "SRT فصحى": { en: "SRT MSA", fr: "SRT arabe standard" },
  "VTT فصحى": { en: "VTT MSA", fr: "VTT arabe standard" },
  "TXT فصحى": { en: "TXT MSA", fr: "TXT arabe standard" },
  "SRT إنجليزي": { en: "SRT English", fr: "SRT anglais" },
  "VTT إنجليزي": { en: "VTT English", fr: "VTT anglais" },
  "TXT إنجليزي": { en: "TXT English", fr: "TXT anglais" },
  "SRT ثنائي": { en: "SRT bilingual", fr: "SRT bilingue" },
  "VTT ثنائي": { en: "VTT bilingual", fr: "VTT bilingue" },
  "TXT ثنائي": { en: "TXT bilingual", fr: "TXT bilingue" },

  // Episode list
  "في الانتظار": { en: "Queued", fr: "En attente" },
  "قيد المعالجة": { en: "Processing", fr: "En cours" },
  "جاهزة": { en: "Ready", fr: "Prêt" },
  "فشلت": { en: "Failed", fr: "Échec" },
  "الخليجية": { en: "Gulf", fr: "Golfe" },
  "المصرية": { en: "Egyptian", fr: "Égyptien" },
  "الشامية": { en: "Levantine", fr: "Levantin" },
  "المغاربية": { en: "Maghrebi", fr: "Maghrébin" },
  "تم حذف الحلقة.": { en: "Episode deleted.", fr: "Épisode supprimé." },
  "بدأ التفريغ الكامل؛ تُعالج الحلقات الطويلة على عدة أجزاء.": {
    en: "Full transcription started; long episodes are processed in several parts.",
    fr: "Transcription complète lancée ; les épisodes longs sont traités en plusieurs parties.",
  },
  "اكتمل التفريغ.": { en: "Transcription complete.", fr: "Transcription terminée." },
  "جارٍ تحميل الحلقات…": { en: "Loading episodes…", fr: "Chargement des épisodes…" },
  "لا توجد حلقات بعد": { en: "No episodes yet", fr: "Aucun épisode pour l'instant" },
  "ارفع ملفاً صوتياً أو الصق رابط حلقة لتضاف إلى قائمة الانتظار.": {
    en: "Upload an audio file or paste an episode link to add it to the queue.",
    fr: "Importez un fichier audio ou collez un lien d'épisode pour l'ajouter à la file.",
  },
  "ملف مرفوع": { en: "Uploaded file", fr: "Fichier importé" },
  "رابط": { en: "Link", fr: "Lien" },
  "النص": { en: "Transcript", fr: "Transcription" },
  "إعادة التفريغ": { en: "Re-transcribe", fr: "Retranscrire" },
  "تفريغ": { en: "Transcribe", fr: "Transcrire" },
  "حذف الحلقة": { en: "Delete episode", fr: "Supprimer l'épisode" },

  // Upload dialog
  "رفع حلقة": { en: "Upload episode", fr: "Importer un épisode" },
  "حلقة جديدة": { en: "New episode", fr: "Nouvel épisode" },
  "ارفع ملفاً صوتياً حتى 200 ميجابايت، أو الصق رابط يوتيوب / Apple Podcasts / خلاصة RSS / رابط صوتي مباشر ونستخرج الصوت تلقائياً.":
    {
      en: "Upload an audio file up to 200 MB, or paste a YouTube / Apple Podcasts / RSS feed / direct audio link and we extract the audio automatically.",
      fr: "Importez un fichier audio jusqu'à 200 Mo, ou collez un lien YouTube / Apple Podcasts / flux RSS / audio direct : nous extrayons l'audio automatiquement.",
    },
  "ملف صوتي": { en: "Audio file", fr: "Fichier audio" },
  "الملف الصوتي": { en: "Audio file", fr: "Fichier audio" },
  "رابط الحلقة أو الفيديو": { en: "Episode or video link", fr: "Lien de l'épisode ou de la vidéo" },
  "https://youtube.com/watch?v=… أو رابط RSS/MP3": {
    en: "https://youtube.com/watch?v=… or an RSS/MP3 link",
    fr: "https://youtube.com/watch?v=… ou un lien RSS/MP3",
  },
  "مدعوم: يوتيوب، Apple Podcasts، خلاصات RSS، وروابط MP3/M4A/WAV المباشرة.": {
    en: "Supported: YouTube, Apple Podcasts, RSS feeds, and direct MP3/M4A/WAV links.",
    fr: "Pris en charge : YouTube, Apple Podcasts, flux RSS et liens MP3/M4A/WAV directs.",
  },
  "عنوان الحلقة": { en: "Episode title", fr: "Titre de l'épisode" },
  "مثال: الحلقة 12 — ريادة الأعمال": {
    en: "e.g. Episode 12 — Entrepreneurship",
    fr: "ex. Épisode 12 — Entrepreneuriat",
  },
  "جارٍ الرفع…": { en: "Uploading…", fr: "Import en cours…" },
  "إضافة الحلقة": { en: "Add episode", fr: "Ajouter l'épisode" },
  "تمت إضافة الحلقة إلى قائمة الانتظار.": {
    en: "Episode added to the queue.",
    fr: "Épisode ajouté à la file d'attente.",
  },
  "يجب تسجيل الدخول.": { en: "You must sign in.", fr: "Vous devez vous connecter." },
  "انتهى رصيد الدقائق في خطتك الحالية.": {
    en: "Your plan's minutes are used up.",
    fr: "Le crédit de minutes de votre offre est épuisé.",
  },
  "اختر ملفاً صوتياً أولاً.": { en: "Pick an audio file first.", fr: "Choisissez d'abord un fichier audio." },
  "حجم الملف يتجاوز 200 ميجابايت.": { en: "The file exceeds 200 MB.", fr: "Le fichier dépasse 200 Mo." },
  "مدة الحلقة تتجاوز رصيد الدقائق المتبقي.": {
    en: "The episode is longer than your remaining minutes.",
    fr: "L'épisode dépasse vos minutes restantes.",
  },
  "أدخل رابطاً صالحاً يبدأ بـ https://": {
    en: "Enter a valid link starting with https://",
    fr: "Saisissez un lien valide commençant par https://",
  },
  "حلقة بدون عنوان": { en: "Untitled episode", fr: "Épisode sans titre" },

  // Episode detail
  "رجوع إلى الحلقات": { en: "Back to episodes", fr: "Retour aux épisodes" },
  "تصدير": { en: "Export", fr: "Exporter" },
  "لا يوجد نص بعد. شغّل التفريغ من صفحة الحلقات.": {
    en: "No transcript yet. Start transcription from the episodes page.",
    fr: "Pas encore de transcription. Lancez-la depuis la page des épisodes.",
  },
  "العودة للوحة": { en: "Back to dashboard", fr: "Retour au tableau de bord" },
  "ملف JSON يحتوي حلقاتك، النصوص، الترجمات، وبيانات اشتراكك.": {
    en: "A JSON file with your episodes, transcripts, translations and subscription data.",
    fr: "Un fichier JSON avec vos épisodes, transcriptions, traductions et données d'abonnement.",
  },
  "تصدير JSON": { en: "Export JSON", fr: "Exporter en JSON" },
  "سيُحذف حسابك مع كل الملفات الصوتية والنصوص والترجمات نهائياً. لا يمكن التراجع.": {
    en: "Your account, audio files, transcripts and translations will be deleted permanently. This cannot be undone.",
    fr: "Votre compte, vos fichiers audio, transcriptions et traductions seront supprimés définitivement. Action irréversible.",
  },
  "اكتب «حذف» للتأكيد": { en: 'Type "Delete" to confirm', fr: 'Tapez "Supprimer" pour confirmer' },
  "حذف الحساب نهائياً": { en: "Delete account permanently", fr: "Supprimer définitivement le compte" },
  "اطّلع على": { en: "See our", fr: "Consultez notre" },
};

export function translate(text: string, lang: Lang): string {
  if (lang === "ar") return text;
  const entry = dictionary[text.trim()];
  if (!entry) return text;
  return entry[lang];
}
