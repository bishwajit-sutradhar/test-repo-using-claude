import { useState } from 'react'
import { Song } from '../../types'
import { SongCard } from './SongCard'
import { Button } from '../ui/Button'

interface SongListManagerProps {
  songs: Song[]
  onAdd: (data: Partial<Song>) => Promise<void>
  onUpdate: (id: string, data: Partial<Song>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SongListManager({ songs, onAdd, onUpdate, onDelete }: SongListManagerProps) {
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onSave={(data) => onUpdate(song.id, data)}
          onDelete={() => onDelete(song.id)}
        />
      ))}

      {adding ? (
        <SongCard
          defaultTrackNumber={songs.length + 1}
          onSave={async (data) => { await onAdd(data); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          + Add Song
        </Button>
      )}
    </div>
  )
}
