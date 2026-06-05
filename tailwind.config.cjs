/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1ab7ef',
        bg: {
          base: '#f5f7fb',
          card: '#ffffff',
        },
        text: {
          primary: '#0f172a',
          muted: '#64748b',
        },
      },
      boxShadow: {
        soft: '0 4px 16px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

