import type { ActivityEvent } from '../../types'
import { formatDateTime } from '../../utils/formatters'

interface Props {
  events: ActivityEvent[]
}

const EVENT_ICONS: Record<string, string> = {
  anomaly_detected: '⚠',
  outreach_sent: '✉',
  outreach_rejected: '✗',
  score_change: '↕',
  alert: '🔔',
}

const EVENT_COLORS: Record<string, string> = {
  anomaly_detected: 'text-orange-400',
  outreach_sent: 'text-green-400',
  outreach_rejected: 'text-slate-500',
  score_change: 'text-blue-400',
  alert: 'text-red-400',
}

export default function ActivityTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 mb-4">
        <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Activity</div>
        <div className="text-sm text-slate-600">No activity yet</div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 mb-4">
      <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Activity</div>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {events.map(event => (
          <div key={event.id} className="flex gap-3 items-start">
            <span className={`text-base flex-shrink-0 mt-0.5 ${EVENT_COLORS[event.event_type] || 'text-slate-400'}`}>
              {EVENT_ICONS[event.event_type] || '·'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
              <p className="text-xs text-slate-600 mt-0.5">{formatDateTime(event.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
