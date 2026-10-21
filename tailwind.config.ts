import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="candlelit"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: 'var(--bg-app)',
          surface: 'var(--surface-card)',
          ink: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          rule: 'var(--rule-color)',
        },
        heritage: {
          oxblood: 'var(--accent-oxblood)',
          green: 'var(--accent-green)',
          navy: 'var(--accent-navy)',
          brass: 'var(--accent-brass)',
          plum: 'var(--accent-plum)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-eb-garamond)', 'Garamond', 'serif'],
        letter: ['var(--font-cormorant)', 'Garamond', 'serif'],
        mono: ['var(--font-courier)', 'Courier Prime', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(31, 26, 20, 0.05)',
        'paper-md': '0 3px 6px -1px rgba(31, 26, 20, 0.07), 0 2px 4px -2px rgba(31, 26, 20, 0.05)',
        'paper-elevated': '0 10px 15px -3px rgba(31, 26, 20, 0.08), 0 4px 6px -4px rgba(31, 26, 20, 0.04)',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}

export default config
