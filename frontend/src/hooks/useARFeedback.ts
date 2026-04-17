import { useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { ARFeedback } from '../types'

export function useARFeedback(kitId: string) {
  const generateFeedback = useCallback(async (provider: string, model: string): Promise<ARFeedback> => {
    const res = await apiClient.post<ARFeedback>(`/api/kits/${kitId}/ar-feedback`, { provider, model })
    return res.data
  }, [kitId])

  return { generateFeedback }
}
