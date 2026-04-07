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
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--accent-primary)",
          foreground: "var(--btn-primary-text)",
        },
      },
      boxShadow: {
        soft: "0 20px 80px rgba(0,0,0,0.24)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(245,158,11,0.12), transparent 35%), radial-gradient(circle at top right, rgba(234,88,12,0.12), transparent 35%), radial-gradient(circle at bottom center, rgba(251,191,36,0.08), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;
