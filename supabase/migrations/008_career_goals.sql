-- Career goals and AI-generated 90-day roadmaps

CREATE TABLE IF NOT EXISTS career_goals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id      uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  goal_1         text NOT NULL,
  goal_2         text,
  goal_3         text,
  timeframe_days int NOT NULL DEFAULT 90,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS roadmap_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_goal_id  uuid NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
  content         jsonb NOT NULL,
  llm_provider    text,
  llm_model       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER career_goals_updated_at
  BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_select_own" ON career_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "goals_insert_own" ON career_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals_update_own" ON career_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "goals_delete_own" ON career_goals FOR DELETE USING (user_id = auth.uid());

ALTER TABLE roadmap_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmap_select_own" ON roadmap_plans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "roadmap_insert_own" ON roadmap_plans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "roadmap_delete_own" ON roadmap_plans FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS roadmap_goal_idx ON roadmap_plans (career_goal_id);
