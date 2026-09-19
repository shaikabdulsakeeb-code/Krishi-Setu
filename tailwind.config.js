export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 140s linear infinite',
        'bloom': 'bloom 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
      keyframes: {
        bloom: {
          '0%': { transform: 'scale(0.1)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
