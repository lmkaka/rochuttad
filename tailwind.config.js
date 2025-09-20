/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html","./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          brand: {
            50: "#f5f8ff",
            100: "#e9efff",
            500: "#4361ee",
            600: "#3a56d4",
            700: "#2c46b3"
          }
        },
        boxShadow: {
          pretty: "0 8px 30px rgba(0,0,0,0.12)"
        }
      }
    },
    plugins: []
  }
  