import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Naval submarine theme
        hull: {
          50: '#f0f4f8',
          100: '#d4dce8',
          200: '#b8c4d0',
          300: '#9cacb8',
          400: '#8094a0',
          500: '#647c88',
          600: '#4a5d66',
          700: '#314044',
          800: '#1a2834', // Main border color
          900: '#0f1a24', // Card background
          950: '#090e12', // Main background
        },
        // Phosphor amber accents
        amber: {
          50: '#fdf8e8',
          100: '#faefd0',
          200: '#f5dfa1',
          300: '#efca72',
          400: '#e9b543',
          500: '#c89828', // Main accent
          600: '#b5881f',
          700: '#956916',
          800: '#754a0d',
          900: '#553b04',
        },
        // Status colors for naval theme
        success: '#48986a',
        warning: '#c09838', 
        danger: '#c07060',
        // Text colors
        navy: {
          50: '#e8f0f8',  // Primary text
          100: '#d0e1f0',
          200: '#b8d2e8',
          300: '#a0c3e0',
          400: '#88b4d8',
          500: '#70a5d0',
          600: '#5896c8',
          700: '#4087c0',
          800: '#2878b8',
          900: '#1069b0',
        },
        // Muted colors
        muted: {
          100: '#7a8a9a', // Secondary text
          200: '#5a6a7a', 
          300: '#4a5a6a',
          400: '#3a4a5a',
          500: '#2a3a4a',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['15px', '22px'],
        'lg': ['17px', '24px'],
        'xl': ['19px', '26px'],
        '2xl': ['22px', '28px'],
        '3xl': ['26px', '32px'],
        '4xl': ['32px', '38px'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(200, 152, 40, 0.3)' 
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(200, 152, 40, 0.5)' 
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          },
        },
      },
      boxShadow: {
        'naval': '0 0 20px rgba(200, 152, 40, 0.3)',
        'naval-lg': '0 0 40px rgba(200, 152, 40, 0.4)',
        'inset-naval': 'inset 0 2px 4px rgba(200, 152, 40, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
