import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const exportMyData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: subscription }, { data: episodes }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("episodes").select("*").eq("user_id", userId).order("created_at"),
    ]);

    const episodeIds = (episodes ?? []).map((e) => e.id);
    const { data: transcripts } = episodeIds.length
      ? await supabase.from("transcripts").select("*").in("episode_id", episodeIds)
      : { data: [] as any[] };

    const transcriptIds = (transcripts ?? []).map((t) => t.id);
    const [{ data: segments }, { data: translations }] = await Promise.all([
      transcriptIds.length
        ? supabase.from("transcript_segments").select("*").in("transcript_id", transcriptIds).order("idx")
        : Promise.resolve({ data: [] as any[] }),
      transcriptIds.length
        ? supabase.from("translations").select("*").in("transcript_id", transcriptIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const translationIds = (translations ?? []).map((t) => t.id);
    const { data: translationSegments } = translationIds.length
      ? await supabase
          .from("translation_segments")
          .select("*")
          .in("translation_id", translationIds)
          .order("idx")
      : { data: [] as any[] };

    return {
      exported_at: new Date().toISOString(),
      profile,
      subscription,
      episodes: episodes ?? [],
      transcripts: transcripts ?? [],
      transcript_segments: segments ?? [],
      translations: translations ?? [],
      translation_segments: translationSegments ?? [],
    };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: episodes } = await supabase
      .from("episodes")
      .select("id, storage_path")
      .eq("user_id", userId);

    const paths = (episodes ?? []).map((e) => e.storage_path).filter(Boolean) as string[];
    if (paths.length) {
      await supabaseAdmin.storage.from("episode-audio").remove(paths);
    }

    // Cascades remove episodes, transcripts, translations, jobs, profile, subscription.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
