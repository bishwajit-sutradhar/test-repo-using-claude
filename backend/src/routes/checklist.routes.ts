import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { toggleChecklistItemSchema } from '../schemas/checklist.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/checklist.controller'

const router = Router()

router.use(authMiddleware as never)

router.get('/:kitId', asyncHandler(controller.getProgress))
router.post('/:kitId/toggle', validateBody(toggleChecklistItemSchema), asyncHandler(controller.toggleItem))

export default router
