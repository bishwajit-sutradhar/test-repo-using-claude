-- Migration 005: Add release metadata and LLM tracking columns to ep_kits

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

-- GIN indexes for array columns (useful for future filtering)
CREATE INDEX IF NOT EXISTS ep_kits_vibe_tags_gin
  ON ep_kits USING GIN (ep_vibe_tags);

CREATE INDEX IF NOT EXISTS ep_kits_platforms_gin
  ON ep_kits USING GIN (target_platforms);
