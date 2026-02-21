export type ThemeMode = 'dark' | 'light'

const THEME_KEY = 'pulsescore-theme'

export function getStoredTheme(): ThemeMode {
  const value = localStorage.getItem(THEME_KEY)
  return value === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}
