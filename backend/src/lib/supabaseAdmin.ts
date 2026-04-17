import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// Service-role client: bypasses RLS — backend use only, NEVER expose to frontend
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
