'use client'

import React, { useState, useEffect } from 'react'
import { X, Train, Send, BookOpen } from 'lucide-react'

export function SlimHeroStrip() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const isDismissed = localStorage.getItem('hc_hero_dismissed') === 'true'
    setDismissed(isDismissed)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('hc_hero_dismissed', 'true')
  }

  if (dismissed) return null

  return (
    <section
      className="relative mb-6 border border-[var(--rule-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 rounded-sm shadow-paper-sm transition-all"
      aria-label="How Habibi City works"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
        aria-label="Dismiss guide"
        title="Dismiss guide"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-brass)] font-semibold">
            Commuter Notice &bull; How it Works
          </span>
          <p className="font-serif italic text-[var(--ink-primary)] text-sm sm:text-base mt-0.5">
            An open, anonymous dispatch wire for city travellers. No accounts, no tracing.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-3 gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--rule-subtle)] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
            <Train className="w-3.5 h-3.5 text-[var(--accent-oxblood)] shrink-0" strokeWidth={1.5} />
            <span className="truncate">1. Pick route</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
            <Send className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" strokeWidth={1.5} />
            <span className="truncate">2. Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-navy)] shrink-0" strokeWidth={1.5} />
            <span className="truncate">3. Read city</span>
          </div>
        </div>
      </div>
    </section>
  )
}
