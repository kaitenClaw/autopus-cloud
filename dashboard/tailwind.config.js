/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fira Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        indigo: {
          500: '#6366F1',
          600: '#4F46E5',
        },
        emerald: {
          500: '#10B981',
        },
      },
    },
  },
  plugins: [],
}
