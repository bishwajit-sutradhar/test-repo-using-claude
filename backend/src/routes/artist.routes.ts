import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { createArtistSchema, updateArtistSchema } from '../schemas/artist.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/artist.controller'

const router = Router()

router.use(authMiddleware as never)

router.get('/me', asyncHandler(controller.getMyProfile))
router.post('/', validateBody(createArtistSchema), asyncHandler(controller.createProfile))
router.put('/me', validateBody(updateArtistSchema), asyncHandler(controller.updateProfile))

export default router
