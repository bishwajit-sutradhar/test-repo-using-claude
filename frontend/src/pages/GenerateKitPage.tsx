import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEPKit, CreateKitPayload } from '../hooks/useEPKit'
import { useToastStore } from '../components/ui/Toast'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { VibeTagInput } from '../components/forms/VibeTagInput'
import { PlatformSelector } from '../components/forms/PlatformSelector'
import { ModelSelector } from '../components/forms/ModelSelector'
import { StreamingPlatform } from '../types'

const RELEASE_TYPES = [
  { value: 'single', label: 'Single', desc: '1 track' },
  { value: 'ep', label: 'EP', desc: '2–6 tracks' },
  { value: 'album', label: 'Album', desc: '7+ tracks' },
  { value: 'mixtape', label: 'Mixtape', desc: 'Free project' },
] as const

type ReleaseType = typeof RELEASE_TYPES[number]['value']

const AGENT_LABELS = [
  'Artist narrative & bio',
  'Press release & talking points',
  'Track descriptions & social captions',
  'Pre-release marketing plan',
  'Post-release action plan',
  'Per-platform streaming pitches',
]

function daysUntil(date: string): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function DaysBadge({ date }: { date: string }) {
  const days = daysUntil(date)
  if (days === null) return null
  const label = days < 0
    ? `${Math.abs(days)}d ago`
    : days === 0 ? 'Today!' : `${days}d away`
  const color = days < 0
    ? 'bg-red-50 text-red-600 border-red-200'
    : days < 7
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-green-50 text-green-700 border-green-200'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  )
}

const STEPS = ['Release Details', 'Audience & Platforms', 'AI Model']

