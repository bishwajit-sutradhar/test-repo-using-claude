import { supabaseAdmin } from '../lib/supabaseAdmin'
import {
  CreateContactInput,
  UpdateContactInput,
  UpdateOutreachStatusInput,
  GeneratePitchInput,
} from '../schemas/contact.schema'
import { runPitchEmailAgent } from './agents/pitch_email.agent'
import { LLMOptions } from '../types'

export async function listContacts(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('press_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createContact(userId: string, input: CreateContactInput) {
  const { data, error } = await supabaseAdmin
    .from('press_contacts')
    .insert({ ...input, user_id: userId, website_url: input.website_url || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateContact(userId: string, contactId: string, input: UpdateContactInput) {
  const { data, error } = await supabaseAdmin
    .from('press_contacts')
    .update({ ...input, website_url: input.website_url || null })
    .eq('id', contactId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteContact(userId: string, contactId: string) {
  const { error } = await supabaseAdmin
    .from('press_contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function listOutreachForKit(userId: string, kitId: string) {
  const { data, error } = await supabaseAdmin
    .from('outreach_records')
    .select('*, contact:press_contacts(*)')
    .eq('user_id', userId)
    .eq('kit_id', kitId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertOutreachRecord(userId: string, contactId: string, kitId: string) {
  const { data, error } = await supabaseAdmin
    .from('outreach_records')
    .upsert(
      { user_id: userId, contact_id: contactId, kit_id: kitId, status: 'not_pitched' },
      { onConflict: 'contact_id,kit_id', ignoreDuplicates: true }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOutreachStatus(
  userId: string,
  recordId: string,
  input: UpdateOutreachStatusInput
) {
  const updates: Record<string, unknown> = {
    status: input.status,
    personal_note: input.personal_note,
  }
  if (input.status === 'pitched') updates.pitched_at = new Date().toISOString()
  if (input.status === 'responded') updates.responded_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('outreach_records')
    .update(updates)
    .eq('id', recordId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function generatePitchEmail(userId: string, input: GeneratePitchInput) {
  // Fetch contact
  const { data: contact, error: contactErr } = await supabaseAdmin
    .from('press_contacts')
    .select('*')
    .eq('id', input.contact_id)
    .eq('user_id', userId)
    .single()
  if (contactErr || !contact) throw new Error('Contact not found')

  // Fetch kit content
  const { data: kit, error: kitErr } = await supabaseAdmin
    .from('ep_kits')
    .select('content, ep_title, ep_release_genre')
    .eq('id', input.kit_id)
    .eq('user_id', userId)
    .single()
  if (kitErr || !kit?.content) throw new Error('Kit not found or has no content')

  const llmOptions: LLMOptions = {
    provider: input.provider,
    model: input.model,
    json_mode: true,
    max_tokens: 600,
  }

  const result = await runPitchEmailAgent(
    { name: contact.name, publication: contact.publication, contact_type: contact.contact_type },
    {
      press_release: kit.content.press_release ?? '',
      artist_bio: kit.content.artist_bio ?? '',
      streaming_pitch: kit.content.streaming_pitch ?? '',
      ep_title: kit.ep_title,
      ep_release_genre: kit.ep_release_genre,
    },
    llmOptions
  )

  // Save the pitch to the outreach record (upsert)
  await supabaseAdmin
    .from('outreach_records')
    .upsert(
      {
        user_id: userId,
        contact_id: input.contact_id,
        kit_id: input.kit_id,
        generated_pitch: `Subject: ${result.subject}\n\n${result.body}`,
      },
      { onConflict: 'contact_id,kit_id' }
    )

  return result
}
