import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { kitGenerationLimiter } from '../middleware/rateLimiter'
import { createGoalsSchema, generateRoadmapSchema } from '../schemas/goals.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/goals.controller'

const router = Router()

router.use(authMiddleware as never)

router.get('/', asyncHandler(controller.getGoals))
router.post('/', validateBody(createGoalsSchema), asyncHandler(controller.upsertGoals))
router.post('/roadmap', kitGenerationLimiter, validateBody(generateRoadmapSchema), asyncHandler(controller.generateRoadmap))
router.get('/roadmap/latest', asyncHandler(controller.getLatestRoadmap))

export default router
