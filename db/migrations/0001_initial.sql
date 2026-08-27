CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workspace_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT (auth.user_id()),
  state_key text NOT NULL CHECK (state_key IN ('draft', 'modules')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, state_key)
);

CREATE TABLE IF NOT EXISTS public.quote_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT (auth.user_id()),
  quote_code text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  project_name text NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quote_code, version)
);

CREATE INDEX IF NOT EXISTS workspace_states_user_updated_idx
  ON public.workspace_states (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS quote_versions_user_created_idx
  ON public.quote_versions (user_id, created_at DESC);

ALTER TABLE public.workspace_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own workspace states" ON public.workspace_states;
CREATE POLICY "Users own workspace states"
  ON public.workspace_states
  FOR ALL
  TO authenticated
  USING ((SELECT auth.user_id()) = user_id)
  WITH CHECK ((SELECT auth.user_id()) = user_id);

DROP POLICY IF EXISTS "Users own quote versions" ON public.quote_versions;
CREATE POLICY "Users own quote versions"
  ON public.quote_versions
  FOR ALL
  TO authenticated
  USING ((SELECT auth.user_id()) = user_id)
  WITH CHECK ((SELECT auth.user_id()) = user_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_states TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_versions TO authenticated;
