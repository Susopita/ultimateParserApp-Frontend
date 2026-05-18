import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'var(--bg-page)',
          card: 'var(--bg-card)',
          'card-solid': 'var(--bg-card-solid)',
          elevated: 'var(--bg-elevated)',
          input: 'var(--bg-input)',
          surface: 'var(--bg-surface)',
        },
        content: {
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
          4: 'var(--text-4)',
          muted: 'var(--text-muted)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          transparent: 'var(--color-primary-transparent)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          transparent: 'var(--color-secondary-transparent)',
        },
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 15px var(--glow-primary)',
        'glow-primary-hover': '0 8px 20px -8px var(--glow-primary)',
      }
    }
  },

  plugins: [require("@tailwindcss/typography")]
} as Config;
