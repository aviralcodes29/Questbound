/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        surface: {
          DEFAULT: '#151d32',
          light: '#1c2642',
          card: '#131a2d',
          border: '#253457',
          highlight: '#2c3e66',
        },
        essence: {
          DEFAULT: '#6ee7f9',
          glow: 'rgba(110, 231, 249, 0.35)',
          dark: '#0891b2',
        },
        gold: {
          DEFAULT: '#f6c453',
          glow: 'rgba(246, 196, 83, 0.35)',
          dark: '#d97706',
        },
        mint: {
          DEFAULT: '#78e6a0',
          glow: 'rgba(120, 230, 160, 0.35)',
          dark: '#059669',
        },
        coral: {
          DEFAULT: '#ff8b7b',
          glow: 'rgba(255, 139, 123, 0.35)',
          dark: '#dc2626',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'moonlit': '0 4px 20px -2px rgba(110, 231, 249, 0.15)',
        'gold-glow': '0 4px 20px -2px rgba(246, 196, 83, 0.25)',
        'mint-glow': '0 4px 20px -2px rgba(120, 230, 160, 0.25)',
        'card': '0 4px 16px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
