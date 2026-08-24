CREATE TABLE public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'ar',
  model text,
  raw_text text,
  refined_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (episode_id, language)
);
GRANT SELECT ON public.transcripts TO authenticated;
GRANT ALL ON public.transcripts TO service_role;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY transcripts_select_own ON public.transcripts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.episodes e WHERE e.id = transcripts.episode_id AND e.user_id = auth.uid()));
CREATE TRIGGER transcripts_set_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.transcript_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id uuid NOT NULL REFERENCES public.transcripts(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  start_ms integer NOT NULL,
  end_ms integer NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transcript_id, idx)
);
GRANT SELECT, UPDATE ON public.transcript_segments TO authenticated;
GRANT ALL ON public.transcript_segments TO service_role;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY transcript_segments_select_own ON public.transcript_segments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.transcripts t JOIN public.episodes e ON e.id = t.episode_id
    WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()));
CREATE POLICY transcript_segments_update_own ON public.transcript_segments FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.transcripts t JOIN public.episodes e ON e.id = t.episode_id
    WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.transcripts t JOIN public.episodes e ON e.id = t.episode_id
    WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()));
CREATE TRIGGER transcript_segments_set_updated_at BEFORE UPDATE ON public.transcript_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX transcript_segments_transcript_idx ON public.transcript_segments (transcript_id, idx);