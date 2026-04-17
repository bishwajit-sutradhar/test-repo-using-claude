import { z } from 'zod'

const PLATFORMS = [
  'spotify', 'apple_music', 'tidal', 'youtube_music',
  'soundcloud', 'bandcamp', 'amazon_music', 'deezer',
] as const

export const REGENERABLE_SECTIONS = [
  'artist_bio', 'ep_overview',
  'press_release', 'interview_talking_points',
  'track_descriptions', 'social_captions', 'streaming_pitch',
  'pre_release_plan', 'post_release_plan', 'platform_pitches',
  'sync_radio_pitches', 'visual_identity_brief',
] as const

export type RegenerableSection = typeof REGENERABLE_SECTIONS[number]

export const regenerateSectionSchema = z.object({
  section: z.enum(REGENERABLE_SECTIONS),
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1).max(100),
})

export type RegenerateSectionInput = z.infer<typeof regenerateSectionSchema>

export const arFeedbackSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1).max(100),
})

export type ARFeedbackInput = z.infer<typeof arFeedbackSchema>

export const createKitSchema = z.object({
  // Existing fields
  ep_title: z.string().min(1).max(200),
  ep_release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ep_label: z.string().max(200).optional(),

  // New release identity
  ep_release_type: z.enum(['single', 'ep', 'album', 'mixtape']).default('ep'),
  ep_vibe_tags: z.array(z.string().min(1).max(50)).min(1, 'Add at least one vibe tag').max(10),
  ep_release_genre: z.string().min(1, 'Genre is required').max(100),

  // Audience & distribution
  target_audience: z.string().min(5, 'Describe your target audience').max(500),
  target_platforms: z.array(z.enum(PLATFORMS)).min(1, 'Select at least one platform'),

  // Model selection
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1).max(100),
})

export type CreateKitInput = z.infer<typeof createKitSchema>
