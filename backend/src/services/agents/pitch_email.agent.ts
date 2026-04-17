import { generateCompletion } from '../../lib/llmClient'
import { LLMOptions } from '../../types'

const SYSTEM = `You are a music publicist who writes highly personalised cold-pitch emails.
Write emails that sound genuine, not templated.
- For curators: keep to 120-150 words, focus on sonic fit and playlist alignment
- For press: 150-200 words, lead with a story angle or cultural hook
- For radio: 120-150 words, focus on format fit and comparable airplay artists
Never start the email with "I hope this email finds you well" or similar generic openers.
Respond with a single valid JSON object only — no code fences, no commentary.`

interface PitchEmailOutput {
  subject: string
  body: string
}

export async function runPitchEmailAgent(
  contact: { name: string; publication?: string; contact_type: string },
  kitContent: { press_release: string; artist_bio: string; streaming_pitch: string; ep_title: string; ep_release_genre: string },
  options: LLMOptions
): Promise<PitchEmailOutput> {
  const user = `Write a personalised pitch email for this contact about this release:

Contact: ${contact.name}${contact.publication ? ` at ${contact.publication}` : ''}
Contact Type: ${contact.contact_type}

--- ARTIST BIO ---
${kitContent.artist_bio}

--- RELEASE ---
EP: "${kitContent.ep_title}" | Genre: ${kitContent.ep_release_genre}

--- STREAMING PITCH ---
${kitContent.streaming_pitch}

--- PRESS RELEASE (reference, don't copy) ---
${kitContent.press_release.slice(0, 500)}...

Write a personalised email appropriate for a ${contact.contact_type}. Address it to ${contact.name}.
Return JSON: { "subject": "...", "body": "..." }`

  const raw = await generateCompletion(SYSTEM, user, { ...options, json_mode: true, max_tokens: 600 })
  return JSON.parse(raw) as PitchEmailOutput
}
