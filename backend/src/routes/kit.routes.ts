import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { kitGenerationLimiter } from '../middleware/rateLimiter'
import { createKitSchema, regenerateSectionSchema, arFeedbackSchema } from '../schemas/kit.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/kit.controller'

const router = Router()

router.use(authMiddleware as never)

router.get('/', asyncHandler(controller.listKits))
router.get('/:id', asyncHandler(controller.getKit))
router.post('/', kitGenerationLimiter, validateBody(createKitSchema), asyncHandler(controller.createKit))
router.delete('/:id', asyncHandler(controller.deleteKit))
router.patch('/:id/regenerate', kitGenerationLimiter, validateBody(regenerateSectionSchema), asyncHandler(controller.regenerateSection))
router.post('/:id/ar-feedback', kitGenerationLimiter, validateBody(arFeedbackSchema), asyncHandler(controller.generateARFeedback))

export default router
