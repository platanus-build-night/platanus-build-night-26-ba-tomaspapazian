import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { RenewalCalendarItem, RenewalNotificationSettings } from '../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function isoFromParts(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, '0')
  return `${year}-${month}-${String(day).padStart(2, '0')}`
}

function buildCalendarCells(monthStart: Date): Array<number | null> {
  const year = monthStart.getFullYear()
  const monthIndex = monthStart.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const cells: Array<number | null> = []

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - firstWeekday + 1
    cells.push(dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null)
  }

  return cells
}

export default function RenewalCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [items, setItems] = useState<RenewalCalendarItem[]>([])
  const [settings, setSettings] = useState<RenewalNotificationSettings | null>(null)
  const [showTimingSettings, setShowTimingSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMonthKey = useMemo(() => monthKey(selectedMonth), [selectedMonth])
  const calendarCells = useMemo(() => buildCalendarCells(selectedMonth), [selectedMonth])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [calendar, notificationSettings] = await Promise.all([
          api.getRenewalCalendar(selectedMonthKey),
          api.getRenewalNotificationSettings(),
        ])
        setItems(calendar)
        setSettings(notificationSettings)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedMonthKey])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, RenewalCalendarItem[]>()
    items.forEach(item => {
      const bucket = map.get(item.renewal_date) ?? []
      bucket.push(item)
      map.set(item.renewal_date, bucket)
    })
    return map
  }, [items])

  function moveMonth(delta: number) {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  async function updateSettings(patch: { enabled?: boolean; lead_times_days?: number[] }) {
    if (!settings) return
    const previous = settings
    const optimistic = {
      enabled: patch.enabled ?? previous.enabled,
      lead_times_days: patch.lead_times_days ?? previous.lead_times_days,
    }
    setSettings(optimistic)
    setUpdating(true)
    try {
      const updated = await api.updateRenewalNotificationSettings(patch)
      setSettings(updated)
    } catch (e) {
      setSettings(previous)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUpdating(false)
    }
  }

  function toggleLeadTime(days: number) {
    if (!settings) return
    const selected = new Set(settings.lead_times_days)
    if (selected.has(days)) {
      selected.delete(days)
    } else {
      selected.add(days)
    }
    updateSettings({ lead_times_days: Array.from(selected).sort((a, b) => b - a) })
  }

  const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const healthClass: Record<string, string> = {
    critical: 'text-red-300',
    at_risk: 'text-orange-300',
    good: 'text-yellow-300',
    healthy: 'text-emerald-300',
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-panel">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition">← Dashboard</Link>
          <span className="text-slate-600">/</span>
          <span className="text-white text-sm font-medium">Renewal Calendar</span>
        </div>

        <div className="flex items-center gap-2">
          {settings && (
            <div className="relative mr-3 flex items-center gap-3 px-3 py-2 bg-card border border-white/10 rounded-full">
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Renewal Alerts</div>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  disabled={updating}
                  className={`text-xs font-medium transition ${
                    settings.enabled
                      ? 'text-emerald-300 hover:text-emerald-200'
                      : 'text-slate-400 hover:text-slate-300 line-through'
                  }`}
                  title="Click to toggle notifications"
                >
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <button
                onClick={() => setShowTimingSettings(prev => !prev)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10"
                title="Notification timing settings"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
                  <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1-1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1-1a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6z" />
                </svg>
              </button>
              {showTimingSettings && (
                <div className="absolute top-full right-0 mt-2 z-30 w-64 bg-card border border-white/10 rounded-xl p-3 shadow-xl">
                  <div className="text-xs text-slate-300 mb-2">Notify at these times:</div>
                  <label className="flex items-center gap-2 text-xs text-slate-200 mb-1.5">
                    <input className="accent-emerald-500" type="checkbox" checked={settings.lead_times_days.includes(90)} onChange={() => toggleLeadTime(90)} />
                    3 months earlier
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 mb-1.5">
                    <input className="accent-emerald-500" type="checkbox" checked={settings.lead_times_days.includes(30)} onChange={() => toggleLeadTime(30)} />
                    1 month earlier
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 mb-1.5">
                    <input className="accent-emerald-500" type="checkbox" checked={settings.lead_times_days.includes(14)} onChange={() => toggleLeadTime(14)} />
                    2 weeks earlier
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input className="accent-emerald-500" type="checkbox" checked={settings.lead_times_days.includes(7)} onChange={() => toggleLeadTime(7)} />
                    1 week earlier
                  </label>
                </div>
              )}
            </div>
          )}

          <button onClick={() => moveMonth(-1)} className="px-3 py-1.5 text-sm text-slate-200 bg-card rounded hover:bg-white/10">
            Prev
          </button>
          <div className="text-sm text-white min-w-36 text-center">{monthLabel}</div>
          <button onClick={() => moveMonth(1)} className="px-3 py-1.5 text-sm text-slate-200 bg-card rounded hover:bg-white/10">
            Next
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-panel border border-white/5 rounded-2xl p-4">
          <p className="text-sm text-slate-300 mb-4">
            Each marked date is when that startup would stop being a client unless renewed.
          </p>
          {error && <div className="text-sm text-red-300 mb-3">{error}</div>}
          {loading && <div className="text-sm text-slate-400">Loading calendar...</div>}

          {!loading && (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-xs uppercase tracking-wide text-slate-500 px-2 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-28 rounded-lg bg-white/5 border border-white/5 opacity-30" />
                  }

                  const isoDate = isoFromParts(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
                  const dayItems = itemsByDate.get(isoDate) ?? []
                  return (
                    <div key={isoDate} className="h-28 rounded-lg bg-card border border-white/10 p-2 overflow-auto">
                      <div className="text-xs text-white font-semibold mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayItems.map(item => (
                          <div key={item.account_id} className="text-[11px] bg-white/5 rounded p-1.5">
                            <div className="text-slate-100 truncate">{item.account_name}</div>
                            <div className={`mt-1 ${healthClass[item.health_state] || 'text-slate-300'}`}>
                              Health: {item.composite.toFixed(1)} ({item.health_state.replace('_', ' ')})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
