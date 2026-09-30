import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102A43",
        ocean: "#126E75",
        canvas: "#F5F7F8",
        line: "#E2E8EC",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-dm-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 36px rgba(16, 42, 67, 0.08)",
      },
    },
  },
  plugins: [forms],
};

export default config;
