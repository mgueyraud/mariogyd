import type { Config } from "tailwindcss"

const config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["ui-monospace", '"SF Mono"', "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // Design system palette (warm paper / ink)
        paper: "#FCFCFA",
        ink: "#1C1C1A",
        subtle: "#75756E",
        faint: "#97978F",
        line: "#ECECE5",
        "line-strong": "#C9C9C0",
        hover: "#F4F4EE",
        // shadcn tokens — only what components/ui/{button,switch} reference.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config