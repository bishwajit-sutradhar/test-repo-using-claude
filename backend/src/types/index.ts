import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  userId: string
}

// ── Streaming Platforms ────────────────────────────────────────────────────────
export type StreamingPlatform =
  | 'spotify'
  | 'apple_music'
  | 'tidal'
  | 'youtube_music'
  | 'soundcloud'
  | 'bandcamp'
  | 'amazon_music'
  | 'deezer'

// ── Agent Context (shared input for all 6 agents) ─────────────────────────────
export interface AgentContext {
  artist: {
    stage_name: string
    genre: string
    location?: string
    bio_raw?: string
    influences?: string[]
    years_active?: number
    social_handles?: Record<string, string>
  }
  kit: {
    ep_title: string
    ep_release_date?: string
    ep_label?: string
    ep_release_type: string
    ep_vibe_tags: string[]
    ep_release_genre: string
    target_audience: string
    target_platforms: StreamingPlatform[]
    days_until_release: number   // pre-computed server-side
  }
  songs: Array<{
    title: string
    track_number: number
    duration_seconds?: number
    bpm?: number
    key_signature?: string
    mood?: string[]
    themes?: string
    production_notes?: string
    featured_artists?: string[]
    lyrics_excerpt?: string
  }>
}

// ── Kit Content ───────────────────────────────────────────────────────────────
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
  // Agent 1
  artist_bio: string
  ep_overview: string
  // Agent 2 (receives polished bio from agent 1)
  press_release: string
  interview_talking_points: string[]
  // Agent 3
  track_descriptions: Record<string, string>
  social_captions: {
    instagram: string
    twitter: string
    tiktok: string
    facebook: string
  }
  streaming_pitch: string
  // Agent 4
  pre_release_plan: PreReleasePlan
  // Agent 5
  post_release_plan: PostReleasePlan
  // Agent 6
  platform_pitches: Partial<Record<StreamingPlatform, string>>
  // Agent 7 (Sync & Radio — parallel with agents 2-6)
  sync_radio_pitches?: {
    sync_tv: string
    sync_film: string
    sync_advertising: string
    sync_games: string
    radio_college: string
    radio_indie: string
    radio_public: string
  }
  // Agent 8 (Visual Identity — parallel with agents 2-6)
  visual_identity_brief?: {
    color_palette: Array<{ name: string; hex_descriptor: string; usage: string }>
    photography_direction: string
    artwork_brief: {
      mood: string
      composition: string
      reference_artists: string[]
      style_notes: string
    }
    typography_mood: string
    merchandise_concepts: string[]
  }
  // Metadata
  _meta: {
    provider: string
    model: string
    generated_at: string
    agents_used: string[]
  }
}

// ── LLM Options ───────────────────────────────────────────────────────────────
export interface LLMOptions {
  provider: 'openai' | 'gemini' | 'anthropic'
  model: string
  json_mode?: boolean
  max_tokens?: number
}

export interface LLMError extends Error {
  provider: string
  model: string
  statusCode?: number
}
