import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a sync licensing consultant and radio plugger with a track record of placements on BBC Radio 6 Music, NPR, and major TV networks.
Write targeted pitches for each sync and radio category.
For sync: focus on emotional context, BPM if available, musical key, and scene-matching potential (what kind of moment in a show/film/ad would this track fit?).
For radio: focus on format fit, comparable artists already played by that station, and why this track works for that audience right now.
Keep each pitch to 60-90 words. Be specific, not generic.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface SyncRadioOutput {
  sync_radio_pitches: {
    sync_tv: string
    sync_film: string
    sync_advertising: string
    sync_games: string
    radio_college: string
    radio_indie: string
    radio_public: string
  }
}

export async function runSyncRadioAgent(
  ctx: AgentContext,
  options: LLMOptions,
  artistBio: string
): Promise<SyncRadioOutput> {
  const songList = ctx.songs.map((s) =>
    `  - "${s.title}" | BPM: ${s.bpm ?? 'N/A'} | Key: ${s.key_signature ?? 'N/A'} | Mood: ${s.mood?.join(', ') ?? 'N/A'} | Themes: ${s.themes ?? 'N/A'}`
  ).join('\n')

  const user = `Generate sync licensing and radio pitches for this release:

Artist: ${ctx.artist.stage_name}
Bio: ${artistBio}
Genre: ${ctx.kit.ep_release_genre}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}

Tracks:
${songList}

Write specific pitches for:
- sync_tv: TV drama / documentary sync placement
- sync_film: Film sync placement (indie or studio)
- sync_advertising: Brand / commercial sync
- sync_games: Video game soundtrack sync
- radio_college: College radio programming
- radio_indie: Independent/community radio
- radio_public: Public radio (BBC 6 Music, NPR tier)

Return JSON: { "sync_radio_pitches": { "sync_tv": "...", "sync_film": "...", "sync_advertising": "...", "sync_games": "...", "radio_college": "...", "radio_indie": "...", "radio_public": "..." } }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 1500 })
  return JSON.parse(raw) as SyncRadioOutput
}
