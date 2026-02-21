import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import Step1 from '../components/onboarding/Step1'
import Step2 from '../components/onboarding/Step2'
import Step3 from '../components/onboarding/Step3'
import Step4 from '../components/onboarding/Step4'
import Step5 from '../components/onboarding/Step5'
import Step6 from '../components/onboarding/Step6'

const TOTAL_STEPS = 6

interface Config {
  weight_engagement: number
  weight_adoption: number
  weight_health: number
  weight_support: number
  critical_threshold: number
  at_risk_threshold: number
  slack_channel: string
  alert_email: string
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { refreshAll } = useApp()

  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [autonomyMode, setAutonomyMode] = useState('approval')
  const [config, setConfig] = useState<Config>({
    weight_engagement: 30,
    weight_adoption: 25,
    weight_health: 25,
    weight_support: 20,
    critical_threshold: 40,
    at_risk_threshold: 70,
    slack_channel: '',
    alert_email: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weightsTotal = config.weight_engagement + config.weight_adoption +
    config.weight_health + config.weight_support
  const canAdvance =
    (step === 1 && companyName.trim().length > 0) ||
    (step === 5 && Math.round(weightsTotal) === 100) ||
    (step !== 1 && step !== 5)

  const handleFinish = useCallback(async () => {
    if (isLoading || isDone) return
    setError(null)
    setIsLoading(true)
    try {
      await api.completeOnboarding({
        company_name: companyName || 'My Company',
        autonomy_mode: autonomyMode,
        slack_channel: config.slack_channel || null,
        alert_email: config.alert_email || null,
        weight_engagement: config.weight_engagement,
        weight_adoption: config.weight_adoption,
        weight_health: config.weight_health,
        weight_support: config.weight_support,
        critical_threshold: config.critical_threshold,
        at_risk_threshold: config.at_risk_threshold,
      })
      setIsDone(true)
      // Navigate immediately — refreshAll happens in the background
      navigate('/')
      refreshAll()
    } catch (e) {
      console.error('Onboarding failed', e)
      setError(`Setup failed: ${e instanceof Error ? e.message : String(e)}`)
      setIsLoading(false)
    }
  }, [isLoading, isDone, companyName, autonomyMode, config, navigate, refreshAll])

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }, [step, handleFinish])

  // Enter key advances steps
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
      if (step < TOTAL_STEPS && canAdvance) handleNext()
      else if (step === TOTAL_STEPS) handleFinish()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, canAdvance, handleNext, handleFinish])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm">
            PS
          </div>
          <span className="text-lg font-semibold text-white">PulseScore</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-xs text-slate-500">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-panel rounded-2xl p-8 border border-white/5 min-h-[380px] flex flex-col justify-between">
          <div className="flex-1">
            {step === 1 && <Step1 value={companyName} onChange={setCompanyName} />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 value={autonomyMode} onChange={setAutonomyMode} />}
            {step === 5 && <Step5 value={config} onChange={setConfig} />}
            {step === 6 && <Step6 isLoading={isLoading} isDone={isDone} />}
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || isLoading}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-0 transition text-sm"
            >
              ← Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className="px-6 py-2.5 bg-accent hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === TOTAL_STEPS - 1 ? 'Continue →' : 'Next →'}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="px-6 py-2.5 bg-accent hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up…' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
