import { useState } from 'react'
import { StreamingPlatform, PLATFORM_LABELS } from '../../types'

interface PlatformPitchesProps {
  pitches: Partial<Record<StreamingPlatform, string>>
}

export function PlatformPitches({ pitches }: PlatformPitchesProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const entries = Object.entries(pitches) as [StreamingPlatform, string][]

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 italic">No platform pitches generated.</p>
  }

  const copy = (platform: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(platform)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="space-y-4">
      {entries.map(([platform, pitch]) => (
        <div key={platform} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">
              {PLATFORM_LABELS[platform] ?? platform}
            </p>
            <button
              type="button"
              onClick={() => copy(platform, pitch)}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              {copied === platform ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="px-4 py-3 bg-white text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {pitch}
          </div>
        </div>
      ))}
    </div>
  )
}
