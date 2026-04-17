import { generateCompletion } from '../../lib/llmClient'
import { LLMOptions } from '../../types'

const SYSTEM = `You are a senior music career coach who builds week-by-week growth plans for independent artists.
Produce a 13-week (90-day) plan tied specifically to the artist's stated goals. No generic advice.
Every week must have actionable, specific tasks in 4 lanes: distribution, marketing, networking, live_sync.
Milestones should be meaningful checkpoints (e.g. "Week 4: First sync placement pitched to 5 libraries").
Respond with a single valid JSON object only — no code fences, no commentary.`

interface RoadmapWeek {
  week_number: number
  distribution: string[]
  marketing: string[]
  networking: string[]
  live_sync: string[]
}

interface RoadmapContent {
  summary: string
  weeks: RoadmapWeek[]
  milestones: Array<{ week: number; milestone: string }>
}

interface RoadmapOutput {
  roadmap: RoadmapContent
}

export async function runRoadmapAgent(
  artist: { stage_name: string; genre: string; location?: string; years_active?: number },
  goals: { goal_1: string; goal_2?: string; goal_3?: string },
  options: LLMOptions
): Promise<RoadmapContent> {
  const goalsList = [goals.goal_1, goals.goal_2, goals.goal_3]
    .filter(Boolean)
    .map((g, i) => `  ${i + 1}. ${g}`)
    .join('\n')

  const user = `Build a 13-week career growth plan for this artist:

Artist: ${artist.stage_name}
Genre: ${artist.genre}
Location: ${artist.location ?? 'N/A'}
Years Active: ${artist.years_active ?? 'N/A'}

Career Goals (next 90 days):
${goalsList}

For each of the 13 weeks, provide 2-4 specific actions per lane:
- distribution: DSP strategy, uploads, pitching, metadata, playlist submissions
- marketing: social content, ads, email, community building, content calendar
- networking: A&R contacts, collaborators, blogs, sync libraries, industry events
- live_sync: gig booking, sync licensing outreach, opportunities, live content

Also include 4-6 milestone checkpoints tied directly to the goals.
Include a 2-3 sentence summary tying the plan to the specific goals.

Return JSON: { "roadmap": { "summary": "...", "weeks": [{ "week_number": 1, "distribution": [...], "marketing": [...], "networking": [...], "live_sync": [...] }, ...], "milestones": [{ "week": 4, "milestone": "..." }, ...] } }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 4096 })
  const parsed = JSON.parse(raw) as RoadmapOutput
  return parsed.roadmap
}
