import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#2D7D2E',
        secondary:  '#2E6EA6',
        accent:     '#F59332',
        success:    '#10B981',
        danger:     '#C82828',
        background: '#F0F7F0',
        foreground: '#1A3550',
        'node-done':   '#58CC02',
        'node-active': '#1CB0F6',
        'node-locked': '#AFAFAF',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'node': '0 4px 14px rgba(0,0,0,0.15)',
        'node-active': '0 4px 20px rgba(28,176,246,0.4)',
        'node-done':   '0 4px 20px rgba(88,204,2,0.35)',
        'card':  '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
export default config
