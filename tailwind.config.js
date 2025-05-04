/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        card: '#111111',
        border: '#333333',
        input: '#222222',
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
        secondary: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        info: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        muted: '#888888',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};