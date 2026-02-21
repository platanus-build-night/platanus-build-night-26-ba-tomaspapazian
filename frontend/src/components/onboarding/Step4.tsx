import { clsx } from 'clsx'

interface Props {
  value: string
  onChange: (v: string) => void
}

const MODES = [
  {
    id: 'monitor',
    name: 'Monitor',
    icon: '👁',
    description: 'Alerts and insights only. You review everything manually. No automated outreach.',
    color: 'border-slate-500/40 hover:border-slate-400/60',
    selectedColor: 'border-slate-400 bg-slate-500/10',
  },
  {
    id: 'approval',
    name: 'Approval',
    icon: '✅',
    description: 'AI drafts outreach emails. You review and approve before anything is sent.',
    color: 'border-blue-500/40 hover:border-blue-400/60',
    selectedColor: 'border-blue-400 bg-blue-500/10',
  },
  {
    id: 'executor',
    name: 'Executor',
    icon: '⚡',
    description: 'AI analyzes, decides, and sends outreach autonomously based on your rules.',
    color: 'border-purple-500/40 hover:border-purple-400/60',
    selectedColor: 'border-purple-400 bg-purple-500/10',
  },
]

export default function Step4({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Choose Autonomy Mode</h2>
      <p className="text-slate-400 mb-6">How much should PulseScore act on your behalf?</p>
      <div className="space-y-3">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border transition',
              value === mode.id ? mode.selectedColor : `border-white/10 bg-card ${mode.color}`
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <div>
                <div className="text-base font-semibold text-white mb-1">{mode.name}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{mode.description}</div>
              </div>
              {value === mode.id && (
                <div className="ml-auto text-green-400 text-lg">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
