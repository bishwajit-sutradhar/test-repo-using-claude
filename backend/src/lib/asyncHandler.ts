import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'

type AsyncRouteHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>

export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthenticatedRequest, res, next).catch(next)
  }
}
