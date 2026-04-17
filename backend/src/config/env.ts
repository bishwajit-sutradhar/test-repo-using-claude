import { cleanEnv, str, port, num, makeValidator } from 'envalid'

const llmProvider = makeValidator<'openai' | 'gemini' | 'anthropic'>((val) => {
  const allowed = ['openai', 'gemini', 'anthropic']
  if (!allowed.includes(val)) {
    throw new Error(`LLM_PROVIDER must be one of: ${allowed.join(', ')}`)
  }
  return val as 'openai' | 'gemini' | 'anthropic'
})

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3001 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  FRONTEND_URL: str({ default: 'http://localhost:5173' }),

  SUPABASE_URL: str(),
  SUPABASE_SERVICE_ROLE_KEY: str(),
  SUPABASE_JWT_SECRET: str(),

  LLM_PROVIDER: llmProvider({ default: 'openai' }),
  OPENAI_API_KEY: str({ default: '' }),
  GEMINI_API_KEY: str({ default: '' }),
  ANTHROPIC_API_KEY: str({ default: '' }),

  RATE_LIMIT_WINDOW_MS: num({ default: 900_000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  KIT_GENERATION_LIMIT_PER_HOUR: num({ default: 5 }),
})
