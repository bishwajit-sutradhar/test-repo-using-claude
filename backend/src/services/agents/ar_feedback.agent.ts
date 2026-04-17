import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a senior A&R representative at an established independent label with 20 years of experience signing and developing artists.
Give honest, specific, industry-grade feedback on this EP release. Do not flatter.
If there are genuine concerns, say them clearly. If there are real strengths, name them specifically.
Your job is to help this artist understand where they stand and what to do next.
Respond with a single valid JSON object only — no code fences, no commentary.`

export interface ARFeedbackOutput {
  market_positioning: string
  strengths: string[]
  improvement_areas: string[]
  career_trajectory: string
  verdict: string
}

export async function runARFeedbackAgent(
  ctx: AgentContext,
  options: LLMOptions,
  existingContent: { artist_bio: string; ep_overview: string; streaming_pitch: string }
): Promise<ARFeedbackOutput> {
  const songList = ctx.songs.map((s) =>
    `  - "${s.title}" | BPM: ${s.bpm ?? 'N/A'} | Key: ${s.key_signature ?? 'N/A'} | Mood: ${s.mood?.join(', ') ?? 'N/A'} | Themes: ${s.themes ?? 'N/A'}${s.lyrics_excerpt ? ` | Lyrics: "${s.lyrics_excerpt}"` : ''}`
  ).join('\n')

  const user = `Review this artist's EP release as a senior A&R rep:

--- ARTIST BIO (AI-generated) ---
${existingContent.artist_bio}

--- EP OVERVIEW ---
${existingContent.ep_overview}

--- STREAMING PITCH ---
${existingContent.streaming_pitch}

--- RELEASE DETAILS ---
Artist: ${ctx.artist.stage_name}
Genre: ${ctx.kit.ep_release_genre}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Vibe Tags: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}
Platforms: ${ctx.kit.target_platforms.join(', ')}
Influences: ${ctx.artist.influences?.join(', ') ?? 'N/A'}

--- TRACKS ---
${songList}

Provide your honest A&R assessment:
- market_positioning: 2-3 sentences on where this artist fits in the current market
- strengths: exactly 3 specific strengths (things working in their favour)
- improvement_areas: exactly 3 specific areas to develop before next release
- career_trajectory: 3-4 sentences on the realistic career arc if they execute well
- verdict: 1 paragraph "if this landed on my desk" honest take — would you sign/develop this artist, and what's the deciding factor?

Return JSON: { "market_positioning": "...", "strengths": ["...", "...", "..."], "improvement_areas": ["...", "...", "..."], "career_trajectory": "...", "verdict": "..." }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 1500 })
  return JSON.parse(raw) as ARFeedbackOutput
}
