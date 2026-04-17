import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { env } from './config/env'
import { generalLimiter } from './middleware/rateLimiter'
import { apiRoutes } from './routes'

const app = express()

// Security headers
app.use(helmet())

// CORS — explicit allowlist only
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Body parsing — 50kb limit to prevent payload flooding
app.use(express.json({ limit: '50kb' }))

// General rate limiter on all routes
app.use(generalLimiter)

// API routes
app.use('/api', apiRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// Global error handler — must be last and have 4 args
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error
    ? err.message
    : (typeof err === 'object' && err !== null && 'message' in err)
      ? String((err as Record<string, unknown>).message)
      : 'Internal server error'
  console.error('[API ERROR]', message)
  res.status(500).json({ error: message })
})

export default app
