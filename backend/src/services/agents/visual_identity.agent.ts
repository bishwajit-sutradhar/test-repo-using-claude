import { generateCompletion } from '../../lib/llmClient'
import { AgentContext, LLMOptions } from '../../types'

const SYSTEM = `You are a creative director and brand strategist specializing in independent musicians.
Generate a cohesive visual identity brief that an artist can hand directly to a designer or photographer.
Be specific and evocative. Use real design and photography terminology.
Do NOT invent hex codes — describe colors as cinematic descriptors (e.g. "desaturated amber like polaroid burn", "near-black with a blue-green undertone").
Reference real visual artists, directors, or photographers when relevant to ground the aesthetic.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface VisualIdentityOutput {
  visual_identity_brief: {
    color_palette: Array<{ name: string; hex_descriptor: string; usage: string }>
    photography_direction: string
    artwork_brief: {
      mood: string
      composition: string
      reference_artists: string[]
      style_notes: string
    }
    typography_mood: string
    merchandise_concepts: string[]
  }
}

export async function runVisualIdentityAgent(
  ctx: AgentContext,
  options: LLMOptions
): Promise<VisualIdentityOutput> {
  const songList = ctx.songs.map((s) =>
    `  - "${s.title}"${s.mood?.length ? ` | Mood: ${s.mood.join(', ')}` : ''}${s.themes ? ` | Themes: ${s.themes}` : ''}`
  ).join('\n')

  const user = `Create a complete visual identity brief for this music release:

Artist: ${ctx.artist.stage_name}
Genre: ${ctx.kit.ep_release_genre}
EP: "${ctx.kit.ep_title}" (${ctx.kit.ep_release_type})
Vibe / Feel: ${ctx.kit.ep_vibe_tags.join(', ')}
Target Audience: ${ctx.kit.target_audience}
Influences: ${ctx.artist.influences?.join(', ') ?? 'N/A'}
Location: ${ctx.artist.location ?? 'N/A'}

Tracks:
${songList}

Generate:
- color_palette: exactly 5 colors, each with name, hex_descriptor (evocative phrase, no fake hex codes), and usage note
- photography_direction: 100-150 word brief for a photographer (lighting, setting, poses, emotional direction)
- artwork_brief: { mood, composition, reference_artists (2-3 real visual artists/directors), style_notes }
- typography_mood: 30-50 word description of the right font feel (e.g. "rough-edged gothic with organic imperfections")
- merchandise_concepts: 3 specific merch ideas tied to the EP's themes and aesthetic

Return JSON matching this structure exactly.`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 1500 })
  return JSON.parse(raw) as VisualIdentityOutput
}
