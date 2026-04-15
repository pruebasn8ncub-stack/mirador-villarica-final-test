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
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
    },
  },
  plugins: [],
};

export default config;
