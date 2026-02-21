import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import SettingsPage from './pages/SettingsPage'
import RenewalCalendarPage from './pages/RenewalCalendarPage'

function AppRoutes() {
  const { state } = useApp()

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-slate-400 text-lg animate-pulse">Loading PulseScore…</div>
      </div>
    )
  }

  // Show onboarding if: company missing OR onboarding not complete
  const needsOnboarding = !state.company || !state.company.onboarding_complete

  return (
    <Routes>
      <Route
        path="/"
        element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <DashboardPage />}
      />
      <Route
        path="/calendar"
        element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <RenewalCalendarPage />}
      />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
