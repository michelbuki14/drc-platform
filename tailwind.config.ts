import type { Config } from "tailwindcss";

declare module "tailwindcss" {
  interface TailwindColors {
    cc: {
      blue:  {
        50: string; 100: string; 200: string; 300: string; 400: string;
        500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
      };
      gold:  {
        50: string; 100: string; 200: string; 300: string; 400: string; 500: string;
      };
      emerald: {
        50: string; 100: string; 200: string; 300: string; 400: string;
        500: string; 600: string; 700: string;
      };
      charcoal: {
        50: string; 100: string; 200: string; 300: string; 400: string;
        500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
      };
    };
  }
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CongoConnect design tokens — source of truth
        cc: {
          blue: {
            50:   "#EBF0FA",
            100:  "#C5D3EE",
            200:  "#93ABD5",
            300:  "#6183B8",
            400:  "#3E629B",
            500:  "#0B2545",   /* PRIMARY */
            600:  "#081E38",
            700:  "#081A33",
            800:  "#07152A",
            900:  "#060F1F",
            950:  "#040914",
          },
          gold: {
            50:   "#FBF6E8",
            100:  "#F5E7C7",
            200:  "#E8CE7A",
            300:  "#D4AF37",
            400:  "#B89620",
            500:  "#8E6D14",
          },
          emerald: {
            50:   "#E8F3EC",
            100:  "#C3D9C9",
            200:  "#9AC09E",
            300:  "#6A976F",
            400:  "#3E6E45",
            500:  "#1B4D2E",
            600:  "#143B22",
            700:  "#0F2A18",
          },
          charcoal: {
            50:   "#F7F6F4",
            100:  "#EFEDEA",
            200:  "#E2DFD9",
            300:  "#C9C5BC",
            400:  "#A3A09A",
            500:  "#7D7A74",
            600:  "#5C5A54",
            700:  "#4A4844",
            800:  "#2D2B28",
            900:  "#1A1A18",
            950:  "#0F0F0E",
          },
        },
        // Semantic aliases (backwards-compatible with existing code)
        brand: {
          DEFAULT: "#0B2545",
          light:  "#E8F0FB",
          dark:   "#081A33",
          navy:   "#060F1F",
        },
        emerald: {
          DEFAULT: "#1B4D2E",
          deep:   "#043927",
          mid:    "#0a5c40",
          light:  "#C3D9C9",
        },
        gold: {
          DEFAULT: "#D4AF37",
          soft:   "#E8CE7A",
        },
        royal: "#002366",
        charcoal: {
          DEFAULT: "#1A1A2E",
          light:  "#4A4A68",
        },
        offwhite: "#F9F9F7",
        cream: "#FAF8F3",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans:   ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:   ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "card":       "0 2px 12px rgba(11,37,69,0.08)",
        "float":      "0 10px 32px rgba(11,37,69,0.12)",
        "elevated":   "0 16px 48px rgba(11,37,69,0.14), 0 8px 16px rgba(11,37,69,0.07)",
        "glow":       "0 0 20px rgba(212,175,55,0.15)",
        "card-hover": "0 8px 24px rgba(11,37,69,0.10), 0 4px 8px rgba(11,37,69,0.04)",
      },
      borderRadius: {
        "none":   "0",
        "sm":     "0.375rem",
        "DEFAULT":"0.5rem",
        "md":     "0.5rem",
        "lg":     "0.75rem",
        "xl":     "1rem",
        "2xl":    "1.5rem",
        "3xl":    "2rem",
        "full":   "9999px",
      },
      spacing: {
        "header":      "68px",
        "mobile-nav":  "72px",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
      animation: {
        "fade-in":     "fade-in 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-up":     "fade-up 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-down":   "fade-down 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":    "scale-in 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left":  "slide-in-left 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right": "slide-in-right 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        "float":       "float 4s ease-in-out infinite",
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
        "spin-slow":   "spin-slow 8s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(212,175,55,0.1)" },
        },
        "spin-slow": {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" },
        },
      },
      transitionTimingFunction: {
        "out-expo":  "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "spring":    "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth":    "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "fast":   "150ms",
        "base":   "250ms",
        "slow":   "400ms",
        "slower": "600ms",
        "enter":  "350ms",
      },
    },
  },
  plugins: [],
};

export default config;
