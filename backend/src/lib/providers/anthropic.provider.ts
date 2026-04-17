import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env'
import { LLMOptions } from '../../types'

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required when using Anthropic provider')
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }
  return client
}

export async function anthropicAdapter(system: string, user: string, options: LLMOptions): Promise<string> {
  // Anthropic has no native JSON mode — append instruction to system prompt
  const systemText = options.json_mode !== false
    ? `${system}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, no commentary before or after the JSON object.`
    : system

  const response = await getClient().messages.create({
    model: options.model,
    max_tokens: options.max_tokens ?? 2048,
    system: [
      {
        type: 'text',
        text: systemText,
        cache_control: { type: 'ephemeral' }, // prompt caching on repeated system prompts
      },
    ],
    messages: [{ role: 'user', content: user }],
  })

  const block = response.content[0]
  if (block.type !== 'text' || !block.text) throw new Error(`Anthropic (${options.model}) returned empty response`)
  return block.text
}
