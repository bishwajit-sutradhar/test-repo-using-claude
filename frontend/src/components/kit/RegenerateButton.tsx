import { useState } from 'react'
import { ModelSelector } from '../forms/ModelSelector'
import { Button } from '../ui/Button'
import { useAgentRegenerate, RegenerableSection } from '../../hooks/useAgentRegenerate'
import { useToastStore } from '../ui/Toast'
import { KitContent } from '../../types'

interface RegenerateButtonProps {
  kitId: string
  sectionKey: RegenerableSection
  onRegenerated: (partial: Partial<KitContent>) => void
}

export function RegenerateButton({ kitId, sectionKey, onRegenerated }: RegenerateButtonProps) {
  const [open, setOpen] = useState(false)
  const [model, setModel] = useState<{ provider: string; model: string }>({ provider: '', model: '' })
  const { regenerateSection, loadingSection } = useAgentRegenerate(kitId)
  const addToast = useToastStore((s) => s.addToast)

  const isLoading = loadingSection === sectionKey

  const handleConfirm = async () => {
    if (!model.provider || !model.model) {
      addToast('Select a provider and model first', 'error')
      return
    }
    setOpen(false)
    const partial = await regenerateSection(sectionKey, model.provider, model.model)
      .catch((err: { response?: { data?: { error?: string } } }) => {
        addToast(err?.response?.data?.error ?? 'Regeneration failed', 'error')
        return null
      })
    if (partial) {
      onRegenerated(partial)
      addToast('Section regenerated', 'success')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        title="Regenerate this section"
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50 disabled:opacity-40"
      >
        {isLoading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        {isLoading ? 'Regenerating…' : '↺ Regenerate'}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover */}
          <div className="absolute right-0 top-8 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Regenerate section</p>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <ModelSelector value={model} onChange={setModel} />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleConfirm} disabled={!model.model}>
                Regenerate
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
