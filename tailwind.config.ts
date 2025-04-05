import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'bandada-gold': '#D4AF37',
        'bandada-gold-light': '#F4D77D',
        'bandada-gold-dark': '#9A7D1A',
        'bandada-black': '#0A0A0A',
        'bandada-black-light': '#1A1A1A',
        'bandada-black-dark': '#050505',
        'bandada-gray': '#2A2A2A',
        'bandada-gray-light': '#3A3A3A',
        'bandada-gray-dark': '#1A1A1A',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
      }
    }
  },
  plugins: []
}
export default config
