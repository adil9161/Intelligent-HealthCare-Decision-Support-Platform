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
        brand: {
          teal: '#0D9488',
          'deep-teal': '#0F766E',
          turquoise: '#2DD4BF',
          blue: '#3B82F6',
          'sky-blue': '#E0F2FE',
          mint: '#D1FAE5',
          'pale-teal': '#F0FDFA',
          bg: '#F7FAFC',
          card: '#FFFFFF',
        },
        accent: {
          violet: '#8B5CF6',
          lavender: '#EDE9FE',
          coral: '#FB7185',
          'coral-bg': '#FFF1F2',
          amber: '#F59E0B',
          'amber-bg': '#FEF3C7',
          emerald: '#10B981',
          'emerald-bg': '#D1FAE5',
        },
        typography: {
          primary: '#172033',
          secondary: '#526176',
          muted: '#8492A6',
          border: '#E2E8F0',
          divider: '#EDF2F7',
        },
        teal: {
          950: '#021817',
          900: '#042726',
          850: '#073634',
          800: '#0c4a47',
          700: '#0f766e',
          600: '#0d9488',
          500: '#14b8a6',
          400: '#2dd4bf',
          300: '#5eead4',
          200: '#99f6e4',
          100: '#ccfbf1',
          50: '#f0fdfa',
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          accent: '#fb7185',
          glow: 'rgba(251, 113, 133, 0.35)',
        },
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        midnight: {
          800: '#071f1e',
          850: '#051817',
          900: '#031211',
          950: '#010b0a',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace']
      },
      borderRadius: {
        'card': '18px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'card-elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glass': '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
        'glow-teal': '0 0 25px rgba(13, 148, 136, 0.25)',
        'glow-coral': '0 0 25px rgba(251, 113, 133, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
