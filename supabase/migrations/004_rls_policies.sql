-- Migration 004: Enable RLS and add per-user access policies

-- ── artists ──────────────────────────────────────────────────────────────────
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artists_select_own" ON artists
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "artists_insert_own" ON artists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "artists_update_own" ON artists
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "artists_delete_own" ON artists
  FOR DELETE USING (user_id = auth.uid());

-- ── songs ─────────────────────────────────────────────────────────────────────
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "songs_select_own" ON songs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "songs_insert_own" ON songs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "songs_update_own" ON songs
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "songs_delete_own" ON songs
  FOR DELETE USING (user_id = auth.uid());

-- ── ep_kits ───────────────────────────────────────────────────────────────────
ALTER TABLE ep_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ep_kits_select_own" ON ep_kits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ep_kits_insert_own" ON ep_kits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "ep_kits_update_own" ON ep_kits
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ep_kits_delete_own" ON ep_kits
  FOR DELETE USING (user_id = auth.uid());
