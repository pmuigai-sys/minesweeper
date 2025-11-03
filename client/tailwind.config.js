/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kabarak: {
          blue: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
          accent: '#7C3AED',
          emerald: '#10B981',
        },
        background: '#0F172A',
      },
      fontFamily: {
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 10px 30px rgba(30, 64, 175, 0.25)',
      },
    },
  },
  plugins: [],
}

