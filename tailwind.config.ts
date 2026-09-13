import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#EAF1EC",
          100: "#CFE1D6",
          200: "#A3C6AF",
          300: "#77AA88",
          400: "#4C8F65",
          500: "#2E6E48",
          600: "#235939",
          700: "#1B4530",
          800: "#153726",
          900: "#0F291C",
          DEFAULT: "#1B4530",
        },
        navy: {
          50: "#EAEEF2",
          100: "#CBD5DF",
          200: "#9FB2C4",
          300: "#748FA9",
          400: "#4A6D8E",
          500: "#2F5372",
          600: "#213E58",
          700: "#182E42",
          800: "#11212F",
          900: "#0B151F",
          DEFAULT: "#182E42",
        },
        cream: {
          50: "#FDFBF6",
          100: "#FAF4E9",
          200: "#F3E9D3",
          300: "#EADCB8",
          400: "#DEC994",
          500: "#CBB06B",
          600: "#AF9152",
          700: "#8C7340",
          800: "#695532",
          900: "#473924",
          DEFAULT: "#FAF4E9",
        },
        orange: {
          50: "#FDF1EA",
          100: "#FAE0CC",
          200: "#F3BD97",
          300: "#EA9760",
          400: "#DE7638",
          500: "#C4622D",
          600: "#A34F23",
          700: "#7F3D1B",
          800: "#5C2C14",
          900: "#3B1C0C",
          DEFAULT: "#C4622D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        "display-ur": ["var(--font-display-ur)", "serif"],
        "body-ur": ["var(--font-body-ur)", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(15, 41, 28, 0.12)",
        "card-lg": "0 12px 40px -8px rgba(15, 41, 28, 0.18)",
      },
      borderRadius: {
        card: "1rem",
      },
      backgroundImage: {
        "forest-gradient": "linear-gradient(135deg, #1B4530 0%, #0F291C 100%)",
        "navy-gradient": "linear-gradient(135deg, #182E42 0%, #0B151F 100%)",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
