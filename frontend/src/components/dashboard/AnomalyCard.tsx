import type { Anomaly } from '../../types'
import { clsx } from 'clsx'

interface Props {
  anomaly: Anomaly
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const PATTERN_LABELS: Record<string, string> = {
  sudden_drop: 'Sudden Drop',
  slow_erosion: 'Slow Erosion',
  seat_collapse: 'Seat Collapse',
  parallel_collapse: 'Peer Outlier',
}

export default function AnomalyCard({ anomaly }: Props) {
  return (
    <div className={clsx('rounded-xl p-4 mb-4 border', SEVERITY_COLORS[anomaly.severity])}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider">
          {anomaly.severity}
        </span>
        <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-slate-300">
          {PATTERN_LABELS[anomaly.pattern] || anomaly.pattern}
        </span>
        {anomaly.z_score !== null && (
          <span className="text-xs text-slate-500 ml-auto">
            z={anomaly.z_score.toFixed(2)}
          </span>
        )}
      </div>
      {anomaly.explanation ? (
        <p className="text-sm text-slate-300 leading-relaxed">{anomaly.explanation}</p>
      ) : (
        <p className="text-sm text-slate-500 italic">Generating AI explanation…</p>
      )}
      {anomaly.delta_from_peer !== null && (
        <div className="mt-2 text-xs text-slate-500">
          {anomaly.delta_from_peer > 0 ? '+' : ''}{anomaly.delta_from_peer.toFixed(1)} pts vs peer avg
        </div>
      )}
    </div>
  )
}
