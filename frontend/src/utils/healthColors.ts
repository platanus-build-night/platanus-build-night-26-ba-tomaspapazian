import type { HealthState } from '../types'

export const STATE_COLORS: Record<HealthState, string> = {
  critical: '#ef4444',
  at_risk: '#f97316',
  good: '#eab308',
  healthy: '#22c55e',
}

export const STATE_BG: Record<HealthState, string> = {
  critical: 'bg-red-500/20 text-red-400',
  at_risk: 'bg-orange-500/20 text-orange-400',
  good: 'bg-yellow-500/20 text-yellow-400',
  healthy: 'bg-green-500/20 text-green-400',
}

export const STATE_LABELS: Record<HealthState, string> = {
  critical: 'Critical',
  at_risk: 'At Risk',
  good: 'Good',
  healthy: 'Healthy',
}

export function scoreToColor(score: number, criticalThreshold = 40, atRiskThreshold = 70): string {
  if (score < criticalThreshold) return STATE_COLORS.critical
  if (score < atRiskThreshold) return STATE_COLORS.at_risk
  if (score < 85) return STATE_COLORS.good
  return STATE_COLORS.healthy
}

export function scoreToState(score: number, criticalThreshold = 40, atRiskThreshold = 70): HealthState {
  if (score < criticalThreshold) return 'critical'
  if (score < atRiskThreshold) return 'at_risk'
  if (score < 85) return 'good'
  return 'healthy'
}
