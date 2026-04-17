import { useState } from 'react'
import { PreReleasePlan as PreReleasePlanType } from '../../types'
import { ChecklistProgressRecord } from '../../types'

interface PreReleasePlanProps {
  plan: PreReleasePlanType
  releaseDate?: string
  progress?: ChecklistProgressRecord[]
  onToggle?: (section: 'pre_release', phaseIndex: number, taskIndex: number, completed: boolean) => void
}

function addDays(base: string, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isTaskDone(
  progress: ChecklistProgressRecord[],
  phaseIndex: number,
  taskIndex: number
): boolean {
  return progress.some(
    (r) => r.section === 'pre_release' && r.phase_index === phaseIndex && r.task_index === taskIndex && r.completed
  )
}

export function PreReleasePlan({ plan, releaseDate, progress = [], onToggle }: PreReleasePlanProps) {
  const [open, setOpen] = useState<number | null>(0)

  const totalTasks = plan.phases.reduce((sum, p) => sum + p.tasks.length, 0)
  const completedTasks = progress.filter((r) => r.section === 'pre_release' && r.completed).length
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (plan.condensed) {
    return (
      <div className="text-sm text-gray-500 italic py-2">
        Release is imminent or already passed — condensed pre-release mode.
        {plan.phases.length === 0 && ' No pre-release phases to display.'}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{completedTasks}/{totalTasks} tasks complete</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-brand-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {plan.condensed === false && (
        <p className="text-xs text-gray-400 mb-3">{plan.total_days_out} days until release</p>
      )}

      {plan.phases.map((phase, i) => {
        const isOpen = open === i
        const dateRange = releaseDate
          ? `${addDays(releaseDate, -phase.end_offset_days)} – ${addDays(releaseDate, -phase.start_offset_days)}`
          : `Day −${phase.end_offset_days} to −${phase.start_offset_days}`

        return (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{phase.phase_name}</p>
                  <p className="text-xs text-gray-500">{dateRange}</p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                <ul className="space-y-1.5">
                  {phase.tasks.map((task, j) => {
                    const done = isTaskDone(progress, i, j)
                    return (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        {onToggle ? (
                          <label className="flex items-start gap-2 cursor-pointer group flex-1">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={(e) => onToggle('pre_release', i, j, e.target.checked)}
                              className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                            <span className={`${done ? 'line-through text-gray-400' : 'text-gray-700'} transition-colors`}>
                              {task}
                            </span>
                          </label>
                        ) : (
                          <>
                            <span className="text-brand-400 mt-0.5 shrink-0">•</span>
                            <span className="text-gray-700">{task}</span>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
