import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { Artist } from '../types'

export function useArtistProfile() {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await apiClient.get<Artist>('/api/artists/me')
      .catch((err) => {
        if (err.response?.status === 404) return null
        throw err
      })
    setArtist(res ? res.data : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch().catch((e: Error) => {
      setError(e.message)
      setLoading(false)
    })
  }, [fetch])

  const save = async (data: Partial<Artist>) => {
    if (artist) {
      const res = await apiClient.put<Artist>('/api/artists/me', data)
      setArtist(res.data)
    } else {
      const res = await apiClient.post<Artist>('/api/artists', data)
      setArtist(res.data)
    }
  }

  return { artist, loading, error, save, refresh: fetch }
}
