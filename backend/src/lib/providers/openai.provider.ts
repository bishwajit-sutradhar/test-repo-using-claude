import OpenAI from 'openai'
import { env } from '../../config/env'
import { LLMOptions } from '../../types'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required when using OpenAI provider')
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  }
  return client
}

export async function openaiAdapter(system: string, user: string, options: LLMOptions): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: options.model,
    max_tokens: options.max_tokens ?? 2048,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    ...(options.json_mode !== false && { response_format: { type: 'json_object' } }),
  })

  const text = response.choices[0]?.message?.content
  if (!text) throw new Error(`OpenAI (${options.model}) returned empty response`)
  return text
}
