import { z } from 'zod'

export const createArtistSchema = z.object({
  stage_name: z.string().min(1).max(100),
  real_name: z.string().max(100).optional(),
  genre: z.string().min(1).max(200),
  location: z.string().max(100).optional(),
  bio_raw: z.string().max(2000).optional(),
  influences: z.array(z.string().max(100)).max(20).optional(),
  years_active: z.number().int().min(0).max(100).optional(),
  website_url: z.string().url().max(300).optional().or(z.literal('')),
  social_handles: z.object({
    instagram: z.string().max(100).optional(),
    twitter: z.string().max(100).optional(),
    tiktok: z.string().max(100).optional(),
    spotify: z.string().max(300).optional(),
  }).optional(),
  press_photo_url: z.string().url().max(500).optional().or(z.literal('')),
})

export const updateArtistSchema = createArtistSchema.partial()

export type CreateArtistInput = z.infer<typeof createArtistSchema>
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>
