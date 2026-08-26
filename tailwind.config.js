/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0B132B',
        'charcoal-navy': '#1C2541',
        'neon-lime': '#CAFF00',
        'bright-blue': '#3A86FF',
        'white': '#F8F9FA',
        'light-gray': '#A0AEC0',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
