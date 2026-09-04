CREATE TABLE IF NOT EXISTS public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'ar',
  model text,
  raw_text text,
  refined_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.transcripts TO authenticated;
GRANT ALL ON public.transcripts TO service_role;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transcripts' AND policyname='transcripts_select_own') THEN
    CREATE POLICY transcripts_select_own ON public.transcripts
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.episodes e
        WHERE e.id = transcripts.episode_id AND e.user_id = auth.uid()
      ));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $fn$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $fn$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS transcripts_set_updated_at ON public.transcripts;
CREATE TRIGGER transcripts_set_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS transcripts_episode_language_idx ON public.transcripts(episode_id, language);

CREATE TABLE IF NOT EXISTS public.transcript_segments (
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transcript_segments' AND policyname='transcript_segments_select_own') THEN
    CREATE POLICY transcript_segments_select_own ON public.transcript_segments
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.transcripts t
        JOIN public.episodes e ON e.id = t.episode_id
        WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transcript_segments' AND policyname='transcript_segments_update_own') THEN
    CREATE POLICY transcript_segments_update_own ON public.transcript_segments
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.transcripts t
        JOIN public.episodes e ON e.id = t.episode_id
        WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.transcripts t
        JOIN public.episodes e ON e.id = t.episode_id
        WHERE t.id = transcript_segments.transcript_id AND e.user_id = auth.uid()
      ));
  END IF;
END $$;

DROP TRIGGER IF EXISTS transcript_segments_set_updated_at ON public.transcript_segments;
CREATE TRIGGER transcript_segments_set_updated_at BEFORE UPDATE ON public.transcript_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS transcript_segments_transcript_idx ON public.transcript_segments(transcript_id, idx);

CREATE OR REPLACE FUNCTION public.claim_quota_minutes(
  p_user_id UUID,
  p_minutes NUMERIC
)
RETURNS TABLE(granted BOOLEAN, remaining_minutes NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quota INTEGER;
  v_used NUMERIC;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT minutes_quota, minutes_used, current_period_end
    INTO v_quota, v_used, v_period_end
    FROM public.subscriptions
    WHERE user_id = p_user_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC;
    RETURN;
  END IF;

  IF v_period_end < now() THEN
    UPDATE public.subscriptions
       SET minutes_used = 0,
           current_period_start = date_trunc('month', now()),
           current_period_end = date_trunc('month', now()) + INTERVAL '1 month'
     WHERE user_id = p_user_id;
    v_used := 0;
  END IF;

  IF (v_quota - v_used) < p_minutes THEN
    RETURN QUERY SELECT false, (v_quota - v_used)::NUMERIC;
    RETURN;
  END IF;

  UPDATE public.subscriptions
     SET minutes_used = minutes_used + p_minutes
   WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, (v_quota - v_used - p_minutes)::NUMERIC;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_quota_minutes(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_quota_minutes(UUID, NUMERIC) TO service_role;