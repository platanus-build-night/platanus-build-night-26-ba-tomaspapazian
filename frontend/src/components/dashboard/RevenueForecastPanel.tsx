import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenueForecast } from '../../types'

type Horizon = 1 | 3 | 12

interface Props {
  forecast: RevenueForecast
  horizon: Horizon
  onChangeHorizon: (horizon: Horizon) => void
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

export default function RevenueForecastPanel({ forecast, horizon, onChangeHorizon }: Props) {
  const horizonData = forecast.monthly_projection.slice(0, horizon)
  const horizonLabel =
    horizon === 1 ? 'Next Month' : horizon === 3 ? 'Next 3 Months' : 'Annual (12 Months)'

  return (
    <div className="w-[36rem] max-w-[calc(100vw-2rem)] bg-card border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-white font-semibold">Revenue Forecast</div>
          <div className="text-xs text-slate-400">{horizonLabel}</div>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => onChangeHorizon(1)}
            className={`px-2 py-1 text-xs rounded ${
              horizon === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            1M
          </button>
          <button
            onClick={() => onChangeHorizon(3)}
            className={`px-2 py-1 text-xs rounded ${
              horizon === 3 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            3M
          </button>
          <button
            onClick={() => onChangeHorizon(12)}
            className={`px-2 py-1 text-xs rounded ${
              horizon === 12 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            12M
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Current MRR</div>
          <div className="text-sm text-white font-semibold">{formatCurrency(forecast.current_mrr)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">12M End MRR</div>
          <div className="text-sm text-white font-semibold">{formatCurrency(forecast.projected_mrr_end_12m)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">12M Revenue</div>
          <div className="text-sm text-white font-semibold">{formatCurrency(forecast.projected_revenue_12m)}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={horizonData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v: number) => [formatCurrency(v), 'Projected MRR']}
            contentStyle={{
              background: '#1e2236',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey="projected_mrr"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 2, fill: '#34d399' }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 text-xs text-slate-400">
        Avg monthly growth: {forecast.average_monthly_growth_pct.toFixed(2)}%
      </div>
    </div>
  )
}
