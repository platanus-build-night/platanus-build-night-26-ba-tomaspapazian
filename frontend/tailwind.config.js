/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'health-critical': 'rgb(var(--color-health-critical) / <alpha-value>)',
        'health-at-risk': 'rgb(var(--color-health-at-risk) / <alpha-value>)',
        'health-good': 'rgb(var(--color-health-good) / <alpha-value>)',
        'health-healthy': 'rgb(var(--color-health-healthy) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
