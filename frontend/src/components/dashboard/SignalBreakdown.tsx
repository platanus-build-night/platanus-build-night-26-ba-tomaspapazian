import type { AccountDetail } from '../../types'
import { scoreToColor } from '../../utils/healthColors'
import { clsx } from 'clsx'

interface Props {
  account: AccountDetail
}

interface Signal {
  name: string
  score: number
  prevScore?: number
}

export default function SignalBreakdown({ account }: Props) {
  const signals: Signal[] = [
    { name: 'Engagement', score: account.engagement_score },
    { name: 'Adoption', score: account.adoption_score },
    { name: 'Health', score: account.health_score },
    { name: 'Support', score: account.support_score },
  ]

  return (
    <div className="bg-card rounded-xl p-4 mb-4">
      <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Signal Breakdown</div>
      <div className="space-y-3">
        {signals.map(sig => {
          const color = scoreToColor(sig.score)
          return (
            <div key={sig.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">{sig.name}</span>
                <span className="text-sm font-medium" style={{ color }}>
                  {sig.score.toFixed(0)}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${sig.score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
