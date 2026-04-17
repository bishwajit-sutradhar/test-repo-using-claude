import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as checklistService from '../services/checklist.service'

export async function getProgress(req: AuthenticatedRequest, res: Response) {
  const progress = await checklistService.getProgress(req.userId, req.params.kitId)
  res.json(progress)
}

export async function toggleItem(req: AuthenticatedRequest, res: Response) {
  const record = await checklistService.toggleItem(req.userId, req.params.kitId, req.body)
  res.json(record)
}
