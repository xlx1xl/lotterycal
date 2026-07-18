/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        base: {
          900: "#070A0F",
          850: "#0B0F14",
          800: "#11161D",
          750: "#161C25",
          700: "#1C232E",
          600: "#272F3C",
          500: "#3A4453",
        },
        accent: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        danger: {
          DEFAULT: "#EF4444",
          400: "#F87171",
          600: "#DC2626",
        },
        warn: {
          DEFAULT: "#F59E0B",
          400: "#FBBF24",
        },
        ink: {
          50: "#E6EDF3",
          400: "#9BA6B4",
          500: "#8B949E",
          600: "#6E7681",
        },
      },
      fontFamily: {
        display: ['"Archivo"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(16,185,129,0.25), 0 8px 30px rgba(16,185,129,0.12)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
