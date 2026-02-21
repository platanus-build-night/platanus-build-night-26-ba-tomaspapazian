import type { AccountDetail } from '../../types'

interface Props {
  account: AccountDetail
}

interface Action {
  label: string
  description: string
  variant: 'primary' | 'secondary' | 'warning'
}

function getActions(account: AccountDetail): Action[] {
  const actions: Action[] = []

  if (account.state === 'critical') {
    actions.push(
      { label: 'Schedule EBR', description: 'Executive business review call', variant: 'warning' },
      { label: 'Escalate to VP', description: 'Flag for executive attention', variant: 'warning' },
      { label: 'Offer free training', description: 'Re-engage with hands-on session', variant: 'secondary' },
    )
  } else if (account.state === 'at_risk') {
    actions.push(
      { label: 'Schedule check-in', description: '30-minute usage review call', variant: 'primary' },
      { label: 'Share success guide', description: 'Send adoption best practices', variant: 'secondary' },
    )
  } else if (account.state === 'good') {
    actions.push(
      { label: 'Share new features', description: 'Drive adoption of unused features', variant: 'primary' },
      { label: 'Request NPS survey', description: 'Gauge satisfaction level', variant: 'secondary' },
    )
  } else {
    actions.push(
      { label: 'Request referral', description: 'Ask for customer reference', variant: 'primary' },
      { label: 'Propose upsell', description: 'Expand seats or tier', variant: 'primary' },
      { label: 'Case study invite', description: 'Invite to co-author content', variant: 'secondary' },
    )
  }

  return actions
}

const VARIANT_STYLES = {
  primary: 'bg-accent/20 text-indigo-300 hover:bg-accent/30',
  secondary: 'bg-white/5 text-slate-300 hover:bg-white/10',
  warning: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
}

export default function RecommendedActions({ account }: Props) {
  const actions = getActions(account)

  return (
    <div className="bg-card rounded-xl p-4 mb-4">
      <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Recommended Actions</div>
      <div className="space-y-2">
        {actions.map(action => (
          <button
            key={action.label}
            className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${VARIANT_STYLES[action.variant]}`}
            onClick={() => {/* mock */}}
          >
            <div className="font-medium">{action.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{action.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
