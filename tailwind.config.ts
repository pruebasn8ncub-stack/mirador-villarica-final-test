import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bosque: {
          DEFAULT: '#1a3d2e',
          50: '#f0f5f2',
          100: '#d9e6df',
          200: '#b3cdbf',
          300: '#8cb39f',
          400: '#669a7f',
          500: '#3f8060',
          600: '#33664d',
          700: '#264d3a',
          800: '#1a3d2e',
          900: '#0d1f17',
          950: '#071410',
        },
        mostaza: {
          DEFAULT: '#f4a84b',
          50: '#fdf5eb',
          100: '#fbe6c7',
          200: '#f7cd8f',
          300: '#f4a84b',
          400: '#e78d24',
          500: '#c9731a',
        },
        crema: {
          DEFAULT: '#faf6ee',
          50: '#fdfbf6',
          100: '#faf6ee',
          200: '#f4ead5',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        // Shadow layering para look premium
        'chat-launcher': '0 10px 30px -5px rgba(26, 61, 46, 0.4), 0 4px 12px -2px rgba(26, 61, 46, 0.25)',
        'chat-window': '0 25px 50px -12px rgba(26, 61, 46, 0.35), 0 10px 20px -5px rgba(26, 61, 46, 0.15)',
        'chat-bubble-user': '0 1px 2px rgba(26, 61, 46, 0.15)',
        'chat-bubble-bot': '0 1px 3px rgba(26, 61, 46, 0.08), 0 1px 2px rgba(26, 61, 46, 0.04)',
        'preview': '0 8px 24px -6px rgba(26, 61, 46, 0.3), 0 2px 6px -1px rgba(26, 61, 46, 0.15)',
      },
      backgroundImage: {
        'gradient-header': 'linear-gradient(135deg, #1a3d2e 0%, #264d3a 60%, #33664d 100%)',
        'gradient-avatar': 'linear-gradient(135deg, #264d3a 0%, #3f8060 50%, #f4a84b 100%)',
        'gradient-launcher': 'linear-gradient(135deg, #1a3d2e 0%, #264d3a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'message-in': 'messageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'preview-in': 'previewIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
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
        messageIn: {
          '0%': { transform: 'translateY(8px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.85)', opacity: '0.7' },
        },
        previewIn: {
          '0%': { transform: 'translateY(12px) scale(0.92)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
