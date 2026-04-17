import { z } from 'zod'

export const createSongSchema = z.object({
  title: z.string().min(1).max(200),
  track_number: z.number().int().min(1).max(50),
  duration_seconds: z.number().int().min(1).max(3600).optional(),
  bpm: z.number().int().min(40).max(300).optional(),
  key_signature: z.string().max(20).optional(),
  mood: z.array(z.string().max(50)).max(10).optional(),
  themes: z.string().max(1000).optional(),
  production_notes: z.string().max(1000).optional(),
  featured_artists: z.array(z.string().max(100)).max(10).optional(),
  lyrics_excerpt: z.string().max(500).optional(),
})

export const updateSongSchema = createSongSchema.partial()

export type CreateSongInput = z.infer<typeof createSongSchema>
export type UpdateSongInput = z.infer<typeof updateSongSchema>
