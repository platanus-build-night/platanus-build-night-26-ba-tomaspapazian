import type { Company } from '../../types'

interface Props {
  company: Company
  onChange: (v: Partial<Company>) => void
}

export default function AlertThresholdsSection({ company, onChange }: Props) {
  return (
    <div className="bg-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Alert Thresholds</h3>
      <p className="text-sm text-slate-500 mb-4">Define when accounts enter different health states.</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Critical (below)</label>
          <input
            type="number"
            value={company.critical_threshold}
            onChange={e => onChange({ critical_threshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
          />
          <p className="text-xs text-red-400/70 mt-1">Triggers immediate alert</p>
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">At Risk (below)</label>
          <input
            type="number"
            value={company.at_risk_threshold}
            onChange={e => onChange({ at_risk_threshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
          />
          <p className="text-xs text-orange-400/70 mt-1">Triggers attention</p>
        </div>
      </div>
    </div>
  )
}
