/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit", //  Just-In-Time Compiler (más rápido)
  darkMode: "class", //  Habilitar modo oscuro con clases
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Azul moderno
        secondary: "#9333EA", // Púrpura vibrante
        backgroundLight: "#F3F4F6", // Fondo claro
        backgroundDark: "#1F2937", // Fondo oscuro
      },
    },
  },
  plugins: [],
};
