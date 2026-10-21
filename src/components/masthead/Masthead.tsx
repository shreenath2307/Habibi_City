'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { DoubleRule } from '../ui/DoubleRule'

export function Masthead() {
  const dateStr = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  return (
    <header className="pt-4 pb-1 px-4 sm:px-6 max-w-6xl mx-auto w-full select-none" role="banner">
      {/* Top Metadata Gazette Line */}
      <div className="flex flex-wrap items-center justify-between text-xs border-b border-[var(--rule-subtle)] pb-2 mb-3 font-mono text-[var(--ink-secondary)] gap-2">
        <div className="flex items-center gap-2 tracking-widest text-[11px] uppercase">
          <span className="font-semibold text-[var(--ink-primary)]">Vol. VIII</span>
          <span className="opacity-40">•</span>
          <span>Daily Commuter&apos;s Dispatch</span>
        </div>

        <div className="text-[12px] tracking-wider text-[var(--ink-primary)] font-serif italic hidden sm:block">
          {dateStr}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] tracking-widest uppercase opacity-75 hidden md:inline">
            Anonymous &bull; Free of Charge
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Victorian Nameplate */}
      <div className="text-center py-2 relative">
        {/* Subtle engraved railway crest SVG illustration */}
        <div className="mx-auto mb-1 flex justify-center opacity-70 text-[var(--accent-brass)]">
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 18H44M8 18V21M40 18V21M12 18L15 8H33L36 18M18 12H30M24 6V8M16 8V6M32 8V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="24" cy="4" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <Link href="/" className="inline-block group focus-visible:outline-none">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--ink-primary)] leading-none transition-opacity group-hover:opacity-90">
            HABIBI CITY
          </h1>
        </Link>

        <p className="font-display italic text-[var(--ink-secondary)] text-sm sm:text-base mt-2 max-w-xl mx-auto font-normal">
          Notes from the commute &mdash; route-by-route observations, delays, and quiet kindnesses.
        </p>
      </div>

      {/* Broadside Double Rule */}
      <DoubleRule ornament={true} className="my-3" />
    </header>
  )
}
