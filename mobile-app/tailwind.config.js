/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#09120F",
        pine: "#0F3D33",
        mint: "#A4F3D8",
        jade: "#1D6F5F",
        sand: "#F6EFE6",
        coral: "#FF7A59",
        steel: "#7B8B85",
        slate: "#1E2C28"
      },
      fontFamily: {
        sans: ["System"]
      },
      boxShadow: {
        soft: "0px 10px 30px rgba(7, 21, 17, 0.12)"
      }
    }
  },
  plugins: []
};

