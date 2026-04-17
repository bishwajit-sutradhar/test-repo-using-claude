import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validateBody'
import { createSongSchema, updateSongSchema } from '../schemas/song.schema'
import { asyncHandler } from '../lib/asyncHandler'
import * as controller from '../controllers/song.controller'

const router = Router()

router.use(authMiddleware as never)

router.get('/', asyncHandler(controller.listSongs))
router.post('/', validateBody(createSongSchema), asyncHandler(controller.createSong))
router.put('/:id', validateBody(updateSongSchema), asyncHandler(controller.updateSong))
router.delete('/:id', asyncHandler(controller.deleteSong))

export default router
