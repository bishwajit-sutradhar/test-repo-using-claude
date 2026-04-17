import { useEffect, useState } from 'react'
import { useGoals, CreateGoalsPayload } from '../hooks/useGoals'
import { RoadmapWeekCard } from '../components/goals/RoadmapWeekCard'
import { ModelSelector } from '../components/forms/ModelSelector'
import { Spinner } from '../components/ui/Spinner'
import { useToastStore } from '../components/ui/Toast'

export function GoalsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const { goals, roadmap, generating, loading, fetchGoals, saveGoals, generateRoadmap } = useGoals()
  const [form, setForm] = useState<CreateGoalsPayload>({ goal_1: '', goal_2: '', goal_3: '' })
  const [model, setModel] = useState({ provider: 'openai', model: 'gpt-4o' })
  const [savingGoals, setSavingGoals] = useState(false)
  const [openWeek, setOpenWeek] = useState<number | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  useEffect(() => {
    if (goals) {
      setForm({
        goal_1: goals.goal_1,
        goal_2: goals.goal_2 ?? '',
        goal_3: goals.goal_3 ?? '',
      })
    }
  }, [goals])

  const handleSaveGoals = async () => {
    if (!form.goal_1.trim()) return
    setSavingGoals(true)
    await saveGoals({
      goal_1: form.goal_1,
      goal_2: form.goal_2 || undefined,
      goal_3: form.goal_3 || undefined,
    }).catch((e: Error) => addToast(e.message || 'Failed to save goals', 'error'))
    setSavingGoals(false)
    addToast('Goals saved', 'success')
  }

  const handleGenerateRoadmap = async () => {
    if (!form.goal_1.trim()) {
      addToast('Set at least one goal first', 'error')
      return
    }
    await generateRoadmap(
      { goal_1: form.goal_1, goal_2: form.goal_2 || undefined, goal_3: form.goal_3 || undefined },
      model.provider,
      model.model
    ).catch((e: Error) => addToast(e.message || 'Failed to generate roadmap', 'error'))
    addToast('90-day roadmap generated!', 'success')
    setOpenWeek(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    )
  }

  const weeks = roadmap?.content.weeks ?? []
  const milestones = roadmap?.content.milestones ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Goals</h1>
        <p className="text-gray-500 text-sm mt-1">
          Define your goals and generate a personalised 13-week action plan.
        </p>
      </div>

      {/* Goals form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Your Goals</h2>

        {[
          { key: 'goal_1' as const, label: 'Goal 1 *', placeholder: 'e.g. Reach 50k Spotify monthly listeners by end of year' },
          { key: 'goal_2' as const, label: 'Goal 2', placeholder: 'e.g. Get a sync placement in a TV show or ad' },
          { key: 'goal_3' as const, label: 'Goal 3', placeholder: 'e.g. Play 10 live shows in new cities' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">{label}</label>
            <textarea
              rows={2}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-400 transition-colors"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveGoals}
            disabled={savingGoals || !form.goal_1.trim()}
            className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {savingGoals ? 'Saving…' : 'Save Goals'}
          </button>
        </div>
      </div>

      {/* Roadmap section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">90-Day Roadmap</h2>
          {roadmap && (
            <span className="text-xs text-gray-400">
              Generated {new Date(roadmap.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {generating ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Building your 13-week plan…</p>
            <p className="text-gray-400 text-xs">This may take up to 30 seconds</p>
          </div>
        ) : roadmap ? (
          <>
            {/* Summary */}
            {roadmap.content.summary && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5">
                <p className="text-sm text-gray-700 leading-relaxed">{roadmap.content.summary}</p>
              </div>
            )}

            {/* Milestones timeline */}
            {milestones.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Milestones</p>
                <div className="flex flex-wrap gap-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-800 text-xs px-3 py-1.5 rounded-full">
                      <span className="font-bold">Wk {m.week}</span>
                      <span>·</span>
                      <span>{m.milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week accordions */}
            <div className="space-y-2">
              {weeks.map((week) => (
                <RoadmapWeekCard
                  key={week.week_number}
                  week={week}
                  isOpen={openWeek === week.week_number}
                  onToggle={() => setOpenWeek(openWeek === week.week_number ? null : week.week_number)}
                />
              ))}
            </div>

            {/* Regenerate */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Regenerate with new model</p>
              <ModelSelector value={model} onChange={setModel} />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleGenerateRoadmap}
                  className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Regenerate Roadmap
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 flex items-center justify-center text-2xl mb-4">
              🗺️
            </div>
            <p className="text-gray-600 font-medium mb-1">No roadmap yet</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Save your goals above, then generate a personalised 13-week plan broken into weekly actions.
            </p>
            <div className="max-w-sm mx-auto">
              <ModelSelector value={model} onChange={setModel} />
              <button
                type="button"
                onClick={handleGenerateRoadmap}
                disabled={!form.goal_1.trim()}
                className="mt-4 w-full px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                Generate 90-Day Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
