-- ============================================================
-- Artist Management — Full Database Setup
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- It is idempotent (safe to run again if partially done).
-- ============================================================


-- ── 001: Artists ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name      text NOT NULL,
  real_name       text,
  genre           text NOT NULL,
  location        text,
  bio_raw         text,
  influences      text[],
  years_active    int,
  website_url     text,
  social_handles  jsonb DEFAULT '{}'::jsonb,
  press_photo_url text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS artists_updated_at ON artists;
CREATE TRIGGER artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 002: Songs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id         uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             text NOT NULL,
  track_number      smallint NOT NULL CHECK (track_number > 0),
  duration_seconds  int CHECK (duration_seconds > 0),
  bpm               smallint CHECK (bpm BETWEEN 40 AND 300),
  key_signature     text,
  mood              text[],
  themes            text,
  production_notes  text,
  featured_artists  text[],
  lyrics_excerpt    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS songs_updated_at ON songs;
CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 003: EP Kits ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_kits (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id           uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ep_title            text NOT NULL,
  ep_release_date     date,
  ep_label            text,
  generation_status   text NOT NULL DEFAULT 'pending'
                        CHECK (generation_status IN ('pending', 'generating', 'complete', 'failed')),
  content             jsonb,
  prompt_tokens_used  int,
  model_version       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS ep_kits_updated_at ON ep_kits;
CREATE TRIGGER ep_kits_updated_at
  BEFORE UPDATE ON ep_kits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 004: RLS Policies ────────────────────────────────────────
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artists_select_own" ON artists;
DROP POLICY IF EXISTS "artists_insert_own" ON artists;
DROP POLICY IF EXISTS "artists_update_own" ON artists;
DROP POLICY IF EXISTS "artists_delete_own" ON artists;

CREATE POLICY "artists_select_own" ON artists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "artists_insert_own" ON artists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "artists_update_own" ON artists FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "artists_delete_own" ON artists FOR DELETE USING (user_id = auth.uid());

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "songs_select_own" ON songs;
DROP POLICY IF EXISTS "songs_insert_own" ON songs;
DROP POLICY IF EXISTS "songs_update_own" ON songs;
DROP POLICY IF EXISTS "songs_delete_own" ON songs;

CREATE POLICY "songs_select_own" ON songs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "songs_insert_own" ON songs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "songs_update_own" ON songs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "songs_delete_own" ON songs FOR DELETE USING (user_id = auth.uid());

ALTER TABLE ep_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ep_kits_select_own" ON ep_kits;
DROP POLICY IF EXISTS "ep_kits_insert_own" ON ep_kits;
DROP POLICY IF EXISTS "ep_kits_update_own" ON ep_kits;
DROP POLICY IF EXISTS "ep_kits_delete_own" ON ep_kits;

CREATE POLICY "ep_kits_select_own" ON ep_kits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ep_kits_insert_own" ON ep_kits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ep_kits_update_own" ON ep_kits FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ep_kits_delete_own" ON ep_kits FOR DELETE USING (user_id = auth.uid());


-- ── 005: Kit Metadata Columns ────────────────────────────────
ALTER TABLE ep_kits
  ADD COLUMN IF NOT EXISTS ep_release_type      text NOT NULL DEFAULT 'ep'
    CHECK (ep_release_type IN ('single','ep','album','mixtape')),
  ADD COLUMN IF NOT EXISTS ep_vibe_tags         text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ep_release_genre     text,
  ADD COLUMN IF NOT EXISTS target_audience      text,
  ADD COLUMN IF NOT EXISTS target_platforms     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS llm_provider         text,
  ADD COLUMN IF NOT EXISTS llm_model            text,
  ADD COLUMN IF NOT EXISTS generation_duration_ms int;

CREATE INDEX IF NOT EXISTS ep_kits_vibe_tags_gin ON ep_kits USING GIN (ep_vibe_tags);
CREATE INDEX IF NOT EXISTS ep_kits_platforms_gin ON ep_kits USING GIN (target_platforms);
