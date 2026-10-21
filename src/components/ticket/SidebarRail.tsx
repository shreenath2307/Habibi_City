'use client'

import React from 'react'
import Link from 'next/link'
import { CommuterTicket } from './CommuterTicket'
import { ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react'

export function SidebarRail() {
  return (
    <aside className="space-y-6 md:sticky md:top-6" aria-label="Commuter sidebar">
      {/* 1. Commuter Punch Card */}
      <CommuterTicket />

      {/* 2. Crisis & Safety Note */}
      <div className="border border-[var(--rule-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 rounded-sm shadow-paper-sm">
        <div className="flex items-center gap-2 mb-2 text-[var(--accent-oxblood)] font-mono text-xs uppercase font-semibold">
          <HeartHandshake className="w-4 h-4" strokeWidth={1.5} />
          <span>Care & Safety</span>
        </div>
        <p className="font-serif italic text-xs text-[var(--ink-secondary)] leading-relaxed mb-2">
          If your journey feels heavy today, you are never alone. Helplines and compassionate listeners are available at every hour.
        </p>
        <span className="font-mono text-[10px] text-[var(--ink-muted)] block">
          National Crisis Line &bull; Dial 988 or local transit security.
        </span>
      </div>

      {/* 3. About Broadside Link */}
      <div className="border border-[var(--rule-subtle)] bg-[var(--surface-tint)] p-4 rounded-sm">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-[var(--ink-primary)] mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-navy)]" strokeWidth={1.5} />
          <span>The Broadside Promise</span>
        </div>
        <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-3">
          No accounts, no user tracing, local random device identifiers only. Read our full pledge to city travellers.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent-oxblood)] hover:underline font-semibold"
        >
          <span>Read About Habibi City</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  )
}
