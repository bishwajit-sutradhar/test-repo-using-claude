import { StreamingPlatform, PLATFORM_LABELS } from '../../types'

const PLATFORMS: StreamingPlatform[] = [
  'spotify', 'apple_music', 'tidal', 'youtube_music',
  'soundcloud', 'bandcamp', 'amazon_music', 'deezer',
]

const PLATFORM_ICONS: Record<StreamingPlatform, string> = {
  spotify: '🟢', apple_music: '🎵', tidal: '🌊', youtube_music: '▶️',
  soundcloud: '☁️', bandcamp: '🎸', amazon_music: '📦', deezer: '🎶',
}

interface PlatformSelectorProps {
  value: StreamingPlatform[]
  onChange: (platforms: StreamingPlatform[]) => void
  error?: string
}

export function PlatformSelector({ value, onChange, error }: PlatformSelectorProps) {
  const toggle = (p: StreamingPlatform) => {
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p])
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Target Platforms <span className="text-gray-400 font-normal">(select all that apply)</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PLATFORMS.map((p) => {
          const selected = value.includes(p)
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors
                ${selected
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:bg-brand-50'}
              `}
            >
              <span className="text-base">{PLATFORM_ICONS[p]}</span>
              <span className="truncate">{PLATFORM_LABELS[p]}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
