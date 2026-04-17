interface VisualBriefProps {
  brief: {
    color_palette: Array<{ name: string; hex_descriptor: string; usage: string }>
    photography_direction: string
    artwork_brief: {
      mood: string
      composition: string
      reference_artists: string[]
      style_notes: string
    }
    typography_mood: string
    merchandise_concepts: string[]
  }
}

const PALETTE_BG_CLASSES = [
  'from-stone-700 to-stone-900',
  'from-amber-600 to-orange-700',
  'from-slate-600 to-slate-800',
  'from-purple-700 to-purple-900',
  'from-teal-600 to-teal-800',
]

export function VisualIdentityBrief({ brief }: VisualBriefProps) {
  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Color Palette</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {brief.color_palette.map((color, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
              <div className={`h-14 bg-gradient-to-br ${PALETTE_BG_CLASSES[i % PALETTE_BG_CLASSES.length]}`} />
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-800">{color.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 italic">{color.hex_descriptor}</p>
                <p className="text-xs text-gray-400 mt-1">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photography Direction */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photography Direction</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{brief.photography_direction}</p>
      </div>

      {/* Artwork Brief */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Artwork Brief</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Mood</p>
            <p className="text-sm text-gray-700">{brief.artwork_brief.mood}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Composition</p>
            <p className="text-sm text-gray-700">{brief.artwork_brief.composition}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Visual References</p>
            <div className="flex flex-wrap gap-2">
              {brief.artwork_brief.reference_artists.map((ref, i) => (
                <span key={i} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">
                  {ref}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Style Notes</p>
            <p className="text-sm text-gray-700">{brief.artwork_brief.style_notes}</p>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Typography Mood</h3>
        <p className="text-sm text-gray-700 leading-relaxed italic">{brief.typography_mood}</p>
      </div>

      {/* Merchandise */}
      {brief.merchandise_concepts.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Merchandise Concepts</h3>
          <ul className="space-y-1.5">
            {brief.merchandise_concepts.map((concept, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-400 mt-0.5 shrink-0">🛍</span>
                {concept}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
