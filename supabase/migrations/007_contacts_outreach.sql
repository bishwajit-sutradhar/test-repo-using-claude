-- Press contacts and outreach tracking

CREATE TABLE IF NOT EXISTS press_contacts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL,
  publication  text,
  contact_type text NOT NULL CHECK (contact_type IN ('press', 'curator', 'radio')),
  notes        text,
  website_url  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id      uuid NOT NULL REFERENCES press_contacts(id) ON DELETE CASCADE,
  kit_id          uuid NOT NULL REFERENCES ep_kits(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'not_pitched'
                    CHECK (status IN ('not_pitched', 'pitched', 'responded', 'featured', 'rejected')),
  pitched_at      timestamptz,
  responded_at    timestamptz,
  generated_pitch text,
  personal_note   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, kit_id)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER press_contacts_updated_at
  BEFORE UPDATE ON press_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER outreach_records_updated_at
  BEFORE UPDATE ON outreach_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE press_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_select_own" ON press_contacts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "contacts_insert_own" ON press_contacts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_update_own" ON press_contacts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "contacts_delete_own" ON press_contacts FOR DELETE USING (user_id = auth.uid());

ALTER TABLE outreach_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outreach_select_own" ON outreach_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "outreach_insert_own" ON outreach_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "outreach_update_own" ON outreach_records FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "outreach_delete_own" ON outreach_records FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS outreach_contact_idx ON outreach_records (contact_id);
CREATE INDEX IF NOT EXISTS outreach_kit_idx ON outreach_records (kit_id);
CREATE INDEX IF NOT EXISTS outreach_status_idx ON outreach_records (status);
