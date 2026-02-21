import { useState } from 'react'
import { clsx } from 'clsx'

const INTEGRATIONS = [
  { id: 'salesforce', name: 'Salesforce', icon: '☁' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠' },
  { id: 'segment', name: 'Segment', icon: '◎' },
  { id: 'mixpanel', name: 'Mixpanel', icon: '📊' },
]

export default function Step2() {
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [connecting, setConnecting] = useState<string | null>(null)

  async function handleConnect(id: string) {
    setConnecting(id)
    await new Promise(r => setTimeout(r, 1200))
    setConnected(prev => new Set([...prev, id]))
    setConnecting(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Connect Your Data</h2>
      <p className="text-slate-400 mb-8">Connect your product analytics and CRM to pull usage signals.</p>
      <div className="grid grid-cols-2 gap-3">
        {INTEGRATIONS.map(intg => {
          const isConnected = connected.has(intg.id)
          const isConnecting = connecting === intg.id
          return (
            <button
              key={intg.id}
              onClick={() => !isConnected && handleConnect(intg.id)}
              className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border transition text-left',
                isConnected
                  ? 'border-green-500/40 bg-green-500/10 cursor-default'
                  : 'border-white/10 bg-card hover:border-accent/50 cursor-pointer'
              )}
            >
              <span className="text-2xl">{intg.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">{intg.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isConnected ? (
                    <span className="text-green-400">Connected ✓</span>
                  ) : isConnecting ? (
                    <span className="text-slate-400 animate-pulse">Connecting…</span>
                  ) : (
                    'Click to connect'
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-slate-600">
        This is a demo — connections are simulated and no real OAuth is performed.
      </p>
    </div>
  )
}
