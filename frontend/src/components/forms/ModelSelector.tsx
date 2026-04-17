import { useModels } from '../../hooks/useModels'
import { Spinner } from '../ui/Spinner'

interface ModelSelectorProps {
  value: { provider: string; model: string }
  onChange: (val: { provider: string; model: string }) => void
  error?: string
}

export function ModelSelector({ value, onChange, error }: ModelSelectorProps) {
  const { providers, loading, error: fetchError } = useModels()

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
        <Spinner size="sm" /> Loading available models…
      </div>
    )
  }

  if (fetchError) {
    return <p className="text-sm text-red-600">Failed to load models: {fetchError}</p>
  }

  const selectedProvider = providers.find((p) => p.id === value.provider)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">AI Provider</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {providers.map((p) => {
            const isSelected = value.provider === p.id
            return (
              <button
                key={p.id}
                type="button"
                disabled={!p.available}
                onClick={() => {
                  if (p.available && p.models.length > 0) {
                    onChange({ provider: p.id, model: p.models[0].id })
                  }
                }}
                className={`
                  flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-left transition-colors
                  ${isSelected && p.available
                    ? 'bg-brand-600 text-white border-brand-600'
                    : p.available
                      ? 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'}
                `}
              >
                <span className="text-sm font-semibold">{p.display_name}</span>
                {!p.available && (
                  <span className="text-xs opacity-75">No API key configured</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedProvider && selectedProvider.available && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Model</p>
          <div className="flex flex-col gap-2">
            {selectedProvider.models.map((m) => {
              const isSelected = value.model === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ provider: value.provider, model: m.id })}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-colors
                    ${isSelected
                      ? 'bg-brand-50 border-brand-400 text-brand-900'
                      : 'bg-white border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-700'}
                  `}
                >
                  <span className="font-medium">{m.display_name}</span>
                  <span className={`text-xs ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>
                    {m.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
