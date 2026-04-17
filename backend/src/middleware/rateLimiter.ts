import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

export const kitGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.KIT_GENERATION_LIMIT_PER_HOUR,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Kit generation limit reached. You can generate up to 5 kits per hour.' },
})
