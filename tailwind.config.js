/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   // ← This scans all your React files
    "./public/index.html",          // ← Optional but good
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}