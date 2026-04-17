-- Migration 002: Create songs table
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

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
