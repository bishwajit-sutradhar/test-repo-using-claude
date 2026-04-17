import { z } from 'zod'

export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(300),
  publication: z.string().max(200).optional(),
  contact_type: z.enum(['press', 'curator', 'radio']),
  notes: z.string().max(1000).optional(),
  website_url: z.string().url('Must be a valid URL').max(300).optional().or(z.literal('')),
})

export const updateContactSchema = createContactSchema.partial()

export const updateOutreachStatusSchema = z.object({
  status: z.enum(['not_pitched', 'pitched', 'responded', 'featured', 'rejected']),
  personal_note: z.string().max(1000).optional(),
})

export const generatePitchSchema = z.object({
  contact_id: z.string().uuid(),
  kit_id: z.string().uuid(),
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1).max(100),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type UpdateOutreachStatusInput = z.infer<typeof updateOutreachStatusSchema>
export type GeneratePitchInput = z.infer<typeof generatePitchSchema>
