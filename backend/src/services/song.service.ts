import { supabaseAdmin } from '../lib/supabaseAdmin'
import { CreateSongInput, UpdateSongInput } from '../schemas/song.schema'

async function getArtistId(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('artists')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new Error('Artist profile not found. Please complete your profile first.')
  return data.id
}

export async function getSongs(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('track_number', { ascending: true })

  if (error) throw error
  return data
}

export async function createSong(userId: string, input: CreateSongInput) {
  const artistId = await getArtistId(userId)
  const { data, error } = await supabaseAdmin
    .from('songs')
    .insert({ ...input, user_id: userId, artist_id: artistId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSong(userId: string, songId: string, input: UpdateSongInput) {
  const { data, error } = await supabaseAdmin
    .from('songs')
    .update(input)
    .eq('id', songId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Song not found')
  return data
}

export async function deleteSong(userId: string, songId: string) {
  const { error } = await supabaseAdmin
    .from('songs')
    .delete()
    .eq('id', songId)
    .eq('user_id', userId)

  if (error) throw error
}
