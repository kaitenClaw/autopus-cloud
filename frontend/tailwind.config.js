/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0d',
        sidebar: '#171717',
        chat: '#212121',
        border: '#303030',
        accent: '#3b82f6',
      }
    },
  },
  plugins: [],
}
