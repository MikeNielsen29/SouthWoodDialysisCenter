/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kidney: {
          gradient: 'from-orange-500 to-yellow-500',
          light: '#FFE4C4',
        },
        support: {
          gradient: 'from-teal-500 to-green-500',
          light: '#E0F7FA',
        },
        neutral: {
          white: '#FFFFFF',
          lightGray: '#F3F4F6',
          gray: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Open Sans', 'Lato', 'sans-serif'],
        serif: ['Geist Serif', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
    base: true,
    styled: true,
    sweetAlert: true,
    utils: true,
    handlers: true,
    logs: false,
    rtl: false,
    prefix: '',
  },
}