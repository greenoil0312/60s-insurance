/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
        display: ['var(--font-pretendard)', 'Pretendard', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#d9eaff',
          200: '#bbd9ff',
          300: '#8ec0ff',
          400: '#5a9df8',
          500: '#3578f0',
          600: '#1f57e5',
          700: '#1843cf',
          800: '#1a37a8',
          900: '#1b3484',
          950: '#141f50',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        surface: {
          DEFAULT: '#0f1117',
          card: '#1a1d2e',
          elevated: '#222438',
          border: '#2d3048',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #141f50 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(53,120,240,0.08) 0%, rgba(20,184,166,0.05) 100%)',
        'glow-brand': 'radial-gradient(ellipse at center, rgba(53,120,240,0.25) 0%, transparent 70%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'glow': '0 0 30px rgba(53,120,240,0.3)',
        'glow-teal': '0 0 30px rgba(20,184,166,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'step-in': 'stepIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        stepIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      screens: {
        'tablet': '768px',
        'tablet-lg': '1024px',
        'desktop': '1280px',
      },
    },
  },
  plugins: [],
};
