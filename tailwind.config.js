/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        script: ["Dancing Script", "cursive"],
      },
      colors: {
        rbc: {
          blue: "#005DAA", // Official RBC Blue
          yellow: "#FFD200", // Official RBC Yellow
          white: "#FFFFFF", // Official RBC White
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        float: "float 20s ease-in-out infinite",
        "float-delayed": "float 25s ease-in-out infinite 5s",
        "float-slow": "float 30s ease-in-out infinite 10s",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "pulse-rbc": "pulse-rbc 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "25%": { transform: "translate(20px, -15px) scale(1.02)" },
          "50%": { transform: "translate(-15px, 10px) scale(0.98)" },
          "75%": { transform: "translate(10px, -5px) scale(1.01)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-rbc": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            lineHeight: "1.7",
          },
        },
      },
    },
  },
  plugins: [],
}
