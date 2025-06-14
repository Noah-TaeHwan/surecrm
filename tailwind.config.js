/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      // 모바일 우선: 16px 기본, 데스크톱: 14px 기본
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      'base-mobile': ['1rem', { lineHeight: '1.5rem' }], // 16px - 모바일
      'base-desktop': ['0.875rem', { lineHeight: '1.25rem' }], // 14px - 데스크톱
      base: ['1rem', { lineHeight: '1.5rem' }], // 기본값 유지
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    spacing: {
      // 터치 친화적 최소 간격과 반응형 스페이싱
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem', // 44px - 최소 터치 타겟 크기
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      // 터치 타겟 특화 사이즈
      'touch-sm': '2.75rem', // 44px
      'touch-md': '3rem', // 48px
      'touch-lg': '3.5rem', // 56px
    },
    extend: {
      // 터치 타겟 최소 크기 확장
      minHeight: {
        'touch-sm': '2.75rem', // 44px
        'touch-md': '3rem', // 48px
        'touch-lg': '3.5rem', // 56px
        'touch-xl': '4rem', // 64px
      },
      minWidth: {
        'touch-sm': '2.75rem', // 44px
        'touch-md': '3rem', // 48px
        'touch-lg': '3.5rem', // 56px
        'touch-xl': '4rem', // 64px
      },
      // 터치 친화적 패딩 옵션
      padding: {
        'touch-sm': '0.75rem', // 12px
        'touch-md': '1rem', // 16px
        'touch-lg': '1.25rem', // 20px
        // 안전 영역 패딩 (iOS Safe Area)
        safe: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
      },
      // 안전 영역 마진
      margin: {
        safe: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
      },
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
