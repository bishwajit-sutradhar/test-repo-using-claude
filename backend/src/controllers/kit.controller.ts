import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as kitService from '../services/kit.service'
import * as kitRegenerateService from '../services/kit.regenerate.service'

export async function listKits(req: AuthenticatedRequest, res: Response) {
  const kits = await kitService.listKits(req.userId)
  res.json(kits)
}

export async function getKit(req: AuthenticatedRequest, res: Response) {
  const kit = await kitService.getKit(req.userId, req.params.id)
  if (!kit) {
    res.status(404).json({ error: 'Kit not found' })
    return
  }
  res.json(kit)
}

export async function createKit(req: AuthenticatedRequest, res: Response) {
  const kit = await kitService.createAndGenerateKit(req.userId, req.body)
  res.status(201).json(kit)
}

export async function deleteKit(req: AuthenticatedRequest, res: Response) {
  await kitService.deleteKit(req.userId, req.params.id)
  res.status(204).send()
}

export async function regenerateSection(req: AuthenticatedRequest, res: Response) {
  const partial = await kitRegenerateService.regenerateSection(req.userId, req.params.id, req.body)
  res.json(partial)
}

export async function generateARFeedback(req: AuthenticatedRequest, res: Response) {
  const feedback = await kitService.generateARFeedback(req.userId, req.params.id, req.body)
  res.json(feedback)
}
