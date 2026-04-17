-- Migration 003: Create ep_kits table
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

CREATE TRIGGER ep_kits_updated_at
  BEFORE UPDATE ON ep_kits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
