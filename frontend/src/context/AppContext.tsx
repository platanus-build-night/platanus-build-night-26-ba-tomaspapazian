import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { Company, AccountListItem, AccountDetail, Stats, FilterState } from '../types'
import { api, type ScanSummary } from '../api/client'

interface ScanFeedback {
  kind: 'success' | 'error'
  message: string
}

interface AppState {
  company: Company | null
  accounts: AccountListItem[]
  stats: Stats | null
  selectedAccountId: number | null
  selectedAccount: AccountDetail | null
  filterState: FilterState
  isScanning: boolean
  scanFeedback: ScanFeedback | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_COMPANY'; payload: Company }
  | { type: 'SET_ACCOUNTS'; payload: AccountListItem[] }
  | { type: 'SET_STATS'; payload: Stats }
  | { type: 'SET_SELECTED'; payload: number | null }
  | { type: 'SET_ACCOUNT_DETAIL'; payload: AccountDetail | null }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_SCAN_FEEDBACK'; payload: ScanFeedback | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPTIMISTIC_OUTREACH'; payload: { anomalyId: number; status: 'sent' | 'rejected' } }

const initialState: AppState = {
  company: null,
  accounts: [],
  stats: null,
  selectedAccountId: null,
  selectedAccount: null,
  filterState: { stateFilter: 'all', sortBy: 'score' },
  isScanning: false,
  scanFeedback: null,
  loading: true,
  error: null,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_COMPANY':
      return { ...state, company: action.payload }
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_SELECTED':
      return { ...state, selectedAccountId: action.payload, selectedAccount: null }
    case 'SET_ACCOUNT_DETAIL':
      return { ...state, selectedAccount: action.payload }
    case 'SET_FILTER':
      return { ...state, filterState: { ...state.filterState, ...action.payload } }
    case 'SET_SCANNING':
      return { ...state, isScanning: action.payload }
    case 'SET_SCAN_FEEDBACK':
      return { ...state, scanFeedback: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'OPTIMISTIC_OUTREACH':
      if (!state.selectedAccount) return state
      return {
        ...state,
        selectedAccount: {
          ...state.selectedAccount,
          anomalies: state.selectedAccount.anomalies.map(a =>
            a.id === action.payload.anomalyId
              ? { ...a, outreach_status: action.payload.status }
              : a
          ),
        },
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  refreshAll: () => Promise<void>
  selectAccount: (id: number) => void
  runScan: () => Promise<void>
  approveOutreach: (anomalyId: number) => Promise<void>
  rejectOutreach: (anomalyId: number) => Promise<void>
  setFilter: (f: Partial<FilterState>) => void
  refreshCompany: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function formatScanSummary(summary: ScanSummary): string {
  const base = `Scanned ${summary.accounts_scanned} accounts`
  const scoreChanges = `${summary.health_scores_created} new scores, ${summary.health_scores_updated} refreshed`
  const totalAlerts = summary.alerts_created + (summary.renewal_alerts_created ?? 0)
  const findings = `${summary.anomalies_created} anomalies, ${totalAlerts} alerts`
  const skipped = summary.anomalies_skipped_recent > 0 ? `, ${summary.anomalies_skipped_recent} skipped (cooldown)` : ''
  return `${base}. ${scoreChanges}. ${findings}${skipped}.`
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refreshAll = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const [company, accounts, stats] = await Promise.all([
        api.getCompany(),
        api.listAccounts(),
        api.getStats(),
      ])
      dispatch({ type: 'SET_COMPANY', payload: company })
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: String(e) })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const refreshCompany = useCallback(async () => {
    const company = await api.getCompany()
    dispatch({ type: 'SET_COMPANY', payload: company })
  }, [])

  const selectAccount = useCallback(async (id: number) => {
    dispatch({ type: 'SET_SELECTED', payload: id })
    try {
      const detail = await api.getAccount(id)
      dispatch({ type: 'SET_ACCOUNT_DETAIL', payload: detail })
    } catch (e) {
      console.error('Failed to load account detail', e)
    }
  }, [])

  const runScan = useCallback(async () => {
    dispatch({ type: 'SET_SCANNING', payload: true })
    dispatch({ type: 'SET_SCAN_FEEDBACK', payload: null })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      const scanResult = await api.runScan()
      const [company, accounts, stats] = await Promise.all([
        api.getCompany(),
        api.listAccounts(),
        api.getStats(),
      ])
      dispatch({ type: 'SET_COMPANY', payload: company })
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
      dispatch({ type: 'SET_STATS', payload: stats })
      if (state.selectedAccountId) {
        const detail = await api.getAccount(state.selectedAccountId)
        dispatch({ type: 'SET_ACCOUNT_DETAIL', payload: detail })
      }
      dispatch({
        type: 'SET_SCAN_FEEDBACK',
        payload: { kind: 'success', message: formatScanSummary(scanResult.summary) },
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      dispatch({ type: 'SET_ERROR', payload: message })
      dispatch({
        type: 'SET_SCAN_FEEDBACK',
        payload: { kind: 'error', message: `Scan failed: ${message}` },
      })
    } finally {
      dispatch({ type: 'SET_SCANNING', payload: false })
    }
  }, [state.selectedAccountId])

  const approveOutreach = useCallback(async (anomalyId: number) => {
    dispatch({ type: 'OPTIMISTIC_OUTREACH', payload: { anomalyId, status: 'sent' } })
    try {
      await api.approveOutreach(anomalyId)
      const [accounts, stats] = await Promise.all([api.listAccounts(), api.getStats()])
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (e) {
      console.error('Approve failed', e)
    }
  }, [])

  const rejectOutreach = useCallback(async (anomalyId: number) => {
    dispatch({ type: 'OPTIMISTIC_OUTREACH', payload: { anomalyId, status: 'rejected' } })
    try {
      await api.rejectOutreach(anomalyId)
    } catch (e) {
      console.error('Reject failed', e)
    }
  }, [])

  const setFilter = useCallback((f: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTER', payload: f })
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <AppContext.Provider
      value={{
        state,
        refreshAll,
        selectAccount,
        runScan,
        approveOutreach,
        rejectOutreach,
        setFilter,
        refreshCompany,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
