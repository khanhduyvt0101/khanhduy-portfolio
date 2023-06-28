/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryPage: "rgb(39, 50, 62)",
        secondaryPage: "rgb(33, 37, 41)",
      },
    },
    fontFamily: {
      primary: "Roboto",
    },
  },
  plugins: [],
};
