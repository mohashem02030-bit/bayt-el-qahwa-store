/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE1D3',
          300: '#DDCDB4',
        },
        espresso: {
          50: '#F6F1ED',
          100: '#E8DCD3',
          200: '#C9A98E',
          300: '#A87B57',
          400: '#7B5236',
          500: '#5A361F',
          600: '#432917',
          700: '#2E1B0E',
          800: '#1C1009',
          900: '#120A05',
        },
        gold: {
          50: '#FBF6EC',
          100: '#F5E6C8',
          200: '#ECD493',
          300: '#E0BF5E',
          400: '#D4A93A',
          500: '#BE8F23',
          600: '#9A711B',
          700: '#765616',
          800: '#523D10',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 40px -12px rgba(67, 41, 23, 0.25)',
        'warm-lg': '0 24px 60px -16px rgba(67, 41, 23, 0.4)',
        gold: '0 8px 24px -8px rgba(190, 143, 35, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        steam: {
          '0%': { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scaleX(1.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.25s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        steam: 'steam 2.5s ease-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
