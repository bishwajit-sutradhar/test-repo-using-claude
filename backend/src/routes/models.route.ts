import { Router, Request, Response } from 'express'
import { MODELS_REGISTRY } from '../config/models.config'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const providers = Object.values(MODELS_REGISTRY).map((provider) => {
    const apiKey = process.env[provider.env_key as string]
    const available = Boolean(apiKey && apiKey.trim().length > 0)
    return {
      id: provider.id,
      display_name: provider.display_name,
      available,
      models: available ? provider.models : [],
    }
  })
  res.json({ providers })
})

export default router
