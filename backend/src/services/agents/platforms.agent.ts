import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions, StreamingPlatform } from '../../types'

const SYSTEM = `You are a DSP relations specialist who writes tailored editorial pitches for streaming platforms.
Tailor each pitch to the platform's culture:
- Spotify: Discover Weekly signals, playlist naming, algorithmic discovery
- Apple Music: editorial voice, "New Music Daily", curator relationships
- Tidal: audio quality, artist narrative depth, HiFi audience
- YouTube Music: video content potential, official audio/video strategy
- SoundCloud: indie authenticity, community, early-fan discovery
- Bandcamp: direct-to-fan economics, superfan engagement, name-your-price
- Amazon Music: Alexa/voice discovery, Prime audience, family-friendly framing if appropriate
- Deezer: Flow algorithm, mood-based playlisting, European audience nuance
Write ONLY pitches for the platforms listed. Each pitch is 60–100 words.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface PlatformsOutput {
  platform_pitches: Partial<Record<StreamingPlatform, string>>
}

export async function runPlatformsAgent(ctx: AgentContext, options: LLMOptions): Promise<PlatformsOutput> {
  const user = `Write streaming pitches for the following platforms ONLY: ${ctx.kit.target_platforms.join(', ')}

Artist: ${ctx.artist.stage_name}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Genre: ${ctx.kit.ep_release_genre}
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}
Release Date: ${ctx.kit.ep_release_date ?? 'TBD'}

Return JSON:
{
  "platform_pitches": {
    ${ctx.kit.target_platforms.map((p) => `"${p}": "..."`).join(',\n    ')}
  }
}`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 2048 })
  return JSON.parse(raw) as PlatformsOutput
}
