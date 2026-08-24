CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id uuid NOT NULL REFERENCES public.transcripts(id) ON DELETE CASCADE,
  target_language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'ready',
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transcript_id, target_language)
);

GRANT SELECT ON public.translations TO authenticated;
GRANT ALL ON public.translations TO service_role;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY translations_select_own ON public.translations
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.transcripts t
  JOIN public.episodes e ON e.id = t.episode_id
  WHERE t.id = translations.transcript_id AND e.user_id = auth.uid()
));

CREATE TRIGGER translations_set_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.translation_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id uuid NOT NULL REFERENCES public.translations(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  start_ms integer NOT NULL,
  end_ms integer NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (translation_id, idx)
);

GRANT SELECT, UPDATE ON public.translation_segments TO authenticated;
GRANT ALL ON public.translation_segments TO service_role;
ALTER TABLE public.translation_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY translation_segments_select_own ON public.translation_segments
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.translations tr
  JOIN public.transcripts t ON t.id = tr.transcript_id
  JOIN public.episodes e ON e.id = t.episode_id
  WHERE tr.id = translation_segments.translation_id AND e.user_id = auth.uid()
));

CREATE POLICY translation_segments_update_own ON public.translation_segments
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.translations tr
  JOIN public.transcripts t ON t.id = tr.transcript_id
  JOIN public.episodes e ON e.id = t.episode_id
  WHERE tr.id = translation_segments.translation_id AND e.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.translations tr
  JOIN public.transcripts t ON t.id = tr.transcript_id
  JOIN public.episodes e ON e.id = t.episode_id
  WHERE tr.id = translation_segments.translation_id AND e.user_id = auth.uid()
));

CREATE TRIGGER translation_segments_set_updated_at
BEFORE UPDATE ON public.translation_segments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX translation_segments_translation_idx ON public.translation_segments(translation_id, idx);