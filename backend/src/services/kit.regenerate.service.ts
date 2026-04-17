import { supabaseAdmin } from '../lib/supabaseAdmin'
import { buildAgentContext } from './prompt.service'
import { runNarrativeAgent } from './agents/narrative.agent'
import { runPressAgent } from './agents/press.agent'
import { runContentAgent } from './agents/content.agent'
import { runPreReleaseAgent } from './agents/prerelease.agent'
import { runPostReleaseAgent } from './agents/postrelease.agent'
import { runPlatformsAgent } from './agents/platforms.agent'
import { runSyncRadioAgent } from './agents/sync_radio.agent'
import { runVisualIdentityAgent } from './agents/visual_identity.agent'
import { RegenerateSectionInput } from '../schemas/kit.schema'
import { KitContent, LLMOptions } from '../types'

export async function regenerateSection(
  userId: string,
  kitId: string,
  input: RegenerateSectionInput
): Promise<Partial<KitContent>> {
  // Fetch kit and verify ownership
  const { data: kit, error: kitErr } = await supabaseAdmin
    .from('ep_kits').select('*').eq('id', kitId).eq('user_id', userId).single()
  if (kitErr || !kit) throw new Error('Kit not found')
  if (!kit.content) throw new Error('Kit has no content to regenerate')

  const { data: artist, error: artistErr } = await supabaseAdmin
    .from('artists').select('*').eq('user_id', userId).single()
  if (artistErr || !artist) throw new Error('Artist profile not found')

  const { data: songs } = await supabaseAdmin
    .from('songs').select('*').eq('user_id', userId).order('track_number')

  const ctx = buildAgentContext(artist, kit, songs ?? [])
  const llmOptions: LLMOptions = {
    provider: input.provider,
    model: input.model,
    json_mode: true,
    max_tokens: 2048,
  }

  let partial: Partial<KitContent> = {}

  const existingBio: string = kit.content.artist_bio ?? ''

  switch (input.section) {
    case 'artist_bio':
    case 'ep_overview': {
      const result = await runNarrativeAgent(ctx, llmOptions)
      partial = input.section === 'artist_bio'
        ? { artist_bio: result.artist_bio }
        : { ep_overview: result.ep_overview }
      break
    }
    case 'press_release':
    case 'interview_talking_points': {
      const result = await runPressAgent(ctx, llmOptions, existingBio)
      partial = input.section === 'press_release'
        ? { press_release: result.press_release }
        : { interview_talking_points: result.interview_talking_points }
      break
    }
    case 'track_descriptions':
    case 'social_captions':
    case 'streaming_pitch': {
      const result = await runContentAgent(ctx, llmOptions)
      partial = { [input.section]: (result as unknown as Record<string, unknown>)[input.section] } as Partial<KitContent>
      break
    }
    case 'pre_release_plan': {
      const result = await runPreReleaseAgent(ctx, llmOptions)
      partial = { pre_release_plan: result.pre_release_plan }
      break
    }
    case 'post_release_plan': {
      const result = await runPostReleaseAgent(ctx, llmOptions)
      partial = { post_release_plan: result.post_release_plan }
      break
    }
    case 'platform_pitches': {
      const result = await runPlatformsAgent(ctx, llmOptions)
      partial = { platform_pitches: result.platform_pitches }
      break
    }
    case 'sync_radio_pitches': {
      const result = await runSyncRadioAgent(ctx, llmOptions, existingBio)
      partial = { sync_radio_pitches: result.sync_radio_pitches }
      break
    }
    case 'visual_identity_brief': {
      const result = await runVisualIdentityAgent(ctx, llmOptions)
      partial = { visual_identity_brief: result.visual_identity_brief }
      break
    }
  }

  // Merge partial into existing content and write back
  const updatedContent = { ...kit.content, ...partial }
  const { error: updateErr } = await supabaseAdmin
    .from('ep_kits').update({ content: updatedContent }).eq('id', kitId)
  if (updateErr) throw updateErr

  return partial
}