export function GenerateKitPage() {
  const navigate = useNavigate()
  const { generateKit, fetchKit } = useEPKit()
  const addToast = useToastStore((s) => s.addToast)

  // Step
  const [step, setStep] = useState(0)

  // Step 1 fields
  const [epTitle, setEpTitle] = useState('')
  const [releaseType, setReleaseType] = useState<ReleaseType>('ep')
  const [releaseDate, setReleaseDate] = useState('')
  const [genre, setGenre] = useState('')
  const [label, setLabel] = useState('')
  const [vibeTags, setVibeTags] = useState<string[]>([])

  // Step 2 fields
  const [audience, setAudience] = useState('')
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([])

  // Step 3 fields
  const [model, setModel] = useState<{ provider: string; model: string }>({ provider: '', model: '' })

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [agentsDone, setAgentsDone] = useState<boolean[]>(new Array(6).fill(false))
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current)
    }
  }, [])

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {}

    if (step === 0) {
      if (!epTitle.trim()) errs.epTitle = 'EP/release title is required'
      if (!genre.trim()) errs.genre = 'Genre is required'
      if (vibeTags.length === 0) errs.vibeTags = 'Add at least one vibe tag'
    }
    if (step === 1) {
      if (!audience.trim()) errs.audience = 'Describe your target audience'
      if (platforms.length === 0) errs.platforms = 'Select at least one platform'
    }
    if (step === 2) {
      if (!model.provider || !model.model) errs.model = 'Select a provider and model'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    setStep((s) => s + 1)
  }

  const back = () => setStep((s) => s - 1)

  const simulateAgentProgress = (kitId: string) => {
    let agentIndex = 0

    const tick = () => {
      agentIndex++
      setAgentsDone((prev) => {
        const next = [...prev]
        for (let i = 0; i < agentIndex; i++) next[i] = true
        return next
      })
    }

    // Simulate agent completion over ~15s
    const delays = [2000, 4500, 7000, 9500, 12000, 14500]
    delays.forEach((delay, i) => {
      pollingRef.current = setTimeout(() => {
        setAgentsDone((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, delay)
    })

    // Poll for real completion
    const poll = async () => {
      try {
        const kit = await fetchKit(kitId)
        if (kit.generation_status === 'complete') {
          if (pollingRef.current) clearTimeout(pollingRef.current)
          setAgentsDone(new Array(6).fill(true))
          setTimeout(() => {
            addToast('EP Kit generated successfully!', 'success')
            navigate(`/kits/${kitId}`)
          }, 600)
        } else if (kit.generation_status === 'failed') {
          if (pollingRef.current) clearTimeout(pollingRef.current)
          setGenerating(false)
          addToast('Generation failed. Please try again.', 'error')
        } else {
          pollingRef.current = setTimeout(poll, 2000)
        }
      } catch {
        pollingRef.current = setTimeout(poll, 3000)
      }
    }

    pollingRef.current = setTimeout(poll, 3000)
  }

  const onSubmit = async () => {
    if (!validateStep()) return
    setGenerating(true)

    const payload: CreateKitPayload = {
      ep_title: epTitle.trim(),
      ep_release_date: releaseDate || undefined,
      ep_label: label.trim() || undefined,
      ep_release_type: releaseType,
      ep_vibe_tags: vibeTags,
      ep_release_genre: genre.trim(),
      target_audience: audience.trim(),
      target_platforms: platforms,
      provider: model.provider,
      model: model.model,
    }

    try {
      const kit = await generateKit(payload)
      simulateAgentProgress(kit.id)
    } catch (err: unknown) {
      setGenerating(false)
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Generation failed. Please try again.'
      addToast(msg, 'error')
    }
  }

  // ── Generating progress view ─────────────────────────────────────────────
  if (generating) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Generating your kit…</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          6 AI agents are working in parallel — this usually takes 15–30 seconds
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          {AGENT_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {agentsDone[i]
                  ? <span className="text-green-500 text-lg">✓</span>
                  : <Spinner size="sm" />}
              </div>
              <span className={`text-sm ${agentsDone[i] ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Wizard ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate EP Kit</h1>
        <p className="mt-1 text-gray-500">
          Fill in your release details and AI will create a complete press &amp; marketing kit
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-8 max-w-lg">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-200 text-gray-500'}
            `}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className="ml-2 flex-1">
              <p className={`text-xs font-medium ${i === step ? 'text-brand-700' : 'text-gray-400'}`}>{label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-2 ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-lg bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* ── Step 1: Release Details ── */}
        {step === 0 && (
          <>
            <Input
              label="Release Title *"
              value={epTitle}
              onChange={(e) => setEpTitle(e.target.value)}
              error={errors.epTitle}
              placeholder="e.g. Midnight Frequencies"
            />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Release Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RELEASE_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setReleaseType(rt.value)}
                    className={`
                      flex flex-col items-center py-2.5 px-2 rounded-xl border text-sm font-medium transition-colors
                      ${releaseType === rt.value
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'}
                    `}
                  >
                    <span>{rt.label}</span>
                    <span className={`text-xs ${releaseType === rt.value ? 'text-brand-200' : 'text-gray-400'}`}>
                      {rt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Genre *"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              error={errors.genre}
              placeholder="e.g. Indie R&B, Lo-fi Hip-hop"
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Release Date</label>
                {releaseDate && <DaysBadge date={releaseDate} />}
              </div>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <Input
              label="Label / Imprint"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Leave blank for Independent"
            />

            <VibeTagInput
              value={vibeTags}
              onChange={setVibeTags}
              error={errors.vibeTags}
            />
          </>
        )}

        {/* ── Step 2: Audience & Platforms ── */}
        {step === 1 && (
          <>
            <Textarea
              label="Target Audience *"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              error={errors.audience}
              placeholder="e.g. Late-night creative types aged 18–30 who enjoy introspective indie R&B and late-night drives"
              rows={4}
            />

            <PlatformSelector
              value={platforms}
              onChange={setPlatforms}
              error={errors.platforms}
            />
          </>
        )}

        {/* ── Step 3: AI Model ── */}
        {step === 2 && (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Choose your AI provider and model</p>
              <p className="text-xs text-gray-400 mb-4">
                Only providers with a configured API key are available.
              </p>
              <ModelSelector
                value={model}
                onChange={setModel}
                error={errors.model}
              />
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={back}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={onSubmit} disabled={!model.model}>
              Generate Kit ✦
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400 max-w-lg">
        Make sure you've completed your artist profile and added your songs first.
      </p>
    </div>
  )
}
