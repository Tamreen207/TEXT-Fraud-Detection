import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",

        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        // Semantic Colors for Risk Levels
        safe: {
          DEFAULT: "var(--safe)",
          foreground: "var(--safe-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)",
        "glow-xl":
          "0 0 40px rgba(59, 130, 246, 0.7), 0 0 80px rgba(168, 85, 247, 0.4)",
        "glow-2xl":
          "0 0 60px rgba(59, 130, 246, 0.8), 0 0 120px rgba(168, 85, 247, 0.5)",
        "glow-danger":
          "0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3)",
        "glow-warning":
          "0 0 30px rgba(217, 119, 6, 0.6), 0 0 60px rgba(217, 119, 6, 0.3)",
        "glow-safe":
          "0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.3)",
        "neon-blue":
          "0 0 20px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.5)",
        "neon-purple":
          "0 0 20px rgba(168, 85, 247, 1), 0 0 40px rgba(168, 85, 247, 0.5)",
        "neon-pink":
          "0 0 20px rgba(236, 72, 153, 1), 0 0 40px rgba(236, 72, 153, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-in-out",
        "slide-in": "slide-in 0.6s ease-in-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-right": "slide-right 0.5s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.8)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 0 15px rgba(59, 130, 246, 0)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-30px)" },
        },
        glow: {
          "0%, 100%": {
            textShadow:
              "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)",
          },
          "50%": {
            textShadow:
              "0 0 40px rgba(59, 130, 246, 0.9), 0 0 60px rgba(168, 85, 247, 0.5)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))",
          },
          "50%": {
            opacity: "0.8",
            filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))",
          },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(20px)" },
          "50%": { opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "gradient-shift": {
          "0%": { transform: "translate(0%, 0%)" },
          "25%": { transform: "translate(-20%, 10%)" },
          "50%": { transform: "translate(-10%, -20%)" },
          "75%": { transform: "translate(10%, -10%)" },
          "100%": { transform: "translate(0%, 0%)" },
        },
      },
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
  plugins: [],
};
export default config;
