import type { Company } from '../../types'

interface Props {
  company: Company
  onChange: (v: Partial<Company>) => void
}

export default function NotificationSection({ company, onChange }: Props) {
  return (
    <div className="bg-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Notifications</h3>
      <p className="text-sm text-slate-500 mb-4">Where should alerts be delivered?</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Slack Channel</label>
          <input
            type="text"
            value={company.slack_channel || ''}
            onChange={e => onChange({ slack_channel: e.target.value || null })}
            placeholder="#cs-alerts"
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">Alert Email</label>
          <input
            type="email"
            value={company.alert_email || ''}
            onChange={e => onChange({ alert_email: e.target.value || null })}
            placeholder="cs-team@company.com"
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-accent"
          />
        </div>
      </div>
    </div>
  )
}
