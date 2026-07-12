import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        app: "430px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          purple: "rgb(var(--color-brand-purple) / <alpha-value>)",
          "purple-light": "rgb(var(--color-brand-purple-light) / <alpha-value>)",
          "purple-dark": "rgb(var(--color-brand-purple-dark) / <alpha-value>)",
          turquoise: "rgb(var(--color-brand-turquoise) / <alpha-value>)",
          "turquoise-light": "rgb(var(--color-brand-turquoise-light) / <alpha-value>)",
          "turquoise-dark": "rgb(var(--color-brand-turquoise-dark) / <alpha-value>)",
          ink: "rgb(var(--color-brand-ink) / <alpha-value>)",
          cream: "rgb(var(--color-brand-cream) / <alpha-value>)",
          mist: "rgb(var(--color-brand-mist) / <alpha-value>)",
          surface: "rgb(var(--color-brand-surface) / <alpha-value>)",
          muted: "rgb(var(--color-brand-muted) / <alpha-value>)",
          bronze: "rgb(var(--color-brand-purple) / <alpha-value>)",
          "bronze-light": "rgb(var(--color-brand-purple-light) / <alpha-value>)",
          "bronze-dark": "rgb(var(--color-brand-purple-dark) / <alpha-value>)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        soft: "var(--shadow-soft)",
        accent: "var(--shadow-accent)",
        bronze: "var(--shadow-accent)",
        premium: "var(--shadow-device)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(var(--color-brand-purple)) 0%, rgb(var(--color-brand-turquoise)) 100%)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
      minHeight: {
        dvh: "100dvh",
      },
      height: {
        dvh: "100dvh",
      },
    },
  },
  plugins: [],
};

export default config;