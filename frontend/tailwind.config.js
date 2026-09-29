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
        soc: {
          bg: '#0B0F17',
          card: '#131B2A',
          border: '#1E293B',
          hover: '#1E293B',
          accent: '#3B82F6',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          memory: '#8B5CF6', // Purple for Hindsight persistent memory
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      }
    },
  },
  plugins: [],
}
