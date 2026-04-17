import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { kitGenerationLimiter } from '../middleware/rateLimiter'
import {
  createContactSchema,
  updateContactSchema,
  updateOutreachStatusSchema,
  generatePitchSchema,
} from '../schemas/contact.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/contact.controller'
import { z } from 'zod'

const router = Router()

router.use(authMiddleware as never)

// Contacts CRUD
router.get('/', asyncHandler(controller.listContacts))
router.post('/', validateBody(createContactSchema), asyncHandler(controller.createContact))
router.put('/:id', validateBody(updateContactSchema), asyncHandler(controller.updateContact))
router.delete('/:id', asyncHandler(controller.deleteContact))

// Outreach records
router.get('/outreach/:kitId', asyncHandler(controller.listOutreachForKit))
router.post(
  '/outreach',
  validateBody(z.object({ contact_id: z.string().uuid(), kit_id: z.string().uuid() })),
  asyncHandler(controller.upsertOutreachRecord)
)
router.patch(
  '/outreach/:recordId/status',
  validateBody(updateOutreachStatusSchema),
  asyncHandler(controller.updateOutreachStatus)
)
router.post(
  '/outreach/pitch',
  kitGenerationLimiter,
  validateBody(generatePitchSchema),
  asyncHandler(controller.generatePitchEmail)
)

export default router
