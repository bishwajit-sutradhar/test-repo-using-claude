import { useState } from 'react'
import { ARFeedback } from '../../types'
import { useARFeedback } from '../../hooks/useARFeedback'
import { ModelSelector } from '../forms/ModelSelector'
import { useToastStore } from '../ui/Toast'

interface ARFeedbackSectionProps {
  kitId: string
  feedback?: ARFeedback
}

export function ARFeedbackSection({ kitId, feedback: initialFeedback }: ARFeedbackSectionProps) {
  const [localFeedback, setLocalFeedback] = useState<ARFeedback | undefined>(initialFeedback)
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({ provider: 'openai', model: 'gpt-4o' })
  const { generateFeedback } = useARFeedback(kitId)
  const addToast = useToastStore((s) => s.addToast)

  const handleGenerate = async () => {
    setShowPicker(false)
    setLoading(true)
    const result = await generateFeedback(model.provider, model.model).catch((err: Error) => {
      addToast(err.message || 'Failed to generate feedback', 'error')
      return null
    })
    setLoading(false)
    if (result) {
      setLocalFeedback(result)
      addToast('A&R feedback generated', 'success')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-950 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-gray-300 text-sm">An A&R rep is reviewing your work…</p>
          <p className="text-gray-500 text-xs">This usually takes 15–30 seconds</p>
        </div>
      </div>
    )
  }

  if (!localFeedback) {
    return (
      <div className="bg-gray-950 rounded-2xl p-8 text-white">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1">Get A&R Feedback</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Have a senior A&R rep review your release — market positioning, key strengths,
              areas to improve, and an honest industry verdict.
            </p>
          </div>

          {showPicker ? (
            <div className="w-full max-w-md text-left">
              <div className="bg-gray-900 rounded-xl p-4 mb-3">
                <ModelSelector value={model} onChange={setModel} />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition-colors"
                >
                  Get Feedback
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition-colors"
            >
              Get A&R Feedback
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Market Positioning */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Market Positioning</p>
        <p className="text-sm text-gray-700 leading-relaxed">{localFeedback.market_positioning}</p>
      </div>

      {/* Strengths + Improvements side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3">Strengths</p>
          <ul className="space-y-2">
            {localFeedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Areas to Improve</p>
          <ul className="space-y-2">
            {localFeedback.improvement_areas.map((area, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">→</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Career Trajectory */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Career Trajectory</p>
        <p className="text-sm text-gray-700 leading-relaxed">{localFeedback.career_trajectory}</p>
      </div>

      {/* Verdict */}
      <div className="rounded-xl border-l-4 border-gray-800 bg-gray-950 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          If This Landed on My Desk…
        </p>
        <p className="text-sm text-gray-200 leading-relaxed italic">"{localFeedback.verdict}"</p>
        <p className="text-xs text-gray-600 mt-3">
          {localFeedback.provider} / {localFeedback.model} · {new Date(localFeedback.generated_at).toLocaleDateString()}
        </p>
      </div>

      {/* Regenerate */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Regenerate feedback ↺
        </button>
      </div>

      {showPicker && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <ModelSelector value={model} onChange={setModel} />
          <div className="flex gap-2 justify-end mt-3">
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
