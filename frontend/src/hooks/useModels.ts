import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { ModelsResponse, ProviderInfo } from '../types'

export function useModels() {
  const [providers, setProviders] = useState<ProviderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await apiClient.get<ModelsResponse>('/api/models')
      .catch((e) => { throw new Error(e.response?.data?.error ?? 'Failed to load models') })
    setProviders(res.data.providers)
    setLoading(false)
  }, [])

  useEffect(() => { fetch().catch((e: Error) => { setError(e.message); setLoading(false) }) }, [fetch])

  return { providers, loading, error, retry: fetch }
}
