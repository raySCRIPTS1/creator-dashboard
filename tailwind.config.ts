import type { Config } from 'tailwindcss'

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        border: token('border'),
        foreground: token('foreground'),
        muted: token('muted'),
        accent: token('accent'),
        'accent-strong': token('accent-strong'),
        positive: token('positive'),
        negative: token('negative'),
        ring: token('ring'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
