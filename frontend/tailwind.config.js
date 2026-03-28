/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        "loading-bar": {
          "0%":   { width: "0%",   marginLeft: "0%" },
          "50%":  { width: "60%",  marginLeft: "20%" },
          "100%": { width: "0%",   marginLeft: "100%" },
        },
      },
      animation: {
        "loading-bar": "loading-bar 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
