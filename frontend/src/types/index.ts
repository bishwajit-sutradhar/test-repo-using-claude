export interface Artist {
  id: string; user_id: string; stage_name: string; real_name?: string
  genre: string; location?: string; bio_raw?: string; influences?: string[]
  years_active?: number; website_url?: string
  social_handles?: { instagram?: string; twitter?: string; tiktok?: string; spotify?: string }
  press_photo_url?: string; created_at: string; updated_at: string
}

export interface Song {
  id: string; artist_id: string; user_id: string; title: string; track_number: number
  duration_seconds?: number; bpm?: number; key_signature?: string; mood?: string[]
  themes?: string; production_notes?: string; featured_artists?: string[]
  lyrics_excerpt?: string; created_at: string; updated_at: string
}

export type StreamingPlatform =
  | 'spotify' | 'apple_music' | 'tidal' | 'youtube_music'
  | 'soundcloud' | 'bandcamp' | 'amazon_music' | 'deezer'

export interface PreReleasePhase {
  phase_name: string
  start_offset_days: number
  end_offset_days: number
  tasks: string[]
}

export interface PreReleasePlan {
  total_days_out: number
  condensed: boolean
  phases: PreReleasePhase[]
}

export interface PostReleasePlan {
  week_one_tasks: string[]
  month_one_tasks: string[]
  ongoing_tasks: string[]
  playlisting_targets: string[]
}

export interface KitContent {
  artist_bio: string
  ep_overview: string
  press_release: string
  interview_talking_points: string[]
  track_descriptions: Record<string, string>
  social_captions: { instagram: string; twitter: string; tiktok: string; facebook: string }
  streaming_pitch: string
  pre_release_plan: PreReleasePlan
  post_release_plan: PostReleasePlan
  platform_pitches: Partial<Record<StreamingPlatform, string>>
  sync_radio_pitches?: {
    sync_tv: string; sync_film: string; sync_advertising: string; sync_games: string
    radio_college: string; radio_indie: string; radio_public: string
  }
  visual_identity_brief?: {
    color_palette: Array<{ name: string; hex_descriptor: string; usage: string }>
    photography_direction: string
    artwork_brief: { mood: string; composition: string; reference_artists: string[]; style_notes: string }
    typography_mood: string
    merchandise_concepts: string[]
  }
  _meta: { provider: string; model: string; generated_at: string; agents_used: string[] }
}

export type GenerationStatus = 'pending' | 'generating' | 'complete' | 'failed'

export interface ARFeedback {
  market_positioning: string
  strengths: string[]
  improvement_areas: string[]
  career_trajectory: string
  verdict: string
  generated_at: string
  provider: string
  model: string
}

export interface EPKit {
  id: string; artist_id: string; user_id: string; ep_title: string
  ep_release_date?: string; ep_label?: string
  ep_release_type?: string; ep_vibe_tags?: string[]; ep_release_genre?: string
  target_audience?: string; target_platforms?: StreamingPlatform[]
  generation_status: GenerationStatus; content?: KitContent
  ar_feedback?: ARFeedback
  llm_provider?: string; llm_model?: string; generation_duration_ms?: number
  created_at: string; updated_at: string
}

// Model selector types
export interface ModelInfo { id: string; display_name: string; description: string }
export interface ProviderInfo { id: string; display_name: string; available: boolean; models: ModelInfo[] }
export interface ModelsResponse { providers: ProviderInfo[] }

export const PLATFORM_LABELS: Record<StreamingPlatform, string> = {
  spotify: 'Spotify', apple_music: 'Apple Music', tidal: 'Tidal',
  youtube_music: 'YouTube Music', soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp', amazon_music: 'Amazon Music', deezer: 'Deezer',
}

// Checklist
export interface ChecklistProgressRecord {
  id: string; kit_id: string
  section: 'pre_release' | 'post_release'
  phase_index: number | null
  task_index: number
  completed: boolean
  completed_at?: string
}

// Press Contacts & Outreach
export type OutreachStatus = 'not_pitched' | 'pitched' | 'responded' | 'featured' | 'rejected'
export type ContactType = 'press' | 'curator' | 'radio'

export interface PressContact {
  id: string; user_id: string; name: string; email: string
  publication?: string; contact_type: ContactType
  notes?: string; website_url?: string
  created_at: string; updated_at: string
}

export interface OutreachRecord {
  id: string; user_id: string; contact_id: string; kit_id: string
  status: OutreachStatus
  pitched_at?: string; responded_at?: string
  generated_pitch?: string; personal_note?: string
  contact?: PressContact
  created_at: string; updated_at: string
}

// Career Goals & Roadmap
export interface CareerGoals {
  id: string; user_id: string; artist_id: string
  goal_1: string; goal_2?: string; goal_3?: string
  timeframe_days: number
  created_at: string; updated_at: string
}

export interface RoadmapWeek {
  week_number: number
  distribution: string[]
  marketing: string[]
  networking: string[]
  live_sync: string[]
}

export interface RoadmapContent {
  summary: string
  weeks: RoadmapWeek[]
  milestones: Array<{ week: number; milestone: string }>
}

export interface RoadmapPlan {
  id: string; user_id: string; career_goal_id: string
  content: RoadmapContent
  llm_provider?: string; llm_model?: string
  created_at: string
}
