import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        espresso: "#130d0a",
        ristretto: "#090706",
        mocha: "#2b1b14",
        crema: "#f4ead7",
        oat: "#cdbd9f",
        brass: "#c89d55",
        copper: "#9c5f38",
        slatebean: "#161514"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 44px rgba(200, 157, 85, 0.18)",
        bean: "0 28px 80px rgba(0, 0, 0, 0.55)"
      }
    }
  },
  plugins: []
};

export default config;
