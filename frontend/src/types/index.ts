export interface Company {
  id: number
  name: string
  onboarding_complete: boolean
  autonomy_mode: 'monitor' | 'approval' | 'executor'
  slack_channel: string | null
  alert_email: string | null
  weight_engagement: number
  weight_adoption: number
  weight_health: number
  weight_support: number
  critical_threshold: number
  at_risk_threshold: number
}

export type HealthState = 'critical' | 'at_risk' | 'good' | 'healthy'

export interface AccountListItem {
  id: number
  name: string
  tier: 'starter' | 'growth' | 'scale'
  seats: number
  mrr: number
  renewal_date: string | null
  composite: number
  trend_delta: number
  state: HealthState
  has_pending_anomaly: boolean
}

export interface MetricPoint {
  date: string
  dau: number
  wau: number
  mau: number
  active_seats: number
  feature_count: number
  api_calls: number
  support_tickets: number
  logins: number
  composite: number
  engagement_score: number
  adoption_score: number
  health_score: number
  support_score: number
}

export interface Anomaly {
  id: number
  pattern: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  explanation: string | null
  outreach_draft: string | null
  outreach_status: 'pending' | 'sent' | 'rejected'
  z_score: number | null
  delta_from_peer: number | null
  detected_at: string
}

export interface ActivityEvent {
  id: number
  event_type: string
  description: string | null
  created_at: string
}

export interface AccountDetail {
  id: number
  name: string
  tier: 'starter' | 'growth' | 'scale'
  seats: number
  mrr: number
  renewal_date: string | null
  csm_name: string | null
  composite: number
  engagement_score: number
  adoption_score: number
  health_score: number
  support_score: number
  trend_delta: number
  state: HealthState
  metrics: MetricPoint[]
  anomalies: Anomaly[]
  events: ActivityEvent[]
}

export interface Stats {
  total_accounts: number
  critical_count: number
  at_risk_count: number
  good_count: number
  healthy_count: number
  avg_health: number
  total_mrr: number
  pending_approvals: number
  last_scan: string | null
}

export interface RevenueForecastPoint {
  month_start: string
  label: string
  projected_mrr: number
}

export interface RevenueForecast {
  current_mrr: number
  projected_mrr_end_12m: number
  projected_revenue_12m: number
  average_monthly_growth_pct: number
  monthly_projection: RevenueForecastPoint[]
  assumptions_note: string
}

export interface FilterState {
  stateFilter: HealthState | 'all'
  sortBy: 'score' | 'renewal'
}

export interface RenewalCalendarItem {
  account_id: number
  account_name: string
  renewal_date: string
  days_until_renewal: number
  composite: number
  health_state: HealthState
}

export interface RenewalNotificationSettings {
  enabled: boolean
  lead_times_days: number[]
}
