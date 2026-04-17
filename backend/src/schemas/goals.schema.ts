import { z } from 'zod'

export const createGoalsSchema = z.object({
  goal_1: z.string().min(5, 'Goal must be at least 5 characters').max(300),
  goal_2: z.string().max(300).optional(),
  goal_3: z.string().max(300).optional(),
})

export const generateRoadmapSchema = createGoalsSchema.extend({
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1).max(100),
})

export type CreateGoalsInput = z.infer<typeof createGoalsSchema>
export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>
