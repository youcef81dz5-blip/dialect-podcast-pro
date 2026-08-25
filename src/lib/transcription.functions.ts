import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const transcribeEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { episodeId: string }) => {
    if (!input?.episodeId || typeof input.episodeId !== "string") {
      throw new Error("معرّف الحلقة مطلوب.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { runTranscription } = await import("./transcription.server");
    return runTranscription(data.episodeId, context);
  });
