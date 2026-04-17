export interface ModelInfo {
  id: string
  display_name: string
  description: string
}

export interface ProviderInfo {
  id: string
  display_name: string
  env_key: keyof NodeJS.ProcessEnv
  models: ModelInfo[]
}

export const MODELS_REGISTRY: Record<string, ProviderInfo> = {
  openai: {
    id: 'openai',
    display_name: 'OpenAI',
    env_key: 'OPENAI_API_KEY',
    models: [
      { id: 'gpt-4o',      display_name: 'GPT-4o',      description: 'Best quality, most thorough' },
      { id: 'gpt-4o-mini', display_name: 'GPT-4o Mini', description: 'Faster, lower cost' },
    ],
  },
  gemini: {
    id: 'gemini',
    display_name: 'Google Gemini',
    env_key: 'GEMINI_API_KEY',
    models: [
      { id: 'gemini-1.5-pro',   display_name: 'Gemini 1.5 Pro',   description: 'Best quality' },
      { id: 'gemini-1.5-flash', display_name: 'Gemini 1.5 Flash', description: 'Faster' },
    ],
  },
  anthropic: {
    id: 'anthropic',
    display_name: 'Anthropic Claude',
    env_key: 'ANTHROPIC_API_KEY',
    models: [
      { id: 'claude-opus-4-6',           display_name: 'Claude Opus 4.6',   description: 'Most capable' },
      { id: 'claude-sonnet-4-6',         display_name: 'Claude Sonnet 4.6', description: 'Balanced quality & speed' },
      { id: 'claude-haiku-4-5-20251001', display_name: 'Claude Haiku 4.5',  description: 'Fastest, lowest cost' },
    ],
  },
}

export type ProviderId = keyof typeof MODELS_REGISTRY
