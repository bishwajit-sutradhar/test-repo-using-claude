import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEPKit } from '../hooks/useEPKit'
import { useArtistProfile } from '../hooks/useArtistProfile'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EPKit, GenerationStatus } from '../types'

const statusConfig: Record<GenerationStatus, { label: string; dot: string; bg: string; text: string }> = {
  pending:    { label: 'Pending',    dot: 'bg-gray-400',    bg: 'bg-gray-100',    text: 'text-gray-600' },
  generating: { label: 'Generating', dot: 'bg-yellow-400 animate-pulse', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  complete:   { label: 'Complete',   dot: 'bg-green-400',   bg: 'bg-green-50',    text: 'text-green-700' },
  failed:     { label: 'Failed',     dot: 'bg-red-400',     bg: 'bg-red-50',      text: 'text-red-700' },
}

const releaseTypePill: Record<string, string> = {
  single:  'bg-purple-100 text-purple-700',
  ep:      'bg-blue-100 text-blue-700',
  album:   'bg-indigo-100 text-indigo-700',
  mixtape: 'bg-orange-100 text-orange-700',
}

function formatDuration(ms?: number): string {
  if (!ms) return ''
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function KitCard({ kit, onDelete }: { kit: EPKit; onDelete: (id: string) => void }) {
  const status = statusConfig[kit.generation_status]

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/80 hover:border-gray-300">
      {/* Accent line based on status */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
        kit.generation_status === 'complete' ? 'bg-gradient-to-r from-brand-500 to-purple-500' :
        kit.generation_status === 'generating' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
        kit.generation_status === 'failed' ? 'bg-red-400' : 'bg-gray-200'
      }`} />

      <div className="flex items-start justify-between gap-2 pt-1">
        <h3 className="font-semibold text-gray-900 leading-snug">{kit.ep_title}</h3>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5">
        {kit.ep_release_type && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${releaseTypePill[kit.ep_release_type] ?? 'bg-gray-100 text-gray-600'}`}>
            {kit.ep_release_type}
          </span>
        )}
        {kit.ep_release_genre && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {kit.ep_release_genre}
          </span>
        )}
      </div>

      {kit.ep_release_date && (
        <p className="text-xs text-gray-500">
          <span className="text-gray-400">Release</span> · {kit.ep_release_date}
        </p>
      )}

      {kit.llm_provider && kit.llm_model && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {kit.llm_provider}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[130px]">
            {kit.llm_model}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        {kit.target_platforms && kit.target_platforms.length > 0 && (
          <span>{kit.target_platforms.length} platform{kit.target_platforms.length !== 1 ? 's' : ''}</span>
        )}
        {kit.generation_duration_ms && (
          <span>· {formatDuration(kit.generation_duration_ms)}</span>
        )}
      </div>

      <div className="flex gap-2 mt-auto pt-1 border-t border-gray-100">
        {kit.generation_status === 'complete' && (
          <Link to={`/kits/${kit.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">View Kit</Button>
          </Link>
        )}
        {kit.generation_status === 'generating' && (
          <Link to={`/kits/${kit.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full gap-2">
              <Spinner size="sm" /> In Progress
            </Button>
          </Link>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(kit.id)}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { artist, loading: artistLoading } = useArtistProfile()
  const { kits, loading: kitsLoading, fetchKits, deleteKit } = useEPKit()

  useEffect(() => { fetchKits().catch(() => {}) }, [fetchKits])

  const loading = artistLoading || kitsLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const completeKits = kits.filter((k) => k.generation_status === 'complete').length

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {artist ? (
              <>Welcome back, <span className="gradient-text">{artist.stage_name}</span></>
            ) : (
              'Artist Management'
            )}
          </h1>
          <p className="mt-1 text-gray-500">
            {kits.length} kit{kits.length !== 1 ? 's' : ''} generated
            {completeKits > 0 && ` · ${completeKits} complete`}
          </p>
        </div>
        <Button onClick={() => navigate('/kits/new')} className="shadow-md shadow-brand-500/20">
          Generate Kit ✦
        </Button>
      </div>

      {/* Profile prompt */}
      {!artist && (
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-5 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-brand-900 font-semibold text-sm">Complete your artist profile</p>
            <p className="text-brand-600 text-xs mt-0.5">Your profile details power the AI-generated content</p>
          </div>
          <Link to="/profile">
            <Button size="sm">Set up profile</Button>
          </Link>
        </div>
      )}

      {/* Kit grid */}
      {kits.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">No kits yet</p>
          <p className="text-gray-400 text-sm mb-5">Generate your first press kit in under a minute</p>
          <Button onClick={() => navigate('/kits/new')}>Generate your first kit ✦</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {kits.map((kit) => (
            <div key={kit.id} className="animate-fade-in-up">
              <KitCard kit={kit} onDelete={deleteKit} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
