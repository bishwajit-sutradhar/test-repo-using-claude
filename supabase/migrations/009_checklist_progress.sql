-- Interactive release checklist state (positional indexing into plan arrays)

CREATE TABLE IF NOT EXISTS checklist_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kit_id       uuid NOT NULL REFERENCES ep_kits(id) ON DELETE CASCADE,
  section      text NOT NULL CHECK (section IN ('pre_release', 'post_release')),
  phase_index  smallint,       -- pre_release: index into phases[]; null for post_release
  task_index   smallint NOT NULL,
  completed    boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (kit_id, section, phase_index, task_index)
);

ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_select_own" ON checklist_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "checklist_insert_own" ON checklist_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "checklist_update_own" ON checklist_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "checklist_delete_own" ON checklist_progress FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS checklist_kit_idx ON checklist_progress (kit_id);
