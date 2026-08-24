CREATE TYPE public.episode_status AS ENUM ('queued','processing','ready','failed');
CREATE TYPE public.episode_source AS ENUM ('upload','url');
CREATE TYPE public.episode_dialect AS ENUM ('msa','gulf','egyptian','levantine','maghrebi');
CREATE TYPE public.job_kind AS ENUM ('transcribe','translate');
CREATE TYPE public.job_state AS ENUM ('pending','running','done','failed');

CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  source_type public.episode_source NOT NULL,
  source_url text,
  storage_path text,
  duration_seconds integer,
  dialect public.episode_dialect NOT NULL DEFAULT 'msa',
  status public.episode_status NOT NULL DEFAULT 'queued',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY episodes_select_own ON public.episodes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY episodes_insert_own ON public.episodes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY episodes_update_own ON public.episodes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY episodes_delete_own ON public.episodes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER episodes_set_updated_at BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX episodes_user_created_idx ON public.episodes (user_id, created_at DESC);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  kind public.job_kind NOT NULL,
  state public.job_state NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_select_own ON public.jobs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.episodes e WHERE e.id = jobs.episode_id AND e.user_id = auth.uid()));
CREATE TRIGGER jobs_set_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX jobs_state_idx ON public.jobs (state, created_at);