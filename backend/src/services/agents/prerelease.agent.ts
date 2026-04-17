import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions, PreReleasePlan } from '../../types'

const SYSTEM = `You are a music marketing strategist.
Build a realistic pre-release marketing timeline based on the days remaining until release.
Use music industry best practices: teasers 3 weeks out, pre-save campaigns 10–14 days out, day-of content blitz.
If days_remaining <= 3, set condensed: true and return a single "Urgent Launch" phase.
Each phase must have 3–6 concrete, actionable tasks.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface PreReleaseOutput {
  pre_release_plan: PreReleasePlan
}

export async function runPreReleaseAgent(ctx: AgentContext, options: LLMOptions): Promise<PreReleaseOutput> {
  const days = ctx.kit.days_until_release
  const isCondensed = days <= 3

  const user = `Build a pre-release marketing plan for:

Artist: ${ctx.artist.stage_name}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Genre: ${ctx.kit.ep_release_genre}
Vibe: ${ctx.kit.ep_vibe_tags.join(', ')}
Release Date: ${ctx.kit.ep_release_date ?? 'TBD'}
Days Until Release: ${days} ${days <= 0 ? '(ALREADY RELEASED — condensed mode)' : ''}
Platforms: ${ctx.kit.target_platforms.join(', ')}

${isCondensed ? 'Release is imminent or past. Use condensed: true and produce 1 urgent phase.' : `Create ${days > 60 ? '5–6' : days > 30 ? '4–5' : days > 14 ? '3–4' : '2–3'} phases that count down to release day.`}

Return JSON:
{
  "pre_release_plan": {
    "total_days_out": ${days},
    "condensed": ${isCondensed},
    "phases": [
      {
        "phase_name": "string",
        "start_offset_days": number (negative = days before release),
        "end_offset_days": number,
        "tasks": ["string", ...]
      }
    ]
  }
}`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 2048 })
  return JSON.parse(raw) as PreReleaseOutput
}
