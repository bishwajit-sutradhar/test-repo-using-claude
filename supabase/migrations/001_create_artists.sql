-- Migration 001: Create artists table
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

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
