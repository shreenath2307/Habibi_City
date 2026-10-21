import React from 'react'
import Link from 'next/link'
import { Fleuron } from '@/components/ui/Fleuron'
import { DoubleRule } from '@/components/ui/DoubleRule'
import { ArrowRight, PenTool, Compass, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Front Page Headline Banner */}
      <section className="bg-[var(--surface-card)] border border-[var(--rule-color)] p-6 sm:p-8 rounded-sm shadow-paper-sm text-center relative overflow-hidden">
        <div className="absolute top-3 left-4 font-mono text-[10px] uppercase text-[var(--ink-muted)] tracking-widest">
          Dispatch Notice No. 104
        </div>
        <div className="absolute top-3 right-4 font-mono text-[10px] uppercase text-[var(--ink-muted)] tracking-widest">
          Network Status: Clear
        </div>

        <div className="max-w-2xl mx-auto pt-4 pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Fleuron variant="branch" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-brass)]">
              Broadsheet Edition
            </span>
            <Fleuron variant="branch" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink-primary)] leading-tight mb-4">
            The Living Ledger of the City&apos;s Journeys
          </h2>

          <p className="text-lg text-[var(--ink-secondary)] font-serif italic mb-6 leading-relaxed">
            &ldquo;Every morning we board in silence, carrying our private worlds through iron tunnels and over rain-swept bridges.&rdquo;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-oxblood)] text-white text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Dispatch a report</span>
            </Link>

            <Link
              href="/letters"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--rule-color)] bg-[var(--surface-elevated)] text-[var(--ink-primary)] text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-[var(--surface-tint)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Read unsent letters</span>
            </Link>

            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--rule-color)] bg-[var(--surface-elevated)] text-[var(--ink-primary)] text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-[var(--surface-tint)] transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Station map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Overview 3-Column Broadside Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <article className="border border-[var(--rule-subtle)] bg-[var(--surface-card)] p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs uppercase text-[var(--accent-navy)] font-semibold mb-2 tracking-wider">
              I. Route Dispatch
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-2">
              Timetable Conditions
            </h3>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              Real-time dispatches tagged to city transit lines. Delays, crowding levels, and track conditions logged anonymously without accounts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--rule-subtle)] flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
            <span>60-Min Window</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </article>

        <article className="border border-[var(--rule-subtle)] bg-[var(--surface-card)] p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs uppercase text-[var(--accent-green)] font-semibold mb-2 tracking-wider">
              II. Commuter Punch Card
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-2">
              Consecutive Streaks
            </h3>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              Post an observation during your journey to stamp your physical transit card. Reach milestones at 3, 7, and 30 days of commuter loyalty.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--rule-subtle)] flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
            <span>Local Record</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </article>

        <article className="border border-[var(--rule-subtle)] bg-[var(--surface-card)] p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs uppercase text-[var(--accent-brass)] font-semibold mb-2 tracking-wider">
              III. Unsent Letters
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-2">
              Words Left Behind
            </h3>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              Quiet notes written to the city itself. Folded stationery envelopes addressed to Mumbai, Delhi, and beyond, waiting to be unfolded.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--rule-subtle)] flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
            <span>Poste Restante</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </article>
      </div>
    </div>
  )
}
