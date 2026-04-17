import { OutreachStatus } from '../../types'

const STATUS_CONFIG: Record<OutreachStatus, { label: string; classes: string }> = {
  not_pitched: { label: 'Not Pitched', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  pitched:     { label: 'Pitched',     classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  responded:   { label: 'Responded',   classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  featured:    { label: 'Featured',    classes: 'bg-green-50 text-green-700 border-green-200' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-50 text-red-600 border-red-200' },
}

interface OutreachStatusBadgeProps {
  status: OutreachStatus
}

export function OutreachStatusBadge({ status }: OutreachStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
