import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a social media manager and content specialist for an independent record label.
Write platform-specific captions (Instagram ≤300 words with 5–8 hashtags, Twitter ≤280 chars, TikTok punchy 1–2 lines, Facebook conversational 200–400 chars), per-track descriptions (2–3 sentences each keyed by track title), and a general streaming pitch (80–100 words).
Respond with a single valid JSON object only — no code fences, no commentary.`

interface ContentOutput {
  track_descriptions: Record<string, string>
  social_captions: {
    instagram: string
    twitter: string
    tiktok: string
    facebook: string
  }
  streaming_pitch: string
}

export async function runContentAgent(ctx: AgentContext, options: LLMOptions): Promise<ContentOutput> {
  const trackList = ctx.songs
    .sort((a, b) => a.track_number - b.track_number)
    .map((t) => `  ${t.track_number}. "${t.title}" — mood: ${t.mood?.join(', ') ?? 'N/A'}, themes: ${t.themes ?? 'N/A'}`)
    .join('\n')

  const user = `Write content for:

Artist: ${ctx.artist.stage_name}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Genre: ${ctx.kit.ep_release_genre}
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}
Release Date: ${ctx.kit.ep_release_date ?? 'TBD'}

Tracks:
${trackList}

Return JSON:
{
  "track_descriptions": { "<track title>": "description", ... },
  "social_captions": { "instagram": "...", "twitter": "...", "tiktok": "...", "facebook": "..." },
  "streaming_pitch": "..."
}`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 2048 })
  return JSON.parse(raw) as ContentOutput
}
