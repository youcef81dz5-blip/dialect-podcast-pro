import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const transcribeEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { episodeId: string }) => {
    if (!input?.episodeId) throw new Error("معرّف الحلقة مطلوب.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("id, user_id, title, dialect, status, source_type, source_url, storage_path, duration_seconds")
      .eq("id", data.episodeId)
      .maybeSingle();
    if (episodeError) throw episodeError;
    if (!episode || episode.user_id !== userId) throw new Error("الحلقة غير موجودة.");
    if (episode.status === "processing") return { ok: true, status: "processing" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchAudio, transcribeAudio, refineSegments } = await import("./transcription.server");

    await supabaseAdmin
      .from("episodes")
      .update({ status: "processing", error_message: null })
      .eq("id", episode.id);
    await supabaseAdmin
      .from("jobs")
      .insert({ episode_id: episode.id, kind: "transcribe", state: "running" });

    try {
      let audioUrl = episode.source_url ?? "";
      let filename = "audio.mp3";
      if (episode.source_type === "upload") {
        if (!episode.storage_path) throw new Error("ملف الحلقة غير موجود في التخزين.");
        const { data: signed, error: signError } = await supabaseAdmin.storage
          .from("episode-audio")
          .createSignedUrl(episode.storage_path, 60 * 30);
        if (signError || !signed) throw new Error("تعذر الوصول إلى ملف الصوت.");
        audioUrl = signed.signedUrl;
        filename = episode.storage_path.split("/").pop() ?? filename;
      } else if (!/^https:\/\//i.test(audioUrl)) {
        throw new Error("رابط الحلقة غير صالح.");
      }

      const audio = await fetchAudio(audioUrl);
      const result = await transcribeAudio(audio, filename);
      const segments = await refineSegments(result.segments, episode.dialect);

      const { data: transcript, error: transcriptError } = await supabaseAdmin
        .from("transcripts")
        .upsert(
          {
            episode_id: episode.id,
            language: "ar",
            model: result.model,
            raw_text: result.text,
            refined_text: segments.map((s) => s.text).join(" "),
          },
          { onConflict: "episode_id,language" },
        )
        .select("id")
        .single();
      if (transcriptError) throw transcriptError;

      await supabaseAdmin.from("transcript_segments").delete().eq("transcript_id", transcript.id);
      if (segments.length) {
        const { error: segmentError } = await supabaseAdmin.from("transcript_segments").insert(
          segments.map((s) => ({
            transcript_id: transcript.id,
            idx: s.idx,
            start_ms: s.start_ms,
            end_ms: s.end_ms,
            text: s.text,
          })),
        );
        if (segmentError) throw segmentError;
      }

      const durationSeconds =
        result.duration ??
        episode.duration_seconds ??
        Math.round((segments.at(-1)?.end_ms ?? 0) / 1000);

      await supabaseAdmin
        .from("episodes")
        .update({ status: "ready", duration_seconds: durationSeconds, error_message: null })
        .eq("id", episode.id);
      await supabaseAdmin
        .from("jobs")
        .update({ state: "done" })
        .eq("episode_id", episode.id)
        .eq("kind", "transcribe")
        .eq("state", "running");

      const { data: subscription } = await supabaseAdmin
        .from("subscriptions")
        .select("id, minutes_used")
        .eq("user_id", userId)
        .maybeSingle();
      if (subscription) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ minutes_used: Number(subscription.minutes_used) + durationSeconds / 60 })
          .eq("id", subscription.id);
      }

      return { ok: true, status: "ready" as const, segments: segments.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل غير متوقع أثناء التفريغ.";
      await supabaseAdmin
        .from("episodes")
        .update({ status: "failed", error_message: message })
        .eq("id", episode.id);
      await supabaseAdmin
        .from("jobs")
        .update({ state: "failed", last_error: message })
        .eq("episode_id", episode.id)
        .eq("kind", "transcribe")
        .eq("state", "running");
      throw new Error(message);
    }
  });
