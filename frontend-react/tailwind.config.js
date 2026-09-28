/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary accent — driven by CSS variables with alpha support.
        // Uses rgb(var(--color-accent-rgb) / <alpha-value>) so opacity modifiers
        // like bg-accent/10 or focus:ring-accent/20 work correctly.
        accent: {
          DEFAULT: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover-rgb) / <alpha-value>)',
          glow: 'rgb(var(--color-accent-glow-rgb) / <alpha-value>)',
        },
        // Semantic colors — driven by CSS variables so dark mode can override
        success: {
          DEFAULT: 'rgb(var(--color-success-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-success-hover-rgb) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-warning-hover-rgb) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-danger-hover-rgb) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-info-hover-rgb) / <alpha-value>)',
        },
        // Extended palette — all non-blue/indigo/violet. Map to semantic
        // variables so the existing `amber`/`emerald`/`rose` Tailwind classes
        // resolve to themed values (no forbidden blue/indigo/purple exposed).
        amber: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
        emerald: 'rgb(var(--color-success-rgb) / <alpha-value>)',
        rose: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
        teal: 'rgb(var(--color-info-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-slow': 'float 25s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeSlideUp 0.6s ease-out forwards',
        'fade-right': 'fadeSlideRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(5deg)' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
