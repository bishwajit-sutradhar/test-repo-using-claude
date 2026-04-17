import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { AuthenticatedRequest } from '../types'

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)
  supabaseAdmin.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }
    req.userId = user.id
    next()
  }).catch(next)
}
