/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit", 
  darkMode: "class", 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", 
        secondary: "#9333EA", 
        backgroundLight: "#F3F4F6", 
        backgroundDark: "#1F2937", 
      },
    },
  },
  plugins: [],
};
