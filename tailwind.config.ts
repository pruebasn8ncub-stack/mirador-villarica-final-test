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
        'chat-window': '0 60px 100px -20px rgba(0, 0, 0, 0.55), 0 36px 64px -16px rgba(26, 61, 46, 0.45), 0 16px 32px -8px rgba(26, 61, 46, 0.30), 0 4px 8px -2px rgba(0, 0, 0, 0.20), 0 0 0 1px rgba(26, 61, 46, 0.10)',
        'chat-bubble-user': '0 1px 2px rgba(26, 61, 46, 0.15)',
        'chat-bubble-bot': '0 1px 3px rgba(26, 61, 46, 0.08), 0 1px 2px rgba(26, 61, 46, 0.04)',
        'preview': '0 8px 24px -6px rgba(26, 61, 46, 0.3), 0 2px 6px -1px rgba(26, 61, 46, 0.15)',
        // Cards boutique: 3 niveles (reposo, hover, focus)
        'card': '0 1px 2px rgba(26, 61, 46, 0.04), 0 4px 12px -4px rgba(26, 61, 46, 0.08)',
        'card-hover': '0 2px 4px rgba(26, 61, 46, 0.06), 0 12px 28px -8px rgba(26, 61, 46, 0.14)',
        'card-focus': '0 0 0 3px rgba(244, 168, 75, 0.25)',
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
        // Launcher "attention": breathe + wiggle periódico (8s ciclo)
        'launcher-attention': 'launcherAttention 8s ease-in-out infinite',
        // Burbuja de mensaje flotando suave
        'bubble-float': 'bubbleFloat 3.5s ease-in-out infinite',
        // Halo concéntrico doble (bosque + mostaza)
        'pulse-glow': 'pulseGlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Halo rápido atractor — frecuencia alta capta el ojo periférico
        'halo-quick': 'haloQuick 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        // Launcher attention agresivo — ciclo 5s con saludo pronunciado cada pasada
        'attention-fast': 'attentionFast 5s ease-in-out infinite',
        // Head tilt sutil del avatar Lucía (simula que asiente/saluda)
        'lucia-nod': 'luciaNod 3.5s ease-in-out infinite',
        // Badge "1 mensaje nuevo" con pop inicial + pulse discreto
        'badge-pop': 'badgePop 2.4s ease-in-out infinite',
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
        // Breathe continuo + wiggle al final del ciclo (simula que llama la atención)
        launcherAttention: {
          '0%, 62%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '30%': { transform: 'scale(1.04) rotate(0deg)' },
          '66%': { transform: 'scale(1.05) rotate(-7deg)' },
          '70%': { transform: 'scale(1.05) rotate(7deg)' },
          '74%': { transform: 'scale(1.05) rotate(-4deg)' },
          '78%': { transform: 'scale(1.05) rotate(4deg)' },
          '82%': { transform: 'scale(1) rotate(0deg)' },
        },
        // Burbuja de mensaje flotando suave (translateY + rotación mínima)
        bubbleFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-4px) rotate(-0.5deg)' },
        },
        // Halo concéntrico con dos "capas" de escala
        pulseGlow: {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.45',
            boxShadow: '0 0 0 0 rgba(244, 168, 75, 0.55)',
          },
          '60%': {
            transform: 'scale(1.35)',
            opacity: '0',
            boxShadow: '0 0 0 14px rgba(244, 168, 75, 0)',
          },
          '100%': {
            transform: 'scale(1.35)',
            opacity: '0',
            boxShadow: '0 0 0 14px rgba(244, 168, 75, 0)',
          },
        },
        // Halo rápido atractor (1.6s) — mostaza brillante pulsa más seguido
        haloQuick: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '70%': { transform: 'scale(1.55)', opacity: '0' },
          '100%': { transform: 'scale(1.55)', opacity: '0' },
        },
        // Attention agresivo 5s: breathe continuo + wiggle saludando cada ciclo
        attentionFast: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '18%': { transform: 'scale(1.06) rotate(0deg)' },
          '32%': { transform: 'scale(1.05) rotate(-9deg)' },
          '38%': { transform: 'scale(1.06) rotate(9deg)' },
          '44%': { transform: 'scale(1.05) rotate(-6deg)' },
          '50%': { transform: 'scale(1.06) rotate(6deg)' },
          '56%': { transform: 'scale(1.05) rotate(0deg)' },
          '72%': { transform: 'scale(1) rotate(0deg)' },
        },
        // Head-tilt sutil de Lucía (simula que está "viva")
        luciaNod: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '40%': { transform: 'rotate(-3deg)' },
          '60%': { transform: 'rotate(3deg)' },
          '80%': { transform: 'rotate(-1.5deg)' },
        },
        // Badge unread pulsante suave
        badgePop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
