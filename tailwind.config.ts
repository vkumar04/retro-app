import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        "terminal-green": "var(--terminal-green)",
        "terminal-amber": "var(--terminal-amber)",
        "terminal-red": "var(--terminal-red)",
        "terminal-cyan": "var(--terminal-cyan)",
        "terminal-glow": "var(--terminal-glow)",
      },
    },
  },
  plugins: [],
}

export default config
