import { clsx } from 'clsx'
import type { Company } from '../../types'

interface Props {
  company: Company
  onChange: (v: Partial<Company>) => void
}

const MODES = [
  { id: 'monitor', label: 'Monitor', desc: 'Alerts only, no automated outreach' },
  { id: 'approval', label: 'Approval', desc: 'AI drafts, you approve before sending' },
  { id: 'executor', label: 'Executor', desc: 'AI acts autonomously on your behalf' },
]

export default function AutonomyModeSection({ company, onChange }: Props) {
  return (
    <div className="bg-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Autonomy Mode</h3>
      <p className="text-sm text-slate-500 mb-4">Control how much PulseScore acts autonomously.</p>
      <div className="space-y-2">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => onChange({ autonomy_mode: mode.id as Company['autonomy_mode'] })}
            className={clsx(
              'w-full text-left p-3 rounded-xl border transition',
              company.autonomy_mode === mode.id
                ? 'border-accent bg-accent/10'
                : 'border-white/10 bg-card hover:border-white/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{mode.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{mode.desc}</div>
              </div>
              {company.autonomy_mode === mode.id && (
                <span className="text-accent text-lg">●</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
