/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // ─── Stitch RecoverAI_v2 "Therapeutic Editorial" color tokens ───────────
      colors: {
        // Surface layers (The "No-Line" tonal depth system)
        surface: {
          DEFAULT: "#fdfae7",       // surface — warm sand canvas
          low:     "#f7f4e1",       // surface-container-low — secondary sections
          mid:     "#ece9d6",       // surface-container
          high:    "#e6e3d0",       // surface-container-highest — elevated cards
          dim:     "#dddbc8",       // surface-dim — footer / recessed areas
          white:   "#ffffff",       // surface-container-lowest — max lift (cards)
        },
        // Primary — Sage Green
        primary: {
          DEFAULT:   "#4a654f",     // on-primary-container bg
          container: "#8daa91",     // gradient endpoint, badges
          fixed:     "#cceacf",     // light tint rings
          dim:       "#b0ceb4",     // inverse primary
        },
        // On-surface text (never pure black)
        ink: {
          DEFAULT: "#1c1c11",       // on-surface — primary text
          muted:   "#424842",       // on-surface-variant — muted metadata
        },
        // Tertiary accent — cool blue
        accent: {
          DEFAULT:   "#2b6485",
          container: "#74a9cd",
        },
        // Semantic
        error: {
          DEFAULT:   "#ba1a1a",
          container: "#ffdad6",
        },
        // Outline
        outline: {
          DEFAULT: "#737972",
          variant: "#c2c8c0",       // ghost borders @ 15% opacity max
        },
      },

      fontFamily: {
        heading: ["Manrope", "sans-serif"],   // display-lg, headline-md
        body:    ["Inter", "sans-serif"],     // body-md, title-lg, labels
        mono:    ['"IBM Plex Mono"', "monospace"], // nurse clinical data
      },

      fontSize: {
        "display-lg":  ["3.5rem",  { lineHeight: "1.1", fontWeight: "700" }],
        "headline-md": ["1.75rem", { lineHeight: "1.25", fontWeight: "500" }],
        "title-lg":    ["1.375rem",{ lineHeight: "1.3",  fontWeight: "600" }],
        "body-md":     ["0.875rem",{ lineHeight: "1.6",  fontWeight: "400" }],
        "label-md":    ["0.75rem", { lineHeight: "1.4",  fontWeight: "500" }],
      },

      borderRadius: {
        DEFAULT: "0.5rem",
        lg:  "1rem",    // cards, modals
        xl:  "1.5rem",  // primary cards (Soft Minimalism)
        orb: "9999px",  // perfect circles
      },

      boxShadow: {
        // Ambient only — never hard Material shadows
        ambient: "0px 20px 40px rgba(28, 28, 17, 0.06)",
        orb:     "0 0 32px rgba(74, 101, 79, 0.3)",
        orb_critical: "0 0 32px rgba(186, 26, 26, 0.2)",
      },

      // ─── Micro-animation keyframes (all use transform/opacity only) ──────────
      keyframes: {
        // StatusOrb breathing
        "orb-breathe": {
          "0%, 100%": { transform: "scale(1)",    opacity: "1" },
          "50%":       { transform: "scale(1.05)", opacity: "0.9" },
        },
        // Recording ripple rings
        "ripple-out": {
          "0%":   { transform: "scale(1)",  opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        // Page enter
        "fade-up": {
          "0%":   { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        // Navbar link active indicator
        "slide-in": {
          "0%":   { transform: "scaleX(0)", opacity: "0" },
          "100%": { transform: "scaleX(1)", opacity: "1" },
        },
        // Pill/badge pop
        "pop-in": {
          "0%":   { transform: "scale(0.8)", opacity: "0" },
          "60%":  { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        // Gradient CTA shimmer
        "gradient-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },

      animation: {
        "orb-breathe":    "orb-breathe 2.5s ease-in-out infinite",
        "ripple-out":     "ripple-out 1.5s ease-out infinite",
        "ripple-out-2":   "ripple-out 1.5s ease-out 0.5s infinite",
        "ripple-out-3":   "ripple-out 1.5s ease-out 1.0s infinite",
        "fade-up":        "fade-up 0.35s cubic-bezier(0.2,0,0,1) both",
        "fade-up-delay":  "fade-up 0.35s cubic-bezier(0.2,0,0,1) 0.08s both",
        "pop-in":         "pop-in 0.3s ease-out both",
        "gradient-shift": "gradient-shift 4s ease infinite",
      },
    },
  },
  plugins: [],
};
