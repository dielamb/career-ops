-- Migration: 001_v1_schema
-- career-ops v1 — initial Supabase schema
-- Tables: listings, pipeline, applications, profiles, usage_counters
-- All tables use RLS: authenticated users can only access their own rows
-- Apply via: Supabase Dashboard → SQL Editor → paste and run

-- ──────────────────────────────────────────────────────────────
-- 1. LISTINGS — raw job postings (fetched from ATS APIs)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  jd_text     TEXT,
  company     TEXT,
  title       TEXT,
  source      TEXT,                        -- 'greenhouse' | 'ashby' | 'lever' | 'manual'
  fetched_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_owner_all" ON listings
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS listings_user_id_idx       ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_user_created_idx  ON listings(user_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 2. PIPELINE — evaluated listings
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id       UUID        REFERENCES listings(id) ON DELETE SET NULL,
  url              TEXT,
  company          TEXT,
  title            TEXT,
  score            FLOAT       CHECK (score >= 0 AND score <= 5),
  dimension_scores JSONB,
  gap_analysis     TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN (
                     'pending','evaluated','applied','responded',
                     'interview','offer','rejected','discarded','skipped','error'
                   )),
  pdf_path         TEXT,
  notes            TEXT,
  eval_date        DATE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_owner_all" ON pipeline
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS pipeline_user_id_idx     ON pipeline(user_id);
CREATE INDEX IF NOT EXISTS pipeline_user_status_idx ON pipeline(user_id, status);
CREATE INDEX IF NOT EXISTS pipeline_listing_id_idx  ON pipeline(listing_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pipeline_updated_at
  BEFORE UPDATE ON pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 3. APPLICATIONS — submitted applications
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id  UUID        REFERENCES pipeline(id) ON DELETE SET NULL,
  company      TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  submitted_at TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_owner_all" ON applications
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS applications_user_id_idx    ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_pipeline_id_idx ON applications(pipeline_id);

-- ──────────────────────────────────────────────────────────────
-- 4. PROFILES — user CV + preferences (1:1 with auth.users)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id                    UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_text                    TEXT,
  scoring_prefs              JSONB DEFAULT '{}',
  anthropic_api_key_encrypted TEXT,          -- stored via Supabase Vault in Phase 2
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_all" ON profiles
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO usage_counters (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────────
-- 5. USAGE_COUNTERS — free tier tracking (1:1 with auth.users)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id     UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE  NOT NULL DEFAULT date_trunc('month', now())::DATE,
  eval_count  INT   NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_counters_owner_all" ON usage_counters
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER usage_counters_updated_at
  BEFORE UPDATE ON usage_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 6. AUTO-CREATE PROFILE + COUNTER ON USER SIGNUP
-- ──────────────────────────────────────────────────────────────
-- Trigger fires after a new user is created in auth.users
-- Supabase Dashboard: Authentication > Hooks — OR set up here:
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
