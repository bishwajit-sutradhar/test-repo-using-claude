import { useState, KeyboardEvent } from 'react'

interface VibeTagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  error?: string
  max?: number
}

export function VibeTagInput({ value, onChange, error, max = 10 }: VibeTagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase()
    if (!clean || value.includes(clean) || value.length >= max) return
    onChange([...value, clean])
    setInput('')
  }

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        Vibe / Feels <span className="text-gray-400 font-normal">(max {max})</span>
      </label>
      <div className={`
        flex flex-wrap gap-2 rounded-lg border px-3 py-2 bg-white min-h-[42px]
        focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent
        ${error ? 'border-red-400' : 'border-gray-300'}
      `}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-sm px-2 py-0.5 rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-brand-400 hover:text-brand-700 leading-none">×</button>
          </span>
        ))}
        {value.length < max && (
          <input
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-gray-400"
            placeholder={value.length === 0 ? 'dark, cinematic, nostalgic… (Enter or comma)' : 'Add more…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={() => { if (input) addTag(input) }}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
