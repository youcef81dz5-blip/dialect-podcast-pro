import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const resolveMediaUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { url: string }) => {
    if (!input?.url || typeof input.url !== "string" || input.url.length > 2000) {
      throw new Error("الرابط مطلوب.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { resolveMedia } = await import("./media-resolve.server");
    const resolved = await resolveMedia(data.url);
    const response = await fetch(resolved.audioUrl);
    if (!response.ok) throw new Error("تعذّر تنزيل الصوت المستخرج لحفظه.");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 200 * 1024 * 1024) throw new Error("حجم الصوت يتجاوز 200 ميجابايت.");
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const extension = contentType.includes("mp4") || contentType.includes("m4a") ? "m4a" : "mp3";
    const storagePath = `${context.userId}/${crypto.randomUUID()}.${extension}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("episode-audio")
      .upload(storagePath, bytes, { contentType });
    if (error) throw new Error("تعذّر حفظ الصوت المستخرج.");
    return { ...resolved, storagePath };
  });
