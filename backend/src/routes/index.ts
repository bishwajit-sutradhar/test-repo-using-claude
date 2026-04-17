import { Router } from 'express'
import artistRoutes from './artist.routes'
import songRoutes from './song.routes'
import kitRoutes from './kit.routes'
import modelsRouter from './models.route'
import checklistRoutes from './checklist.routes'
import contactRoutes from './contact.routes'
import goalsRoutes from './goals.routes'

export const apiRoutes = Router()

apiRoutes.use('/artists', artistRoutes)
apiRoutes.use('/songs', songRoutes)
apiRoutes.use('/kits', kitRoutes)
apiRoutes.use('/models', modelsRouter)
apiRoutes.use('/checklist', checklistRoutes)
apiRoutes.use('/contacts', contactRoutes)
apiRoutes.use('/goals', goalsRoutes)
