import type { Company } from '../../types'

interface Props {
  company: Company
  onChange: (v: Partial<Company>) => void
}

const WEIGHTS: Array<{ key: keyof Company; label: string }> = [
  { key: 'weight_engagement', label: 'Engagement' },
  { key: 'weight_adoption', label: 'Adoption' },
  { key: 'weight_health', label: 'Health' },
  { key: 'weight_support', label: 'Support' },
]

export default function SignalWeightsSection({ company, onChange }: Props) {
  const total =
    company.weight_engagement + company.weight_adoption +
    company.weight_health + company.weight_support
  const isValid = Math.round(total) === 100

  return (
    <div className="bg-panel rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-white">Signal Weights</h3>
        <span className={`text-xs font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
          {total.toFixed(0)}% total {!isValid && '(must = 100)'}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-4">Weight each signal's contribution to health score.</p>
      <div className="space-y-4">
        {WEIGHTS.map(w => {
          const current = company[w.key] as number
          return (
            <div key={w.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-300">{w.label}</label>
                <span className="text-sm text-white font-medium">{current.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={current}
                onChange={e => {
                  const others = total - current
                  const capped = Math.min(parseInt(e.target.value), 100 - others)
                  onChange({ [w.key]: capped })
                }}
                className="w-full accent-indigo-500"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
