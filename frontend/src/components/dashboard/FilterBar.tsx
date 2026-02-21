import { useApp } from '../../context/AppContext'
import type { HealthState } from '../../types'
import { clsx } from 'clsx'

const STATE_FILTERS: Array<{ value: HealthState | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'good', label: 'Good' },
  { value: 'healthy', label: 'Healthy' },
]

export default function FilterBar() {
  const { state, setFilter } = useApp()
  const { filterState } = state

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
      <div className="flex gap-1">
        {STATE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter({ stateFilter: f.value })}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition',
              filterState.stateFilter === f.value
                ? 'bg-accent text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select
        value={filterState.sortBy}
        onChange={e => setFilter({ sortBy: e.target.value as 'score' | 'renewal' })}
        className="text-xs text-slate-400 bg-transparent border-0 cursor-pointer hover:text-white"
      >
        <option value="score">Sort: Score</option>
        <option value="renewal">Sort: Renewal</option>
      </select>
    </div>
  )
}
