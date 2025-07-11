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
        cosmic: {
          void: "#0f0f23",
          glass: "rgba(0, 93, 170, 0.1)",
          border: "rgba(255, 255, 255, 0.1)",
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
            muted: "rgba(255, 255, 255, 0.5)",
          },
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "cosmic-drift": "cosmic-drift 25s ease-in-out infinite",
        "cosmic-drift-reverse": "cosmic-drift-reverse 30s ease-in-out infinite",
        "cosmic-pulse": "cosmic-pulse 20s ease-in-out infinite",
        "orbital-slow": "orbital-rotation 40s linear infinite",
        "orbital-fast": "orbital-rotation 15s linear infinite",
        "pulse-cosmic": "pulse-cosmic 2s ease-in-out infinite",
        "cosmic-bounce": "cosmic-bounce 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "starfield-drift": "starfield-drift 60s linear infinite",
        "cosmic-particles-float": "cosmic-particles-float 45s ease-in-out infinite",
      },
      keyframes: {
        "cosmic-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "25%": { transform: "translate(30px, -20px) scale(1.05)" },
          "50%": { transform: "translate(-20px, 15px) scale(0.95)" },
          "75%": { transform: "translate(15px, -10px) scale(1.02)" },
        },
        "cosmic-drift-reverse": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
          "25%": { transform: "translate(-25px, 20px) scale(0.98) rotate(90deg)" },
          "50%": { transform: "translate(20px, -15px) scale(1.03) rotate(180deg)" },
          "75%": { transform: "translate(-15px, 10px) scale(0.99) rotate(270deg)" },
        },
        "cosmic-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.1)", opacity: "0.6" },
        },
        "orbital-rotation": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-cosmic": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.1)" },
        },
        "cosmic-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "starfield-drift": {
          "0%": { transform: "translateX(0) translateY(0)" },
          "100%": { transform: "translateX(-400px) translateY(-200px)" },
        },
        "cosmic-particles-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-20px) rotate(90deg)" },
          "50%": { transform: "translateY(0) rotate(180deg)" },
          "75%": { transform: "translateY(-10px) rotate(270deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      typography: {
        cosmic: {
          css: {
            maxWidth: "none",
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: "1.7",
          },
        },
      },
    },
  },
  plugins: [],
}
