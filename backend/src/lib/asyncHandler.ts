import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'

type AsyncRouteHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>

export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
