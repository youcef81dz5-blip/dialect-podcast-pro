export type ResolvedMedia = {
  audioUrl: string;
  title: string | null;
  durationSeconds: number | null;
  provider: "direct" | "rss" | "apple" | "youtube";
};

const AUDIO_EXT = /\.(mp3|m4a|mp4|wav|aac|ogg|opus|flac|webm)(\?|#|$)/i;

// فحص المضيف ضد نطاقات الـIP الخاصة وعناوين الـmetadata لمنع SSRF.
const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|::1$|\[?::1\]?$|fc[0-9a-f]{2}:|fe80:)/i;

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  return PRIVATE_HOST_RE.test(host);
}

/**
 * يجلب عنوان URL مع تعطيل إعادة التوجيه التلقائي والحد من القفزات.
 * يتحقق من كل وجهة (بما فيها إعادة التوجيه) ضد نطاقات الـIP الخاصة.
 */
async function safeFetch(
  url: string,
  init: RequestInit = {},
  maxRedirects = 3,
): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("بروتوكول غير مسموح.");
    }
    if (isPrivateHost(parsed.hostname)) {
      throw new Error("المضيف محظور لأسباب أمنية.");
    }
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("إعادة توجيه بدون موقع.");
      current = new URL(location, current).toString();
      await res.arrayBuffer().catch(() => undefined);
      continue;
    }
    return res;
  }
  throw new Error("تجاوز عدد مرات إعادة التوجيه المسموح.");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function stripCdata(value: string): string {
  return decodeEntities(value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
}

export function youtubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (!/(^|\.)youtube\.com$/.test(host) && host !== "youtube-nocookie.com") return null;
    const v = url.searchParams.get("v");
    if (v) return v;
    const m = url.pathname.match(/\/(shorts|embed|live|v)\/([\w-]{6,})/);
    return m?.[2] ?? null;
  } catch {
    return null;
  }
}

function parseDurationToSeconds(value: string | null): number | null {
  if (!value) return null;
  if (/^\d+(\.\d+)?$/.test(value.trim())) return Math.round(Number(value.trim()));
  const parts = value.split(":").map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) return null;
  return Math.round(parts.reduce((acc, p) => acc * 60 + p, 0));
}

function normalizeDurationSeconds(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

/** يستخرج أول حلقة صوتية من خلاصة RSS */
function parseRssFeed(xml: string): ResolvedMedia | null {
  const itemMatch = xml.match(/<item[\s>][\s\S]*?<\/item>/i);
  const scope = itemMatch?.[0] ?? xml;
  const enclosure = scope.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
  const mediaContent = scope.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
  const audioUrl = enclosure?.[1] ?? mediaContent?.[1];
  if (!audioUrl) return null;
  const title = scope.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const duration = scope.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/i)?.[1];
  return {
    audioUrl: decodeEntities(audioUrl),
    title: title ? stripCdata(title) : null,
    durationSeconds: parseDurationToSeconds(duration ? stripCdata(duration) : null),
    provider: "rss",
  };
}

async function resolveAppleUrl(rawUrl: string): Promise<ResolvedMedia> {
  const id = rawUrl.match(/id(\d+)/)?.[1];
  if (!id) throw new Error("تعذّر التعرف على البودكاست في رابط Apple Podcasts.");
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=podcast`);
  if (!res.ok) throw new Error("تعذّر الوصول إلى Apple Podcasts.");
  const json = (await res.json()) as { results?: Array<{ feedUrl?: string }> };
  const feedUrl = json.results?.[0]?.feedUrl;
  if (!feedUrl) throw new Error("لا توجد خلاصة RSS لهذا البودكاست.");
  const resolved = await resolveFeedUrl(feedUrl);
  return { ...resolved, provider: "apple" };
}

async function resolveFeedUrl(feedUrl: string): Promise<ResolvedMedia> {
  const res = await fetch(feedUrl, { headers: { "User-Agent": "SadaBot/1.0" } });
  if (!res.ok) throw new Error("تعذّر تحميل خلاصة RSS.");
  const xml = await res.text();
  const parsed = parseRssFeed(xml);
  if (!parsed) throw new Error("لم يُعثر على ملف صوتي داخل الخلاصة.");
  return parsed;
}

async function resolveYoutube(videoId: string): Promise<ResolvedMedia> {
  const key = process.env['RAPIDAPI_KEY'];
  if (!key) {
    throw new Error(
      "استخراج صوت يوتيوب يحتاج إلى تفعيل مزوّد خارجي (مفتاح RapidAPI). أضف المفتاح أو استخدم رابطاً صوتياً مباشراً/خلاصة RSS.",
    );
  }
  const host = process.env['RAPIDAPI_YOUTUBE_HOST'] || "youtube-mp36.p.rapidapi.com";
  const res = await fetch(`https://${host}/dl?id=${videoId}`, {
    headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[youtube] provider error", res.status, detail.slice(0, 300));
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `مفتاح RapidAPI غير مشترك في خدمة «${host}». اشترك في الخطة المجانية للخدمة من RapidAPI ثم أعد المحاولة.`,
      );
    }
    if (res.status === 429) throw new Error("تم تجاوز حد الطلبات لدى مزوّد يوتيوب، حاول لاحقاً.");
    throw new Error("تعذّر استخراج الصوت من يوتيوب حالياً.");
  }

  const json = (await res.json()) as {
    link?: string;
    title?: string;
    duration?: number;
    status?: string;
    msg?: string;
  };
  if (!json.link) {
    throw new Error(
      json.status === "processing"
        ? "يوتيوب يجهّز الصوت الآن، أعد المحاولة بعد لحظات."
        : json.msg || "تعذّر استخراج الصوت من يوتيوب.",
    );
  }
  return {
    audioUrl: json.link,
    title: json.title ?? null,
    durationSeconds: normalizeDurationSeconds(json.duration),
    provider: "youtube",
  };
}

export async function resolveMedia(rawUrl: string): Promise<ResolvedMedia> {
  const trimmed = rawUrl.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("الرابط غير صالح.");
  }
  if (url.protocol !== "https:") throw new Error("يجب أن يبدأ الرابط بـ https://");

  const host = url.hostname.replace(/^www\./, "");

  const ytId = youtubeVideoId(trimmed);
  if (ytId) return resolveYoutube(ytId);

  if (host.endsWith("apple.com")) return resolveAppleUrl(trimmed);

  if (AUDIO_EXT.test(url.pathname)) {
    return { audioUrl: trimmed, title: null, durationSeconds: null, provider: "direct" };
  }

  // فحص نوع المحتوى: صوت مباشر أم خلاصة RSS
  try {
    const head = await fetch(trimmed, { method: "HEAD", redirect: "follow" });
    const type = head.headers.get("content-type") ?? "";
    if (type.startsWith("audio/") || type === "application/octet-stream") {
      return { audioUrl: trimmed, title: null, durationSeconds: null, provider: "direct" };
    }
    if (/xml|rss/i.test(type)) return resolveFeedUrl(trimmed);
  } catch {
    // نتابع إلى محاولة قراءة الخلاصة
  }

  try {
    return await resolveFeedUrl(trimmed);
  } catch {
    throw new Error(
      "تعذّر التعرف على مصدر الصوت. استخدم رابطاً صوتياً مباشراً، أو خلاصة RSS، أو رابط Apple Podcasts، أو رابط يوتيوب.",
    );
  }
}
