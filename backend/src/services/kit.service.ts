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
import { runARFeedbackAgent, ARFeedbackOutput } from './agents/ar_feedback.agent'
import { CreateKitInput, ARFeedbackInput } from '../schemas/kit.schema'
import { KitContent, LLMOptions } from '../types'

export async function listKits(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('ep_kits')
    .select('id, ep_title, ep_release_date, ep_release_type, generation_status, llm_provider, llm_model, target_platforms, generation_duration_ms, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getKit(userId: string, kitId: string) {
  const { data, error } = await supabaseAdmin
    .from('ep_kits')
    .select('*')
    .eq('id', kitId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function createAndGenerateKit(userId: string, input: CreateKitInput) {
  const startTime = Date.now()

  // Fetch artist profile
  const { data: artist, error: artistErr } = await supabaseAdmin
    .from('artists').select('*').eq('user_id', userId).single()
  if (artistErr || !artist) throw new Error('Artist profile not found. Please complete your profile first.')

  // Fetch songs
  const { data: songs, error: songsErr } = await supabaseAdmin
    .from('songs').select('*').eq('user_id', userId).order('track_number')
  if (songsErr) throw songsErr
  if (!songs || songs.length === 0) throw new Error('No songs found. Please add at least one song first.')

  // Create kit row
  const { data: kit, error: kitErr } = await supabaseAdmin
    .from('ep_kits')
    .insert({
      artist_id: artist.id,
      user_id: userId,
      ep_title: input.ep_title,
      ep_release_date: input.ep_release_date,
      ep_label: input.ep_label,
      ep_release_type: input.ep_release_type,
      ep_vibe_tags: input.ep_vibe_tags,
      ep_release_genre: input.ep_release_genre,
      target_audience: input.target_audience,
      target_platforms: input.target_platforms,
      llm_provider: input.provider,
      llm_model: input.model,
      generation_status: 'generating',
    })
    .select().single()
  if (kitErr || !kit) throw kitErr ?? new Error('Failed to create kit row')

  const llmOptions: LLMOptions = {
    provider: input.provider,
    model: input.model,
    json_mode: true,
    max_tokens: 2048,
  }

  const ctx = buildAgentContext(artist, input as unknown as Record<string, unknown>, songs)

  // Mark kit as failed helper
  const markFailed = async () => {
    await supabaseAdmin.from('ep_kits').update({ generation_status: 'failed' }).eq('id', kit.id)
  }

  // ── Step 1: Run Agent 1 (narrative) first — its bio feeds into Agent 2 ──
  let narrativeResult: Awaited<ReturnType<typeof runNarrativeAgent>>
  try {
    narrativeResult = await runNarrativeAgent(ctx, llmOptions)
  } catch (err) {
    await markFailed()
    throw err
  }

  // ── Step 2: Run Agents 2–8 in parallel ────────────────────────────────────
  const [pressResult, contentResult, preReleaseResult, postReleaseResult, platformsResult, syncRadioResult, visualIdentityResult] =
    await Promise.all([
      runPressAgent(ctx, llmOptions, narrativeResult.artist_bio).catch((e: Error) => ({ error: e.message })),
      runContentAgent(ctx, llmOptions).catch((e: Error) => ({ error: e.message })),
      runPreReleaseAgent(ctx, llmOptions).catch((e: Error) => ({ error: e.message })),
      runPostReleaseAgent(ctx, llmOptions).catch((e: Error) => ({ error: e.message })),
      runPlatformsAgent(ctx, llmOptions).catch((e: Error) => ({ error: e.message })),
      runSyncRadioAgent(ctx, llmOptions, narrativeResult.artist_bio).catch((e: Error) => ({ error: e.message })),
      runVisualIdentityAgent(ctx, llmOptions).catch((e: Error) => ({ error: e.message })),
    ])

  const agentsUsed = ['narrative']
  if (!('error' in pressResult)) agentsUsed.push('press')
  if (!('error' in contentResult)) agentsUsed.push('content')
  if (!('error' in preReleaseResult)) agentsUsed.push('pre-release')
  if (!('error' in postReleaseResult)) agentsUsed.push('post-release')
  if (!('error' in platformsResult)) agentsUsed.push('platforms')
  if (!('error' in syncRadioResult)) agentsUsed.push('sync-radio')
  if (!('error' in visualIdentityResult)) agentsUsed.push('visual-identity')

  const content: KitContent = {
    // Agent 1
    artist_bio: narrativeResult.artist_bio,
    ep_overview: narrativeResult.ep_overview,
    // Agent 2
    press_release: 'error' in pressResult ? `Generation failed: ${(pressResult as { error: string }).error}` : pressResult.press_release,
    interview_talking_points: 'error' in pressResult ? [] : pressResult.interview_talking_points,
    // Agent 3
    track_descriptions: 'error' in contentResult ? {} : contentResult.track_descriptions,
    social_captions: 'error' in contentResult
      ? { instagram: '', twitter: '', tiktok: '', facebook: '' }
      : contentResult.social_captions,
    streaming_pitch: 'error' in contentResult ? '' : contentResult.streaming_pitch,
    // Agent 4
    pre_release_plan: 'error' in preReleaseResult
      ? { total_days_out: ctx.kit.days_until_release, condensed: true, phases: [] }
      : preReleaseResult.pre_release_plan,
    // Agent 5
    post_release_plan: 'error' in postReleaseResult
      ? { week_one_tasks: [], month_one_tasks: [], ongoing_tasks: [], playlisting_targets: [] }
      : postReleaseResult.post_release_plan,
    // Agent 6
    platform_pitches: 'error' in platformsResult ? {} : platformsResult.platform_pitches,
    // Agent 7 — Sync & Radio
    sync_radio_pitches: 'error' in syncRadioResult ? undefined : syncRadioResult.sync_radio_pitches,
    // Agent 8 — Visual Identity
    visual_identity_brief: 'error' in visualIdentityResult ? undefined : visualIdentityResult.visual_identity_brief,
    // Meta
    _meta: {
      provider: input.provider,
      model: input.model,
      generated_at: new Date().toISOString(),
      agents_used: agentsUsed,
    },
  }

  const durationMs = Date.now() - startTime

  const { data: completed, error: updateErr } = await supabaseAdmin
    .from('ep_kits')
    .update({
      generation_status: 'complete',
      content,
      generation_duration_ms: durationMs,
    })
    .eq('id', kit.id)
    .select().single()

  if (updateErr) throw updateErr
  return completed
}

export async function deleteKit(userId: string, kitId: string) {
  const { error } = await supabaseAdmin
    .from('ep_kits').delete().eq('id', kitId).eq('user_id', userId)
  if (error) throw error
}

export async function generateARFeedback(
  userId: string,
  kitId: string,
  input: ARFeedbackInput
): Promise<ARFeedbackOutput & { generated_at: string; provider: string; model: string }> {
  const { data: kit, error: kitErr } = await supabaseAdmin
    .from('ep_kits').select('*').eq('id', kitId).eq('user_id', userId).single()
  if (kitErr || !kit) throw new Error('Kit not found')
  if (!kit.content) throw new Error('Kit has no content yet')

  const { data: artist, error: artistErr } = await supabaseAdmin
    .from('artists').select('*').eq('user_id', userId).single()
  if (artistErr || !artist) throw new Error('Artist profile not found')

  const { data: songs } = await supabaseAdmin
    .from('songs').select('*').eq('user_id', userId).order('track_number')

  const ctx = buildAgentContext(artist, kit, songs ?? [])
  const llmOptions: LLMOptions = { provider: input.provider, model: input.model, json_mode: true, max_tokens: 1500 }

  const feedback = await runARFeedbackAgent(ctx, llmOptions, {
    artist_bio: kit.content.artist_bio ?? '',
    ep_overview: kit.content.ep_overview ?? '',
    streaming_pitch: kit.content.streaming_pitch ?? '',
  })

  const result = { ...feedback, generated_at: new Date().toISOString(), provider: input.provider, model: input.model }

  const { error: updateErr } = await supabaseAdmin
    .from('ep_kits').update({ ar_feedback: result }).eq('id', kitId)
  if (updateErr) throw updateErr

  return result
}
