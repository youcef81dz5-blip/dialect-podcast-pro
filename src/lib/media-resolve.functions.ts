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
  .handler(async ({ data }) => {
    const { resolveMedia } = await import("./media-resolve.server");
    return resolveMedia(data.url);
  });
