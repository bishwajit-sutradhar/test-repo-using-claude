import { AgentContext, StreamingPlatform } from '../types'

// Builds the shared context object consumed by all 6 agents
export function buildAgentContext(
  artist: Record<string, unknown>,
  kit: Record<string, unknown>,
  songs: Record<string, unknown>[]
): AgentContext {
  const releaseDate = kit.ep_release_date as string | undefined
  const daysUntilRelease = releaseDate
    ? Math.ceil((new Date(releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    artist: {
      stage_name: artist.stage_name as string,
      genre: artist.genre as string,
      location: artist.location as string | undefined,
      bio_raw: artist.bio_raw as string | undefined,
      influences: artist.influences as string[] | undefined,
      years_active: artist.years_active as number | undefined,
      social_handles: artist.social_handles as Record<string, string> | undefined,
    },
    kit: {
      ep_title: kit.ep_title as string,
      ep_release_date: releaseDate,
      ep_label: kit.ep_label as string | undefined,
      ep_release_type: (kit.ep_release_type as string) ?? 'ep',
      ep_vibe_tags: (kit.ep_vibe_tags as string[]) ?? [],
      ep_release_genre: (kit.ep_release_genre as string) ?? (artist.genre as string),
      target_audience: (kit.target_audience as string) ?? '',
      target_platforms: (kit.target_platforms as StreamingPlatform[]) ?? [],
      days_until_release: daysUntilRelease,
    },
    songs: songs.map((s) => ({
      title: s.title as string,
      track_number: s.track_number as number,
      duration_seconds: s.duration_seconds as number | undefined,
      bpm: s.bpm as number | undefined,
      key_signature: s.key_signature as string | undefined,
      mood: s.mood as string[] | undefined,
      themes: s.themes as string | undefined,
      production_notes: s.production_notes as string | undefined,
      featured_artists: s.featured_artists as string[] | undefined,
      lyrics_excerpt: s.lyrics_excerpt as string | undefined,
    })),
  }
}
