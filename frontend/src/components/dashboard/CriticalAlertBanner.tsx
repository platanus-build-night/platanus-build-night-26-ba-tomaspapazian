import { useApp } from '../../context/AppContext'

export default function CriticalAlertBanner() {
  const { state } = useApp()
  const criticalAccounts = state.accounts.filter(a => a.state === 'critical')

  if (criticalAccounts.length === 0) return null

  return (
    <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-2.5 flex items-center gap-3 text-sm">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      <span className="text-red-300 font-medium">
        {criticalAccounts.length} account{criticalAccounts.length > 1 ? 's' : ''} in critical state:{' '}
        <span className="text-red-200">{criticalAccounts.map(a => a.name).join(', ')}</span>
      </span>
    </div>
  )
}
