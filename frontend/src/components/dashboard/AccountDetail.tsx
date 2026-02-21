import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import ScoreHeader from './ScoreHeader'
import TrendChart from './TrendChart'
import SignalBreakdown from './SignalBreakdown'
import AnomalyCard from './AnomalyCard'
import ApprovalCard from './ApprovalCard'
import ActivityTimeline from './ActivityTimeline'
import RecommendedActions from './RecommendedActions'

export default function AccountDetailPanel() {
  const { state, selectAccount } = useApp()
  const { selectedAccountId, selectedAccount, company } = state

  useEffect(() => {
    if (selectedAccountId && !selectedAccount) {
      selectAccount(selectedAccountId)
    }
  }, [selectedAccountId])

  if (!selectedAccountId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        <div className="text-center">
          <div className="text-4xl mb-3">↙</div>
          <div className="text-sm">Select an account to view details</div>
        </div>
      </div>
    )
  }

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  const account = selectedAccount
  const autonomyMode = company?.autonomy_mode || 'approval'

  // Find the most recent pending anomaly for approval mode
  const pendingAnomaly = account.anomalies.find(a => a.outreach_status === 'pending')
  const latestAnomaly = account.anomalies[0] || null

  return (
    <div className="h-full overflow-y-auto p-6">
      <ScoreHeader account={account} />
      <TrendChart metrics={account.metrics} composite={account.composite} />
      <SignalBreakdown account={account} />

      {/* Anomaly section */}
      {latestAnomaly && <AnomalyCard anomaly={latestAnomaly} />}

      {/* Approval card: shown in approval mode when there's a pending anomaly */}
      {autonomyMode === 'approval' && pendingAnomaly && (
        <ApprovalCard anomaly={pendingAnomaly} />
      )}

      {/* In executor mode, show the outreach status */}
      {autonomyMode === 'executor' && latestAnomaly && latestAnomaly.outreach_status === 'sent' && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4 text-sm text-purple-300">
          ✓ Outreach auto-sent by Executor
        </div>
      )}

      <RecommendedActions account={account} />
      <ActivityTimeline events={account.events} />
    </div>
  )
}
