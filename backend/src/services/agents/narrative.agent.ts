import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a music publicist specializing in authentic artist storytelling.
Your only job is to write an artist bio and an EP overview.
Match the tone to the artist's genre and vibe tags. Never invent facts.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface NarrativeOutput {
  artist_bio: string
  ep_overview: string
}

export async function runNarrativeAgent(ctx: AgentContext, options: LLMOptions): Promise<NarrativeOutput> {
  const user = `Write the artist bio (150–250 words, third-person) and EP overview (100–150 words) for:

Artist: ${ctx.artist.stage_name}
Artist Genre: ${ctx.artist.genre}
Location: ${ctx.artist.location ?? 'N/A'}
Years Active: ${ctx.artist.years_active ?? 'N/A'}
Influences: ${ctx.artist.influences?.join(', ') ?? 'N/A'}
Artist Notes: ${ctx.artist.bio_raw ?? 'N/A'}

EP Title: "${ctx.kit.ep_title}"
Release Type: ${ctx.kit.ep_release_type}
Release Genre: ${ctx.kit.ep_release_genre}
Vibe / Feels: ${ctx.kit.ep_vibe_tags.join(', ')}
Label: ${ctx.kit.ep_label ?? 'Independent'}

Return JSON: { "artist_bio": "...", "ep_overview": "..." }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 1024 })
  return JSON.parse(raw) as NarrativeOutput
}
