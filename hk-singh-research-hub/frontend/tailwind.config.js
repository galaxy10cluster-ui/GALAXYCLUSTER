/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#05070D",
          panel: "#0A0E1A",
          raised: "#0F1424",
          border: "#1B2238",
        },
        ice: {
          DEFAULT: "#00D4FF",
          dim: "#0A8FB8",
          glow: "#7FE8FF",
        },
        terra: {
          DEFAULT: "#FF6B35",
          dim: "#C94F22",
          glow: "#FF9466",
        },
        boundary: "#8B5CF6",
        paper: {
          DEFAULT: "#E8ECF4",
          dim: "#9AA3BC",
          faint: "#5C6480",
        },
        light: {
          bg: "#F7F8FB",
          panel: "#FFFFFF",
          border: "#E2E5EE",
          text: "#0E1320",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, rgba(5,7,13,0.9)), repeating-linear-gradient(0deg, rgba(0,212,255,0.06) 0px, rgba(0,212,255,0.06) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(0,212,255,0.06) 0px, rgba(0,212,255,0.06) 1px, transparent 1px, transparent 48px)",
        "ice-terra-radial":
          "radial-gradient(circle at 30% 20%, rgba(0,212,255,0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,107,53,0.12), transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,212,255,0.25)",
        "glow-terra": "0 0 24px rgba(255,107,53,0.25)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
