import React from 'react'
import { Fleuron } from '@/components/ui/Fleuron'
import { DoubleRule } from '@/components/ui/DoubleRule'
import { ShieldCheck, EyeOff, Flag, HeartHandshake, Compass } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 select-text">
      {/* Editorial Header */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Fleuron variant="branch" />
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-brass)] font-semibold">
            The Broadside Manifesto
          </span>
          <Fleuron variant="branch" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-[var(--ink-primary)] leading-tight">
          About Habibi City
        </h2>
        <p className="font-serif italic text-[var(--ink-secondary)] text-base sm:text-lg mt-1 max-w-xl mx-auto">
          An anonymous, route-by-route community dispatch and living timetable for city commuters.
        </p>
      </div>

      <DoubleRule ornament={true} />

      {/* 1. What the App Is */}
      <section className="space-y-3">
        <h3 className="font-display text-2xl font-bold text-[var(--ink-primary)] flex items-center gap-2">
          <Compass className="w-5 h-5 text-[var(--accent-navy)]" strokeWidth={1.5} />
          <span>I. What is Habibi City?</span>
        </h3>
        <p className="font-serif text-[18px] text-[var(--ink-primary)] leading-relaxed">
          Habibi City is a quiet, non-commercial public dispatch wire. Every day, thousands of commuters ride side-by-side through train corridors, bus routes, and railway stations. Some notice sudden delays or jammed carriages; others witness quiet kindnesses, rainfall against glass, or small shared moments.
        </p>
        <p className="font-serif text-[18px] text-[var(--ink-secondary)] leading-relaxed">
          This broadsheet gives the city a space to speak honestly as it travels &mdash; without algorithmic feeds, ads, or profile pages.
        </p>
      </section>

      {/* 2. The Anonymity & Privacy Promise */}
      <section className="space-y-3 pt-4 border-t border-[var(--rule-subtle)]">
        <h3 className="font-display text-2xl font-bold text-[var(--ink-primary)] flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-[var(--accent-oxblood)]" strokeWidth={1.5} />
          <span>II. The Privacy Promise</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-xs">
          <div className="p-4 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm">
            <strong className="block text-[var(--ink-primary)] uppercase tracking-wider mb-1">
              Zero Accounts or Logins
            </strong>
            <p className="font-serif text-sm text-[var(--ink-secondary)] italic">
              You never create an account, register an email, or connect social media. Anyone may post immediately.
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm">
            <strong className="block text-[var(--ink-primary)] uppercase tracking-wider mb-1">
              No Geolocation / GPS Tracking
            </strong>
            <p className="font-serif text-sm text-[var(--ink-secondary)] italic">
              We never query your device&apos;s GPS coordinates. Route and station tags are selected voluntarily by hand.
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm">
            <strong className="block text-[var(--ink-primary)] uppercase tracking-wider mb-1">
              Local Device Identity
            </strong>
            <p className="font-serif text-sm text-[var(--ink-secondary)] italic">
              Your device generates a random UUID stored solely in your browser&apos;s localStorage to prevent duplicate likes and abuse.
            </p>
          </div>

          <div className="p-4 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm">
            <strong className="block text-[var(--ink-primary)] uppercase tracking-wider mb-1">
              Private Commute Streak
            </strong>
            <p className="font-serif text-sm text-[var(--ink-secondary)] italic">
              Your punch-card streak is tracked locally on your machine. No server ever tracks your daily travel habit.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Community Moderation & 3-Report Rule */}
      <section className="space-y-3 pt-4 border-t border-[var(--rule-subtle)]">
        <h3 className="font-display text-2xl font-bold text-[var(--ink-primary)] flex items-center gap-2">
          <Flag className="w-5 h-5 text-[var(--accent-brass)]" strokeWidth={1.5} />
          <span>III. Community Moderation &amp; Auto-Hide</span>
        </h3>
        <p className="font-serif text-[18px] text-[var(--ink-primary)] leading-relaxed">
          To maintain a dignified, trustworthy, and calm communal ledger:
        </p>
        <ul className="list-disc pl-6 space-y-2 font-serif text-[17px] text-[var(--ink-secondary)]">
          <li>
            <strong>Automated Language Filter:</strong> All incoming dispatches and passenger notes pass through an abusive language filter before transmission.
          </li>
          <li>
            <strong>The Three-Report Threshold:</strong> Any post or note that receives <strong>3 community reports</strong> is immediately hidden from the wire via server-side database triggers.
          </li>
          <li>
            <strong>Single-Report per Device:</strong> Each device may only file one report per item, preventing malicious spam reporting.
          </li>
        </ul>
      </section>

      {/* 4. Crisis Resources */}
      <section className="p-6 border border-[var(--status-delay-border)] bg-[var(--status-delay-bg)] rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-[var(--accent-oxblood)] font-mono text-xs uppercase font-bold tracking-wider">
          <HeartHandshake className="w-4 h-4" />
          <span>IV. Crisis &amp; Mental Health Support</span>
        </div>
        <p className="font-serif text-base text-[var(--ink-primary)] leading-relaxed">
          If you or someone around you is in distress or experiencing a mental health crisis, please reach out to dedicated professionals who care:
        </p>
        <div className="pt-2 font-mono text-xs text-[var(--ink-secondary)] space-y-1">
          <div>&bull; <strong>National Suicide &amp; Crisis Lifeline:</strong> Dial 988 (USA/Canada)</div>
          <div>&bull; <strong>India Tele-MANAS:</strong> Dial 14416 or 1800-891-4416</div>
          <div>&bull; <strong>UK Samaritans:</strong> Dial 116 123</div>
          <div>&bull; Or alert your nearest railway station master / transit safety personnel.</div>
        </div>
      </section>
    </div>
  )
}
