import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#071714",
        tide: "#11463B",
        foam: "#DFF8EF",
        ember: "#FF845E",
        parchment: "#F6F1E8"
      }
    }
  },
  plugins: []
};

export default config;

