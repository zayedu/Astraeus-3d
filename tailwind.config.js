/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        rbc: {
          blue: "#005DAA",
          yellow: "#FFD200",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        float: "float 15s ease-in-out infinite",
        "float-delayed": "float 18s ease-in-out infinite 3s",
        "float-slow": "float 20s ease-in-out infinite 6s",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
          "25%": { transform: "translate(30px, -30px) scale(1.05) rotate(1deg)" },
          "50%": { transform: "translate(-20px, 20px) scale(0.95) rotate(-1deg)" },
          "75%": { transform: "translate(25px, 15px) scale(1.02) rotate(0.5deg)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 210, 0, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 210, 0, 0.6)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
