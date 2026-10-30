import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12201C',
          soft: '#3F4F4A',
          muted: '#6D7C77',
        },
        brand: {
          50: '#F0F6F4',
          100: '#DCECE7',
          200: '#B9D9D0',
          300: '#8FC0B3',
          400: '#5C9C8C',
          500: '#2F7A69',
          600: '#1D6153',
          700: '#154E43',
          800: '#0F3B33',
          900: '#0B2C26',
          950: '#071E1A',
        },
        sand: {
          50: '#FCFAF6',
          100: '#F6F1E8',
          200: '#EDE4D6',
          300: '#DFD2BE',
        },
        ember: {
          100: '#FAE6D7',
          200: '#F2CDB0',
          400: '#E09B62',
          500: '#D07C3C',
          600: '#B4652C',
          700: '#91501F',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Iowan Old Style',
          'Palatino Linotype',
          'Palatino',
          'Book Antiqua',
          'Georgia',
          'ui-serif',
          'serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(18,32,28,0.04), 0 8px 24px -12px rgba(18,32,28,0.12)',
        lift: '0 2px 4px rgba(18,32,28,0.04), 0 24px 48px -24px rgba(18,32,28,0.22)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        shell: '1240px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light'],
    base: false,
    styled: false,
    logs: false,
    darkTheme: 'light',
  },
} satisfies Config
