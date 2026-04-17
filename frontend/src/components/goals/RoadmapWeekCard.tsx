import { RoadmapWeek } from '../../types'

interface RoadmapWeekCardProps {
  week: RoadmapWeek
  isOpen: boolean
  onToggle: () => void
}

const LANES = [
  { key: 'distribution' as const, label: 'Distribution', colorClasses: 'bg-blue-50 text-blue-800 border-blue-100' },
  { key: 'marketing' as const,    label: 'Marketing',    colorClasses: 'bg-pink-50 text-pink-800 border-pink-100' },
  { key: 'networking' as const,   label: 'Networking',   colorClasses: 'bg-purple-50 text-purple-800 border-purple-100' },
  { key: 'live_sync' as const,    label: 'Live / Sync',  colorClasses: 'bg-green-50 text-green-800 border-green-100' },
]

export function RoadmapWeekCard({ week, isOpen, onToggle }: RoadmapWeekCardProps) {
  const totalTasks = LANES.reduce((sum, l) => sum + week[l.key].length, 0)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
            {week.week_number}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Week {week.week_number}</p>
            <p className="text-xs text-gray-400">{totalTasks} actions</p>
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
        <div className="px-4 pb-4 pt-3 bg-gray-50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LANES.map((lane) => {
            const tasks = week[lane.key]
            if (tasks.length === 0) return null
            return (
              <div key={lane.key} className={`rounded-xl border p-3 ${lane.colorClasses}`}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-70">{lane.label}</p>
                <ul className="space-y-1">
                  {tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="font-bold mt-0.5 shrink-0">·</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
