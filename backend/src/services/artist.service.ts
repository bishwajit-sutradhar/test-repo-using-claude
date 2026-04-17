import { supabaseAdmin } from '../lib/supabaseAdmin'
import { CreateArtistInput, UpdateArtistInput } from '../schemas/artist.schema'

export async function getArtistByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('artists')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createArtist(userId: string, input: CreateArtistInput) {
  const { data, error } = await supabaseAdmin
    .from('artists')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateArtist(userId: string, input: UpdateArtistInput) {
  const { data, error } = await supabaseAdmin
    .from('artists')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
