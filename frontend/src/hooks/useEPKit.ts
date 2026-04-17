import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { EPKit, StreamingPlatform } from '../types'

export interface CreateKitPayload {
  ep_title: string
  ep_release_date?: string
  ep_label?: string
  ep_release_type: 'single' | 'ep' | 'album' | 'mixtape'
  ep_vibe_tags: string[]
  ep_release_genre: string
  target_audience: string
  target_platforms: StreamingPlatform[]
  provider: string
  model: string
}

export function useEPKit() {
  const [kits, setKits] = useState<EPKit[]>([])
  const [loading, setLoading] = useState(false)

  const fetchKits = useCallback(async () => {
    setLoading(true)
    const res = await apiClient.get<EPKit[]>('/api/kits').catch((e) => {
      setLoading(false)
      throw e
    })
    setKits(res.data)
    setLoading(false)
  }, [])

  const generateKit = useCallback(async (data: CreateKitPayload) => {
    const res = await apiClient.post<EPKit>('/api/kits', data)
    return res.data
  }, [])

  const fetchKit = useCallback(async (id: string) => {
    const res = await apiClient.get<EPKit>(`/api/kits/${id}`)
    return res.data
  }, [])

  const deleteKit = useCallback(async (id: string) => {
    await apiClient.delete(`/api/kits/${id}`)
    setKits((prev) => prev.filter((k) => k.id !== id))
  }, [])

  return { kits, loading, fetchKits, generateKit, fetchKit, deleteKit }
}
