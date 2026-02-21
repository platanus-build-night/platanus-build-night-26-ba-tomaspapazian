import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import type { Company } from '../types'
import IntegrationSection from '../components/settings/IntegrationSection'
import AutonomyModeSection from '../components/settings/AutonomyModeSection'
import SignalWeightsSection from '../components/settings/SignalWeightsSection'
import AlertThresholdsSection from '../components/settings/AlertThresholdsSection'
import NotificationSection from '../components/settings/NotificationSection'
import AppearanceSection from '../components/settings/AppearanceSection'

export default function SettingsPage() {
  const { state, refreshCompany } = useApp()
  const [localCompany, setLocalCompany] = useState<Company | null>(state.company)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!localCompany) {
    return <div className="p-8 text-slate-500">Loading…</div>
  }

  function handleChange(updates: Partial<Company>) {
    setLocalCompany(prev => prev ? { ...prev, ...updates } : prev)
    setSaved(false)
  }

  async function handleSave() {
    if (!localCompany) return
    setSaving(true)
    try {
      await api.updateCompany({
        name: localCompany.name,
        autonomy_mode: localCompany.autonomy_mode,
        slack_channel: localCompany.slack_channel,
        alert_email: localCompany.alert_email,
        weight_engagement: localCompany.weight_engagement,
        weight_adoption: localCompany.weight_adoption,
        weight_health: localCompany.weight_health,
        weight_support: localCompany.weight_support,
        critical_threshold: localCompany.critical_threshold,
        at_risk_threshold: localCompany.at_risk_threshold,
      })
      await refreshCompany()
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-panel">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition">← Dashboard</Link>
          <span className="text-slate-600">/</span>
          <span className="text-white text-sm font-medium">Settings</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-accent hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-8 space-y-6">
        {/* Company name */}
        <div className="bg-panel rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-1">Company</h3>
          <p className="text-sm text-slate-500 mb-4">Your workspace name.</p>
          <input
            type="text"
            value={localCompany.name}
            onChange={e => handleChange({ name: e.target.value })}
            className="w-full px-3 py-2 bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <AutonomyModeSection company={localCompany} onChange={handleChange} />
        <AppearanceSection />
        <SignalWeightsSection company={localCompany} onChange={handleChange} />
        <AlertThresholdsSection company={localCompany} onChange={handleChange} />
        <NotificationSection company={localCompany} onChange={handleChange} />
        <IntegrationSection />

        {/* Danger zone */}
        <div className="bg-panel rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-lg font-semibold text-white mb-1">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Reset all data and reseed with demo data.</p>
          <button
            onClick={async () => {
              if (confirm('Reset all data? This cannot be undone.')) {
                await api.reseed()
                window.location.href = '/'
              }
            }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  )
}
