/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        'marquee-vertical-reverse':
          'marquee-vertical-reverse var(--duration) linear infinite',
        shimmer: 'shimmer 2s infinite',
        ping: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        grid: 'grid 15s linear infinite',
        pulse: 'pulse 3s ease-in-out infinite',
        'border-beam': 'border-beam 2s linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(calc(-100% - var(--gap)))' },
          to: { transform: 'translateX(0)' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical-reverse': {
          from: { transform: 'translateY(calc(-100% - var(--gap)))' },
          to: { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        ping: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        grid: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(calc(var(--cell-size) * 2))' },
        },
        pulse: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.8 },
        },
        'border-beam': {
          '0%': {
            transform: 'rotate(0deg)',
            opacity: 0.3,
          },
          '50%': {
            opacity: 1,
          },
          '100%': {
            transform: 'rotate(360deg)',
            opacity: 0.3,
          },
        },
      },
    },
  },
  plugins: [],
};
