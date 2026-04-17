import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { Song } from '../types'
import { SongListManager } from '../components/forms/SongListManager'
import { useToastStore } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export function SongDetailsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const addToast = useToastStore((s) => s.addToast)

  const fetchSongs = useCallback(async () => {
    setLoading(true)
    const res = await apiClient.get<Song[]>('/api/songs').catch((e) => {
      setLoading(false)
      throw e
    })
    setSongs(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSongs().catch(() => {}) }, [fetchSongs])

  const handleAdd = async (data: Partial<Song>) => {
    const res = await apiClient.post<Song>('/api/songs', data)
    setSongs((prev) => [...prev, res.data].sort((a, b) => a.track_number - b.track_number))
    addToast('Song added', 'success')
  }

  const handleUpdate = async (id: string, data: Partial<Song>) => {
    const res = await apiClient.put<Song>(`/api/songs/${id}`, data)
    setSongs((prev) => prev.map((s) => s.id === id ? res.data : s))
    addToast('Song updated', 'success')
  }

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/api/songs/${id}`)
    setSongs((prev) => prev.filter((s) => s.id !== id))
    addToast('Song deleted', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Songs</h1>
        <p className="mt-1 text-gray-500">
          Add and arrange the songs on your EP — {songs.length} track{songs.length !== 1 ? 's' : ''} so far
        </p>
      </div>
      <div className="max-w-2xl">
        <SongListManager
          songs={songs}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
