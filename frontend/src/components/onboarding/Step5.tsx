interface Config {
  weight_engagement: number
  weight_adoption: number
  weight_health: number
  weight_support: number
  critical_threshold: number
  at_risk_threshold: number
  slack_channel: string
  alert_email: string
}

interface Props {
  value: Config
  onChange: (v: Config) => void
}

const WEIGHTS = [
  { key: 'weight_engagement', label: 'Engagement' },
  { key: 'weight_adoption', label: 'Adoption' },
  { key: 'weight_health', label: 'Health' },
  { key: 'weight_support', label: 'Support' },
] as const

export default function Step5({ value, onChange }: Props) {
  const total =
    value.weight_engagement + value.weight_adoption +
    value.weight_health + value.weight_support
  const isValid = Math.round(total) === 100

  function updateWeight(key: keyof Config, num: number) {
    const others = total - (value[key] as number)
    const capped = Math.min(num, 100 - others)
    onChange({ ...value, [key]: capped })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Configure Signals</h2>
      <p className="text-slate-400 mb-6">Set signal weights and alert thresholds.</p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Signal Weights</span>
          <span className={`text-xs font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
            Total: {total.toFixed(0)}% {isValid ? '✓' : '(must = 100)'}
          </span>
        </div>
        <div className="space-y-3">
          {WEIGHTS.map(w => (
            <div key={w.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-400">{w.label}</label>
                <span className="text-sm text-white">{value[w.key]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value[w.key]}
                onChange={e => updateWeight(w.key, parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Critical Threshold</label>
          <input
            type="number"
            value={value.critical_threshold}
            onChange={e => onChange({ ...value, critical_threshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">At-Risk Threshold</label>
          <input
            type="number"
            value={value.at_risk_threshold}
            onChange={e => onChange({ ...value, at_risk_threshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Slack Channel</label>
          <input
            type="text"
            value={value.slack_channel}
            onChange={e => onChange({ ...value, slack_channel: e.target.value })}
            placeholder="#cs-alerts"
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm placeholder-slate-600"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">Alert Email</label>
          <input
            type="email"
            value={value.alert_email}
            onChange={e => onChange({ ...value, alert_email: e.target.value })}
            placeholder="cs-team@company.com"
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm placeholder-slate-600"
          />
        </div>
      </div>
    </div>
  )
}
