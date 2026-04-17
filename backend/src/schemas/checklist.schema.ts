import { z } from 'zod'

export const toggleChecklistItemSchema = z.object({
  section: z.enum(['pre_release', 'post_release']),
  phase_index: z.number().int().min(0).nullable(),
  task_index: z.number().int().min(0),
  completed: z.boolean(),
})

export type ToggleChecklistItemInput = z.infer<typeof toggleChecklistItemSchema>
