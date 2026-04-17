import { useState } from 'react'
import { useToastStore } from '../ui/Toast'

interface SyncRadioPitchesProps {
  pitches: {
    sync_tv: string; sync_film: string; sync_advertising: string; sync_games: string
    radio_college: string; radio_indie: string; radio_public: string
  }
}

function PitchCard({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    addToast('Copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-0.5 rounded hover:bg-brand-50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  )
}

export function SyncRadioPitches({ pitches }: SyncRadioPitchesProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎬</span>
          <h3 className="text-sm font-semibold text-gray-800">Sync Licensing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PitchCard label="TV / Documentary" text={pitches.sync_tv} />
          <PitchCard label="Film" text={pitches.sync_film} />
          <PitchCard label="Advertising / Brand" text={pitches.sync_advertising} />
          <PitchCard label="Video Games" text={pitches.sync_games} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📻</span>
          <h3 className="text-sm font-semibold text-gray-800">Radio Promotion</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PitchCard label="College Radio" text={pitches.radio_college} />
          <PitchCard label="Indie / Community Radio" text={pitches.radio_indie} />
          <PitchCard label="Public Radio (BBC / NPR tier)" text={pitches.radio_public} />
        </div>
      </div>
    </div>
  )
}
