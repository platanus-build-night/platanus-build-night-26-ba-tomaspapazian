import type { AccountDetail } from '../../types'
import { scoreToColor } from '../../utils/healthColors'
import { STATE_BG, STATE_LABELS } from '../../utils/healthColors'
import { formatRenewal, formatMrr } from '../../utils/formatters'
import { clsx } from 'clsx'

interface Props {
  account: AccountDetail
}

const TIER_COLORS: Record<string, string> = {
  starter: 'bg-slate-500/20 text-slate-400',
  growth: 'bg-blue-500/20 text-blue-400',
  scale: 'bg-purple-500/20 text-purple-400',
}

export default function ScoreHeader({ account }: Props) {
  const color = scoreToColor(account.composite)

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-white">{account.name}</h2>
          <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', TIER_COLORS[account.tier])}>
            {account.tier}
          </span>
          <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', STATE_BG[account.state])}>
            {STATE_LABELS[account.state]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{account.seats} seats</span>
          <span>{formatMrr(account.mrr)}/mo</span>
          {account.renewal_date && (
            <span>Renewal: {formatRenewal(account.renewal_date)}</span>
          )}
          {account.csm_name && <span>CSM: {account.csm_name}</span>}
        </div>
      </div>

      <div className="text-right">
        <div className="text-5xl font-bold" style={{ color }}>
          {account.composite.toFixed(0)}
        </div>
        <div className="text-sm mt-1">
          {account.trend_delta !== 0 && (
            <span className={account.trend_delta > 0 ? 'text-green-400' : 'text-red-400'}>
              {account.trend_delta > 0 ? '↑' : '↓'} {Math.abs(account.trend_delta).toFixed(1)} pts
            </span>
          )}
          {account.trend_delta === 0 && (
            <span className="text-slate-500">→ stable</span>
          )}
        </div>
      </div>
    </div>
  )
}
