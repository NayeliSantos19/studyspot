/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#232019",
        paper: "#F7F4EE",
        accent: "#2C4A31",
        accentLight: "#E8EFE6",
        muted: "#847C6B",
        gold: "#C08A2E",
        coral: "#D97757",
        coralLight: "#FBE8DF",
        sky: "#3E7C8C",
        skyLight: "#E1EFF2",
        sun: "#E0A83E",
        sunLight: "#FBF1DC",
      },
    },
  },
  plugins: [],
};
