import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aeris: {
          navy: {
            DEFAULT: "#0B2F56",
            dark: "#061B33",
            surface: "#08223F",
            card: "#0F3B6A",
            border: "#164E85",
            borderLight: "#1E5E9E",
          },
          cerulean: {
            DEFAULT: "#087693",
            dark: "#065E77",
            light: "#1298BB",
            tint: "#E6F3F7",
          },
          turquoise: {
            DEFAULT: "#11D8CC",
            bright: "#17EADB",
            dark: "#0EAFA5",
            tint: "#E8FBF9",
          },
          midnight: "#061B33",
          surface: "#08223F",
          card: "#0F3B6A",
          border: "#164E85",
          borderLight: "#1E5E9E",
          offwhite: "#F5F8FB",
          cyan: {
            DEFAULT: "#11D8CC",
            bright: "#17EADB",
            aqua: "#11D8CC",
            deep: "#087693",
            dark: "#065E77",
          },
          teal: {
            DEFAULT: "#087693",
            light: "#1298BB",
            bright: "#11D8CC",
            dark: "#065E77",
          },
          blue: {
            DEFAULT: "#0B2F56",
            light: "#164E85",
            dark: "#061B33",
          },
          amber: {
            DEFAULT: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          red: {
            DEFAULT: "#DC2626",
            light: "#EF4444",
            dark: "#B91C1C",
          },
          green: {
            DEFAULT: "#10B981",
            light: "#34D399",
            dark: "#059669",
          },
          slateText: "#94A3B8",
          mutedText: "#64748B",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
