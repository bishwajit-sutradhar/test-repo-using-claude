import { useState } from 'react'
import { PostReleasePlan as PostReleasePlanType, ChecklistProgressRecord } from '../../types'

const TABS = [
  { key: 'week_one_tasks', label: 'Week 1', postKey: 0 },
  { key: 'month_one_tasks', label: 'Month 1', postKey: 1 },
  { key: 'ongoing_tasks', label: 'Ongoing', postKey: 2 },
] as const

interface PostReleasePlanProps {
  plan: PostReleasePlanType
  progress?: ChecklistProgressRecord[]
  onToggle?: (section: 'post_release', phaseIndex: number, taskIndex: number, completed: boolean) => void
}

function isTaskDone(
  progress: ChecklistProgressRecord[],
  phaseIndex: number,
  taskIndex: number
): boolean {
  return progress.some(
    (r) => r.section === 'post_release' && r.phase_index === phaseIndex && r.task_index === taskIndex && r.completed
  )
}

export function PostReleasePlan({ plan, progress = [], onToggle }: PostReleasePlanProps) {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('week_one_tasks')

  const activeTab = TABS.find((t) => t.key === tab)!
  const tasks = plan[tab]

  const allTasks = [...plan.week_one_tasks, ...plan.month_one_tasks, ...plan.ongoing_tasks]
  const completedTasks = progress.filter((r) => r.section === 'post_release' && r.completed).length
  const pct = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0

  return (
    <div>
      {allTasks.length > 0 && onToggle && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{completedTasks}/{allTasks.length} tasks complete</span>
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

      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {tasks.map((task, i) => {
          const done = isTaskDone(progress, activeTab.postKey, i)
          return (
            <li key={i} className="flex items-start gap-2 text-sm">
              {onToggle ? (
                <label className="flex items-start gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => onToggle('post_release', activeTab.postKey, i, e.target.checked)}
                    className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className={`${done ? 'line-through text-gray-400' : 'text-gray-700'} transition-colors`}>
                    {task}
                  </span>
                </label>
              ) : (
                <>
                  <span className="text-brand-500 font-bold mt-0.5 shrink-0">✓</span>
                  <span className="text-gray-700">{task}</span>
                </>
              )}
            </li>
          )
        })}
        {tasks.length === 0 && (
          <li className="text-sm text-gray-400 italic">No tasks listed.</li>
        )}
      </ul>

      {plan.playlisting_targets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Playlisting Targets
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.playlisting_targets.map((target, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-200"
              >
                {target}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
