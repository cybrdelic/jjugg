/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 20s infinite alternate',
        'float-reverse': 'float 25s infinite alternate-reverse',
        'pulse': 'pulse 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
      },
      backdropBlur: {
        'md': 'var(--blur-amount, 20px)',
      },
    },
  },
  plugins: [],
}
