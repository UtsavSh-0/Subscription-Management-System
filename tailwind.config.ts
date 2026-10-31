import type { Config } from "tailwindcss";

const c = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: c("background"),
        foreground: c("foreground"),
        card: c("card"),
        border: c("border"),
        ring: c("ring"),
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
        destructive: c("destructive"),
        success: c("success"),
        warning: c("warning"),
        info: c("info"),
      },
      borderRadius: { sm: "0.375rem", md: "0.5rem", lg: "0.625rem", xl: "0.875rem" },
      boxShadow: {
        card: "0 1px 2px hsl(var(--foreground) / 0.05)",
        pop: "0 10px 28px -8px hsl(var(--foreground) / 0.18), 0 0 0 1px hsl(var(--border))",
      },
      fontFamily: { sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"] },
      keyframes: {
        pop: {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: { pop: "pop 0.12s ease-out" },
    },
  },
  plugins: [],
};
export default config;
