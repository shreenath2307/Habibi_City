'use client'

import React from 'react'
import { Sun, Flame } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded border border-[var(--rule-subtle)] opacity-50" />
    )
  }

  const isCandlelit = theme === 'candlelit'

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider font-mono border border-[var(--rule-color)] rounded-sm bg-[var(--surface-card)] hover:bg-[var(--surface-tint)] text-[var(--ink-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)]"
      aria-label={isCandlelit ? 'Switch to aged paper theme' : 'Switch to candlelit dark theme'}
      title={isCandlelit ? 'Switch to Paper (light)' : 'Switch to Candlelit (dark)'}
    >
      {isCandlelit ? (
        <>
          <Flame className="w-3.5 h-3.5 text-[var(--accent-brass)]" strokeWidth={1.5} />
          <span className="small-caps text-[11px]">Candlelit</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-[var(--accent-brass)]" strokeWidth={1.5} />
          <span className="small-caps text-[11px]">Paper</span>
        </>
      )}
    </button>
  )
}
