import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env'
import { LLMOptions } from '../../types'

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!client) {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required when using Gemini provider')
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  }
  return client
}

export async function geminiAdapter(system: string, user: string, options: LLMOptions): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: options.model,
    systemInstruction: system,
    generationConfig: {
      ...(options.json_mode !== false && { responseMimeType: 'application/json' }),
      maxOutputTokens: options.max_tokens ?? 2048,
    },
  })

  const result = await model.generateContent(user)
  const text = result.response.text()
  if (!text) throw new Error(`Gemini (${options.model}) returned empty response`)
  return text
}
