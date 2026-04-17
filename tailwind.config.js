/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['"Bricolage Grotesque"', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FF5A5F',
          dark:    '#CC3A3F',
          light:   '#FFF0F0',
          50:      '#FFF5F5',
          100:     '#FFE0E1',
          500:     '#FF5A5F',
          600:     '#E63E43',
          700:     '#CC3A3F',
        },
        surface: {
          DEFAULT: '#FAFAF9',
          card:    '#FFFFFF',
          border:  'rgba(0,0,0,0.08)',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'slide-in':  'slideIn 0.35s ease forwards',
        'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}
