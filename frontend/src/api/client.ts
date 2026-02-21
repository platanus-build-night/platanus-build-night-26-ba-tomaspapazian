import type {
  Company,
  AccountListItem,
  AccountDetail,
  Stats,
  RevenueForecast,
  RenewalCalendarItem,
  RenewalNotificationSettings,
} from '../types'

export interface ScanSummary {
  accounts_scanned: number
  health_scores_created: number
  health_scores_updated: number
  anomalies_created: number
  anomalies_skipped_recent: number
  alerts_created: number
  renewal_alerts_created?: number
  outreach_auto_sent: number
  scan_completed_at: string | null
}

export interface ScanResponse {
  status: 'ok'
  message: string
  summary: ScanSummary
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const withBase = (path: string) => `${API_BASE}${path}`

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(withBase(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getCompany: () => request<Company>('/api/company'),
  updateCompany: (data: Partial<Company>) =>
    request<Company>('/api/company', { method: 'PUT', body: JSON.stringify(data) }),
  completeOnboarding: (data: Record<string, unknown>) =>
    request('/api/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  listAccounts: () => request<AccountListItem[]>('/api/accounts'),
  getAccount: (id: number) => request<AccountDetail>(`/api/accounts/${id}`),

  getStats: () => request<Stats>('/api/stats'),
  getRevenueForecast: () => request<RevenueForecast>('/api/revenue-forecast'),
  getRenewalCalendar: (month: string) =>
    request<RenewalCalendarItem[]>(`/api/renewals/calendar?month=${encodeURIComponent(month)}`),
  getRenewalNotificationSettings: () =>
    request<RenewalNotificationSettings>('/api/renewals/notification-settings'),
  updateRenewalNotificationSettings: (data: { enabled?: boolean; lead_times_days?: number[] }) =>
    request<RenewalNotificationSettings>('/api/renewals/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  approveOutreach: (anomalyId: number) =>
    request(`/api/anomalies/${anomalyId}/approve`, { method: 'POST' }),
  rejectOutreach: (anomalyId: number) =>
    request(`/api/anomalies/${anomalyId}/reject`, { method: 'POST' }),

  runScan: () => request<ScanResponse>('/api/run-scan', { method: 'POST' }),
  reseed: () => request('/api/seed', { method: 'POST' }),
}
