/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        anam: {
          blue: '#004AAD',
          cyan: '#29B6F6',
          orange: '#F59E0B',
          dark: '#333333',
          gray: '#6E6E6E',
        }
      }
    },
  },
  plugins: [],
}
