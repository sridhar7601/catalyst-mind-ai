/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        tremor: {
          brand: {
            faint: "#ede9fe",
            muted: "#c4b5fd",
            subtle: "#a78bfa",
            DEFAULT: "#7c3aed",
            emphasis: "#6d28d9",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f5f3ff",
            subtle: "#ede9fe",
            DEFAULT: "#ffffff",
            emphasis: "#f5f3ff",
          },
          border: {
            DEFAULT: "#e9d5ff",
          },
          ring: {
            DEFAULT: "#7c3aed",
          },
          content: {
            subtle: "#6b7280",
            DEFAULT: "#4b5563",
            emphasis: "#1f2937",
            strong: "#111827",
            inverted: "#ffffff",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      boxShadow: {
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "data-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "data-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "data-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|violet|purple|blue|emerald|amber|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require("tailwindcss-animate")],
}
