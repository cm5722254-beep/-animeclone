/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          darkest: '#07090e',
          header: '#0b0f19',
          sidebar: '#090d15',
          workspace: '#0d121f',
          panel: '#111827',
          elevated: '#1e293b',
          border: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.04)',
        },
        cyan: {
          accent: '#38bdf8',
          hover: '#0ea5e9',
        },
        emerald: {
          accent: '#10b981',
        },
        violet: {
          accent: '#818cf8',
        }
      },
      fontFamily: {
        khmer: ['"Kantumruy Pro"', '"Outfit"', 'sans-serif'],
        ui: ['"Outfit"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
