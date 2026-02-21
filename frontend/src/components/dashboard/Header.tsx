import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { api } from '../../api/client'
import type { RevenueForecast } from '../../types'
import RevenueForecastPanel from './RevenueForecastPanel'

export default function Header() {
  const { state, runScan } = useApp()
  const { stats, company, isScanning, scanFeedback } = state
  const [showRevenuePanel, setShowRevenuePanel] = useState(false)
  const [revenueHorizon, setRevenueHorizon] = useState<1 | 3 | 12>(12)
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecast | null>(null)
  const [loadingRevenue, setLoadingRevenue] = useState(false)
  const [revenueError, setRevenueError] = useState<string | null>(null)

  const modeBadge =
    company?.autonomy_mode === 'executor'
      ? 'bg-purple-500/20 text-purple-300'
      : company?.autonomy_mode === 'approval'
      ? 'bg-blue-500/20 text-blue-300'
      : 'bg-slate-500/20 text-slate-300'

  async function openRevenuePanel() {
    const nextOpen = !showRevenuePanel
    setShowRevenuePanel(nextOpen)
    if (!nextOpen || revenueForecast || loadingRevenue) return

    setLoadingRevenue(true)
    setRevenueError(null)
    try {
      const data = await api.getRevenueForecast()
      setRevenueForecast(data)
    } catch (e) {
      setRevenueError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoadingRevenue(false)
    }
  }

  async function retryRevenue() {
    setLoadingRevenue(true)
    setRevenueError(null)
    try {
      const data = await api.getRevenueForecast()
      setRevenueForecast(data)
    } catch (e) {
      setRevenueError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoadingRevenue(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-panel">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm">
          PS
        </div>
        <span className="text-lg font-semibold text-white">PulseScore</span>
        {company && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modeBadge}`}>
            {company.autonomy_mode}
          </span>
        )}
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-slate-400">
            <span className="text-white font-medium">{stats.total_accounts}</span> accounts
          </div>
          <div className="text-slate-400">
            <span className="text-red-400 font-medium">{stats.critical_count}</span> critical
          </div>
          <div className="text-slate-400">
            <span className="text-orange-400 font-medium">{stats.at_risk_count}</span> at risk
          </div>
          <div className="text-slate-400">
            avg <span className="text-white font-medium">{stats.avg_health.toFixed(0)}</span>
          </div>
          {stats.pending_approvals > 0 && (
            <div className="text-blue-400 font-medium">
              {stats.pending_approvals} pending
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="relative flex items-end gap-3">
        {scanFeedback && (
          <div
            className={`hidden lg:block text-xs max-w-[26rem] ${
              scanFeedback.kind === 'error' ? 'text-red-300' : 'text-emerald-300'
            }`}
          >
            {scanFeedback.message}
          </div>
        )}
        <button
          onClick={openRevenuePanel}
          className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm rounded-lg transition"
        >
          Revenue
        </button>
        <Link
          to="/calendar"
          className="px-4 py-2 bg-cyan-600/90 hover:bg-cyan-500 text-white text-sm rounded-lg transition"
        >
          Calendar
        </Link>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning…
            </>
          ) : (
            'Run Scan'
          )}
        </button>
        <Link
          to="/settings"
          className="px-3 py-2 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-white/5 transition"
        >
          Settings
        </Link>

        {showRevenuePanel && (
          <div className="absolute top-full right-0 mt-2 z-30">
            {loadingRevenue && (
              <div className="w-[36rem] max-w-[calc(100vw-2rem)] bg-card border border-white/10 rounded-xl p-4 text-sm text-slate-300">
                Loading revenue forecast...
              </div>
            )}

            {!loadingRevenue && revenueError && (
              <div className="w-[36rem] max-w-[calc(100vw-2rem)] bg-card border border-red-500/30 rounded-xl p-4">
                <div className="text-sm text-red-300 mb-2">Revenue forecast failed: {revenueError}</div>
                <button
                  onClick={retryRevenue}
                  className="px-3 py-1.5 text-xs bg-red-500/20 text-red-200 rounded hover:bg-red-500/30"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingRevenue && !revenueError && revenueForecast && (
              <RevenueForecastPanel
                forecast={revenueForecast}
                horizon={revenueHorizon}
                onChangeHorizon={setRevenueHorizon}
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
