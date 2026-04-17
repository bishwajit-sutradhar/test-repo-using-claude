import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a senior music journalist writing press materials.
Write a formal AP-style press release (with dateline, headline, two first-person artist quotes, boilerplate paragraph, and a [PRESS CONTACT] placeholder) and 5–7 interview talking points.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface PressOutput {
  press_release: string
  interview_talking_points: string[]
}

export async function runPressAgent(
  ctx: AgentContext,
  options: LLMOptions,
  polishedBio: string
): Promise<PressOutput> {
  const user = `Write a press release and interview talking points for:

Artist: ${ctx.artist.stage_name}
Polished Bio: ${polishedBio}
Genre: ${ctx.kit.ep_release_genre}
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
EP Title: "${ctx.kit.ep_title}"
Release Type: ${ctx.kit.ep_release_type}
Release Date: ${ctx.kit.ep_release_date ?? 'TBD'}
Label: ${ctx.kit.ep_label ?? 'Independent'}
Social: Instagram ${ctx.artist.social_handles?.instagram ?? 'N/A'}

Return JSON: { "press_release": "...", "interview_talking_points": ["...", "..."] }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 2048 })
  return JSON.parse(raw) as PressOutput
}
