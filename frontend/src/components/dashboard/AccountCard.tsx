import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext'
import type { AccountListItem } from '../../types'
import { STATE_COLORS, STATE_BG, STATE_LABELS } from '../../utils/healthColors'
import { formatMrr, formatRenewal, formatRenewalDays } from '../../utils/formatters'
import { clsx } from 'clsx'

interface Props {
  account: AccountListItem
  isSelected: boolean
}

const TIER_COLORS: Record<string, string> = {
  starter: 'bg-slate-500/20 text-slate-400',
  growth: 'bg-blue-500/20 text-blue-400',
  scale: 'bg-purple-500/20 text-purple-400',
}

export default function AccountCard({ account, isSelected }: Props) {
  const { state, selectAccount } = useApp()

  // Get sparkline data from selected account if available, else empty
  const selectedDetail = state.selectedAccount?.id === account.id ? state.selectedAccount : null
  const sparkData = selectedDetail
    ? selectedDetail.metrics.slice(-14).map(m => ({ v: m.composite }))
    : Array.from({ length: 14 }, (_, i) => ({ v: account.composite + (Math.random() - 0.5) * 5 }))

  const color = STATE_COLORS[account.state]
  const renewalDays = formatRenewalDays(account.renewal_date)
  const isUrgent = renewalDays !== null && renewalDays <= 30

  return (
    <div
      onClick={() => selectAccount(account.id)}
      className={clsx(
        'px-3 py-3 cursor-pointer border-b border-white/5 hover:bg-white/[0.03] transition',
        isSelected && 'bg-white/[0.05] border-l-2',
        isSelected ? `border-l-[${color}]` : 'border-l-2 border-l-transparent'
      )}
      style={isSelected ? { borderLeftColor: color } : {}}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{account.name}</span>
            {account.has_pending_anomaly && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', TIER_COLORS[account.tier])}>
              {account.tier}
            </span>
            <span className="text-xs text-slate-500">{formatMrr(account.mrr)}/mo</span>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <ResponsiveContainer width={80} height={24}>
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health bar */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${account.composite}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={clsx('px-1.5 py-0.5 rounded font-medium', STATE_BG[account.state])}>
          {STATE_LABELS[account.state]}
        </span>
        <div className="flex items-center gap-2 text-slate-500">
          <span style={{ color }} className="font-medium">
            {account.composite.toFixed(0)}
          </span>
          {account.trend_delta !== 0 && (
            <span className={account.trend_delta > 0 ? 'text-green-400' : 'text-red-400'}>
              {account.trend_delta > 0 ? '↑' : '↓'}
              {Math.abs(account.trend_delta).toFixed(1)}
            </span>
          )}
          {account.renewal_date && (
            <span className={isUrgent ? 'text-orange-400' : ''}>
              {formatRenewal(account.renewal_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
