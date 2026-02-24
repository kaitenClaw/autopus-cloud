/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // AUTOPUS Brand Colors
        autopus: {
          navy: '#2B2D42',
          coral: '#F4845F',
          'coral-hover': '#E0704A',
          cream: '#F5F5F0',
          border: '#E8E8E4',
        },
        // Semantic Colors
        primary: '#2B2D42',
        accent: '#F4845F',
        surface: '#FFFFFF',
        background: '#F5F5F0',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(43, 45, 66, 0.04)',
        'card-hover': '0 4px 12px rgba(43, 45, 66, 0.08)',
        'fab': '0 4px 12px rgba(244, 132, 95, 0.3)',
        'fab-hover': '0 6px 16px rgba(244, 132, 95, 0.4)',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'fab': '16px',
      },
    },
  },
  plugins: [],
}
