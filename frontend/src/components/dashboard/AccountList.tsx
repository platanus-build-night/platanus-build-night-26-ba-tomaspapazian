import { useApp } from '../../context/AppContext'
import { formatRenewalDays } from '../../utils/formatters'
import AccountCard from './AccountCard'
import FilterBar from './FilterBar'

export default function AccountList() {
  const { state } = useApp()
  const { accounts, filterState, selectedAccountId } = state

  let filtered = accounts.filter(a => {
    if (filterState.stateFilter === 'all') return true
    return a.state === filterState.stateFilter
  })

  if (filterState.sortBy === 'renewal') {
    filtered = [...filtered].sort((a, b) => {
      const da = formatRenewalDays(a.renewal_date) ?? 999
      const db = formatRenewalDays(b.renewal_date) ?? 999
      return da - db
    })
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No accounts match filter</div>
        ) : (
          filtered.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={account.id === selectedAccountId}
            />
          ))
        )}
      </div>
    </div>
  )
}
