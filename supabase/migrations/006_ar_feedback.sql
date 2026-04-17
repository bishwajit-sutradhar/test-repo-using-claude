-- Add A&R feedback column to ep_kits
ALTER TABLE ep_kits ADD COLUMN IF NOT EXISTS ar_feedback jsonb;
