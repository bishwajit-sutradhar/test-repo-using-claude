import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions, PostReleasePlan } from '../../types'

const SYSTEM = `You are a music release strategist focused on post-launch momentum.
Generate a three-horizon action plan: week one (maximize algorithmic boost window), month one (playlist pitching and audience building), and ongoing (catalog health, re-promotion).
Also suggest 5–8 specific playlist names worth pitching that match the genre and vibe.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface PostReleaseOutput {
  post_release_plan: PostReleasePlan
}

export async function runPostReleaseAgent(ctx: AgentContext, options: LLMOptions): Promise<PostReleaseOutput> {
  const user = `Build a post-release action plan for:

Artist: ${ctx.artist.stage_name}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Genre: ${ctx.kit.ep_release_genre}
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}
Platforms: ${ctx.kit.target_platforms.join(', ')}

Return JSON:
{
  "post_release_plan": {
    "week_one_tasks": ["string", ...],
    "month_one_tasks": ["string", ...],
    "ongoing_tasks": ["string", ...],
    "playlisting_targets": ["playlist name", ...]
  }
}`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 1500 })
  return JSON.parse(raw) as PostReleaseOutput
}
