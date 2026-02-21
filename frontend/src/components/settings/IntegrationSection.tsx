const INTEGRATIONS = [
  { name: 'Salesforce', status: 'connected', icon: '☁' },
  { name: 'HubSpot', status: 'disconnected', icon: '🟠' },
  { name: 'Segment', status: 'connected', icon: '◎' },
  { name: 'Mixpanel', status: 'disconnected', icon: '📊' },
]

export default function IntegrationSection() {
  return (
    <div className="bg-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Integrations</h3>
      <p className="text-sm text-slate-500 mb-4">Manage your connected data sources.</p>
      <div className="space-y-3">
        {INTEGRATIONS.map(intg => (
          <div key={intg.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{intg.icon}</span>
              <span className="text-sm text-white">{intg.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${intg.status === 'connected' ? 'text-green-400' : 'text-slate-600'}`}>
                {intg.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
              <button className="text-xs px-3 py-1 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-accent/50 transition">
                {intg.status === 'connected' ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
