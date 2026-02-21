import { useState } from 'react'
import { applyTheme, getStoredTheme, type ThemeMode } from '../../utils/theme'

export default function AppearanceSection() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme())

  function onThemeChange(theme: ThemeMode) {
    applyTheme(theme)
    setCurrentTheme(theme)
  }

  return (
    <section className="bg-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Appearance</h3>
      <p className="text-sm text-slate-500 mb-4">Choose how the site looks for your workspace.</p>
      <div className="flex items-center gap-2 bg-card border border-white/10 rounded-lg p-1 w-fit">
        <button
          onClick={() => onThemeChange('dark')}
          className={`px-3 py-1.5 text-sm rounded ${
            currentTheme === 'dark' ? 'bg-accent text-white' : 'text-slate-400'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => onThemeChange('light')}
          className={`px-3 py-1.5 text-sm rounded ${
            currentTheme === 'light' ? 'bg-accent text-white' : 'text-slate-400'
          }`}
        >
          Light
        </button>
      </div>
    </section>
  )
}
