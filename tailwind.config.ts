import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f3faf7",
          100: "#d8efe3",
          200: "#b0dfc7",
          300: "#7dcaab",
          400: "#4caf88",
          500: "#318f6c",
          600: "#236d53",
          700: "#1d5642",
          800: "#194536",
          900: "#16392d"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(22, 57, 45, 0.08)"
      }
    }
  },
  plugins: [],
};

export default config;

