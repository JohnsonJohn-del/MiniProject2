/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9edff",
          200: "#bcdfff",
          300: "#8dcbff",
          400: "#59afff",
          500: "#348fff",
          600: "#226de3",
          700: "#1f58c4",
          800: "#20499f",
          900: "#1f417d"
        }
      },
      boxShadow: {
        soft: "0 8px 32px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
