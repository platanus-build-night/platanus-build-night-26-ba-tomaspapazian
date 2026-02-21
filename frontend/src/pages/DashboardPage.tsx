import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Header from '../components/dashboard/Header'
import CriticalAlertBanner from '../components/dashboard/CriticalAlertBanner'
import AccountList from '../components/dashboard/AccountList'
import AccountDetailPanel from '../components/dashboard/AccountDetail'

export default function DashboardPage() {
  const { state, selectAccount } = useApp()
  const { accounts, selectedAccountId } = state

  // Auto-select first account
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      selectAccount(accounts[0].id)
    }
  }, [accounts, selectedAccountId, selectAccount])

  return (
    <div className="flex flex-col h-screen bg-bg">
      <Header />
      <CriticalAlertBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: account list */}
        <div className="w-72 flex-shrink-0 bg-panel border-r border-white/5 flex flex-col overflow-hidden">
          <AccountList />
        </div>

        {/* Right panel: account detail */}
        <div className="flex-1 bg-bg overflow-hidden">
          <AccountDetailPanel />
        </div>
      </div>
    </div>
  )
}
