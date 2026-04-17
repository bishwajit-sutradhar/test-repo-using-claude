import { LLMOptions } from '../types'
import { openaiAdapter } from './providers/openai.provider'
import { geminiAdapter } from './providers/gemini.provider'
import { anthropicAdapter } from './providers/anthropic.provider'

export async function generateCompletion(
  system: string,
  user: string,
  options: LLMOptions
): Promise<string> {
  switch (options.provider) {
    case 'openai':    return openaiAdapter(system, user, options)
    case 'gemini':    return geminiAdapter(system, user, options)
    case 'anthropic': return anthropicAdapter(system, user, options)
    default:
      throw new Error(`Unknown provider: ${(options as LLMOptions).provider}`)
  }
}
