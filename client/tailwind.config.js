/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a4d2e',
          dark: '#0f3320',
          light: '#2d6b47'
        },
        secondary: {
          DEFAULT: '#7a9b7e',
          dark: '#5a7b5e',
          light: '#9ab89e'
        },
        accent: {
          DEFAULT: '#8b9474',
          light: '#a8b091'
        },
        cream: '#f5f1e8',
        beige: '#e8e0d0',
        olive: '#697756',
        charcoal: '#2c2c2c',
        muted: '#6b7669'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem'
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out'
      }
    },
  },
  plugins: [],
}
