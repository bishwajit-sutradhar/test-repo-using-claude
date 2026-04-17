import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import * as goalsService from '../services/goals.service'

export async function getGoals(req: AuthenticatedRequest, res: Response) {
  const goals = await goalsService.getGoals(req.userId)
  res.json(goals)
}

export async function upsertGoals(req: AuthenticatedRequest, res: Response) {
  const goals = await goalsService.upsertGoals(req.userId, req.body)
  res.json(goals)
}

export async function generateRoadmap(req: AuthenticatedRequest, res: Response) {
  const roadmap = await goalsService.generateRoadmap(req.userId, req.body)
  res.status(201).json(roadmap)
}

export async function getLatestRoadmap(req: AuthenticatedRequest, res: Response) {
  const roadmap = await goalsService.getLatestRoadmap(req.userId)
  res.json(roadmap)
}
