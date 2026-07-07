import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          bronze: "#9a6b2e",
          ink: "#1c1917",
          cream: "#faf9f7",
          mist: "#f5f4f1",
        },
        tech: {
          bg: "#08080c",
          panel: "#0f1017",
          border: "#1e2030",
          muted: "#6b7280",
          cyan: "#22d3ee",
          green: "#34d399",
          amber: "#fbbf24",
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(34, 211, 238, 0.35)",
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "tech-grid":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;