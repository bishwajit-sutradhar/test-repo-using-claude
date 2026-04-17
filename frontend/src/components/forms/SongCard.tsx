import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Song } from '../../types'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  track_number: z.coerce.number().int().min(1).max(50),
  duration_seconds: z.coerce.number().int().min(1).max(3600).optional().or(z.literal('')),
  bpm: z.coerce.number().int().min(40).max(300).optional().or(z.literal('')),
  key_signature: z.string().max(20).optional(),
  mood: z.string().optional(),
  themes: z.string().max(1000).optional(),
  production_notes: z.string().max(1000).optional(),
  featured_artists: z.string().optional(),
  lyrics_excerpt: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface SongCardProps {
  song?: Song
  defaultTrackNumber?: number
  onSave: (data: Partial<Song>) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel?: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100">
        {title}
      </p>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function SongCard({ song, defaultTrackNumber = 1, onSave, onDelete, onCancel }: SongCardProps) {
  const [expanded, setExpanded] = useState(!song)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { track_number: defaultTrackNumber },
  })

  useEffect(() => {
    if (song) {
      reset({
        title: song.title,
        track_number: song.track_number,
        duration_seconds: song.duration_seconds ?? '',
        bpm: song.bpm ?? '',
        key_signature: song.key_signature ?? '',
        mood: song.mood?.join(', ') ?? '',
        themes: song.themes ?? '',
        production_notes: song.production_notes ?? '',
        featured_artists: song.featured_artists?.join(', ') ?? '',
        lyrics_excerpt: song.lyrics_excerpt ?? '',
      })
    }
  }, [song, reset])

  const onSubmit = async (values: FormValues) => {
    const { mood, featured_artists, duration_seconds, bpm, ...rest } = values
    await onSave({
      ...rest,
      duration_seconds: duration_seconds ? Number(duration_seconds) : undefined,
      bpm: bpm ? Number(bpm) : undefined,
      mood: mood ? mood.split(',').map((s) => s.trim()).filter(Boolean) : [],
      featured_artists: featured_artists ? featured_artists.split(',').map((s) => s.trim()).filter(Boolean) : [],
    })
    if (!song) { reset(); setExpanded(false) }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/70 transition-colors"
      >
        {/* Track number badge */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
          <span className="text-xs font-bold text-white">
            {song ? song.track_number : defaultTrackNumber}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {song?.title ?? 'New Song'}
          </p>
          {song && (song.mood?.length || song.duration_seconds || song.bpm) ? (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {song.duration_seconds ? (
                <span className="text-xs text-gray-400">{formatDuration(song.duration_seconds)}</span>
              ) : null}
              {song.bpm ? (
                <span className="text-xs text-gray-400">{song.bpm} BPM</span>
              ) : null}
              {song.key_signature ? (
                <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md border border-purple-100">
                  {song.key_signature}
                </span>
              ) : null}
              {song.mood?.slice(0, 3).map((m) => (
                <span key={m} className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md border border-brand-100">
                  {m}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded form */}
      {expanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t border-gray-100 p-4 space-y-3">

          <MiniSection title="Basic Info">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2">
                <Input label="Title *" {...register('title')} error={errors.title?.message} />
              </div>
              <Input label="Track #" type="number" {...register('track_number')} error={errors.track_number?.message} />
              <Input label="BPM" type="number" {...register('bpm')} />
              <Input label="Duration (s)" type="number" {...register('duration_seconds')} />
              <Input label="Key Signature" {...register('key_signature')} placeholder="e.g. C minor" />
            </div>
          </MiniSection>

          <MiniSection title="Track Details">
            <div className="space-y-3">
              <Input
                label="Mood"
                {...register('mood')}
                hint="Comma-separated: melancholic, uplifting"
              />
              <Input
                label="Featured Artists"
                {...register('featured_artists')}
                hint="Comma-separated"
              />
              <Textarea label="Lyrical Themes" {...register('themes')} rows={2} />
              <Textarea
                label="Production Notes"
                {...register('production_notes')}
                rows={2}
                hint="Instrumentation, producer, studio"
              />
            </div>
          </MiniSection>

          <MiniSection title="Lyrics Excerpt">
            <Textarea
              label=""
              {...register('lyrics_excerpt')}
              rows={3}
              hint="Optional — helps AI match tone"
            />
          </MiniSection>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" loading={isSubmitting} size="sm">
              {song ? 'Save Song' : 'Add Song'}
            </Button>
            {onDelete && (
              <Button type="button" variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            )}
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
