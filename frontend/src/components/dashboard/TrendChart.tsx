import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { MetricPoint } from '../../types'
import { scoreToColor } from '../../utils/healthColors'
import { formatDate } from '../../utils/formatters'

interface Props {
  metrics: MetricPoint[]
  composite: number
}

function aggregateWeekly(metrics: MetricPoint[]): Array<{ date: string; score: number }> {
  const weeks: Array<{ date: string; scores: number[] }> = []
  const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-84) // ~12 weeks

  for (let i = 0; i < recent.length; i += 7) {
    const chunk = recent.slice(i, i + 7)
    const avg = chunk.reduce((s, m) => s + m.composite, 0) / chunk.length
    weeks.push({ date: chunk[0].date, scores: chunk.map(m => m.composite) })
    weeks[weeks.length - 1] = { date: chunk[0].date, scores: [avg] }
  }

  return weeks.map(w => ({ date: w.date, score: Math.round(w.scores[0]) }))
}

export default function TrendChart({ metrics, composite }: Props) {
  const data = aggregateWeekly(metrics)
  const color = scoreToColor(composite)

  return (
    <div className="bg-card rounded-xl p-4 mb-4">
      <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">12-Week Trend</div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{
              background: '#21253a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={formatDate}
            formatter={(v: number) => [v, 'Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
