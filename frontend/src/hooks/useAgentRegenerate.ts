import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { KitContent } from '../types'

export type RegenerableSection =
  | 'artist_bio' | 'ep_overview'
  | 'press_release' | 'interview_talking_points'
  | 'track_descriptions' | 'social_captions' | 'streaming_pitch'
  | 'pre_release_plan' | 'post_release_plan' | 'platform_pitches'
  | 'sync_radio_pitches' | 'visual_identity_brief'

export function useAgentRegenerate(kitId: string) {
  const [loadingSection, setLoadingSection] = useState<string | null>(null)

  const regenerateSection = useCallback(async (
    section: RegenerableSection,
    provider: string,
    model: string
  ): Promise<Partial<KitContent>> => {
    setLoadingSection(section)
    const res = await apiClient.patch<Partial<KitContent>>(
      `/api/kits/${kitId}/regenerate`,
      { section, provider, model }
    )
    setLoadingSection(null)
    return res.data
  }, [kitId])

  return { regenerateSection, loadingSection }
}
