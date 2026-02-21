import { useState } from 'react'
import { clsx } from 'clsx'

const SIGNALS = [
  { id: 'engagement', name: 'Engagement', description: 'DAU/MAU ratio, login frequency' },
  { id: 'adoption', name: 'Adoption', description: 'Feature usage, active seat ratio' },
  { id: 'health', name: 'Health', description: 'API volume, WAU trends' },
  { id: 'support', name: 'Support', description: 'Ticket volume, NPS score' },
]

const EVENTS = [
  'page_view', 'feature_click', 'api_call', 'login', 'export', 'support_ticket', 'nps_response',
]

export default function Step3() {
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [active, setActive] = useState<string | null>(null)

  function assign(signalId: string, event: string) {
    setMappings(prev => ({ ...prev, [signalId]: event }))
    setActive(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Map Your Events</h2>
      <p className="text-slate-400 mb-6">Assign product events to health signal categories.</p>
      <div className="space-y-3">
        {SIGNALS.map(sig => (
          <div
            key={sig.id}
            className="flex items-center gap-4 p-3 bg-card rounded-xl border border-white/5"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{sig.name}</div>
              <div className="text-xs text-slate-500">{sig.description}</div>
            </div>
            {active === sig.id ? (
              <div className="flex gap-2 flex-wrap">
                {EVENTS.map(ev => (
                  <button
                    key={ev}
                    onClick={() => assign(sig.id, ev)}
                    className="text-xs px-2 py-1 bg-accent/20 text-indigo-300 rounded hover:bg-accent/40 transition"
                  >
                    {ev}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setActive(sig.id)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-slate-400 hover:border-accent/50 hover:text-white transition"
              >
                {mappings[sig.id] ? (
                  <span className="text-indigo-300">{mappings[sig.id]}</span>
                ) : (
                  'Assign event'
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
