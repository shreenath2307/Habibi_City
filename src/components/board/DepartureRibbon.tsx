'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Pause, Play } from 'lucide-react'
import { Post } from '@/types/database'
import { STATUS_META } from '@/lib/themeConstants'
import { timeAgo } from '@/lib/status'

interface DepartureRibbonProps {
  posts: Post[]
}

export function DepartureRibbon({ posts }: DepartureRibbonProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo(() => {
    return posts.slice(0, 8)
  }, [posts])

  useEffect(() => {
    if (isPaused || items.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 4200)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

  if (items.length === 0) {
    return (
      <div
        className="w-full bg-[var(--surface-card)] border-y border-[var(--rule-color)] py-2 px-3 text-xs font-mono text-[var(--ink-secondary)] flex items-center justify-between"
        role="region"
        aria-label="Live departure wire"
      >
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-[var(--accent-brass)] text-white text-[10px] font-bold rounded-sm tracking-widest">
            WIRE
          </span>
          <span className="italic">Track monitor active &bull; Awaiting commuter reports</span>
        </div>
      </div>
    )
  }

  const current = items[activeIndex]
  const meta = STATUS_META[current?.emotion || 'clear'] || STATUS_META.clear

  return (
    <div
      className="w-full bg-[var(--surface-card)] border-y border-[var(--rule-color)] py-2 px-3 text-xs font-mono text-[var(--ink-primary)] flex items-center justify-between mb-6 shadow-paper-sm"
      role="region"
      aria-label="Live departure wire"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="px-1.5 py-0.5 bg-[var(--ink-primary)] text-[var(--bg-app)] text-[10px] font-bold rounded-sm tracking-wider uppercase shrink-0">
          DISPATCH
        </span>

        {/* Split-flap tick container */}
        <div className="overflow-hidden h-5 flex items-center">
          <div
            key={current.id}
            className="flex items-center gap-2 truncate animate-fadeIn"
          >
            <span
              style={{ color: meta.color }}
              className="font-bold shrink-0 tracking-wider text-[11px]"
            >
              [{meta.code}]
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md md:max-w-xl text-[var(--ink-primary)]">
              {current.body}
            </span>
            <span className="text-[var(--ink-muted)] text-[11px] shrink-0">
              &bull; {timeAgo(current.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-[10px] text-[var(--ink-muted)] hidden sm:inline">
          {activeIndex + 1}/{items.length}
        </span>
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
          aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
          title={isPaused ? 'Resume ticker' : 'Pause ticker'}
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 text-[var(--accent-green)]" strokeWidth={1.5} />
          ) : (
            <Pause className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  )
}
