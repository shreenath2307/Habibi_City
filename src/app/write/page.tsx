'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useRoutesQuery, useStationsQuery } from '@/lib/queries'
import { createRoutePost } from '@/lib/supabase'
import { checkText, PRACTICAL_TAGS, OBSERVATION_TAGS, TAG_LABEL } from '@/lib/moderation'
import { bumpStreak } from '@/lib/streak'
import { STATUS_META, getRouteColor } from '@/lib/themeConstants'
import { ModerationResult } from '@/types/database'
import { Send, Stamp, AlertTriangle, Eye, AlertCircle } from 'lucide-react'

export default function WritePage() {
  const router = useRouter()
  const { data: routes = [] } = useRoutesQuery()
  const { data: stations = [] } = useStationsQuery()

  const [category, setCategory] = useState<'practical' | 'observation'>('practical')
  const [tag, setTag] = useState<string>(PRACTICAL_TAGS[0])
  const [body, setBody] = useState('')
  const [routeId, setRouteId] = useState('')
  const [stationId, setStationId] = useState('')
  const [notice, setNotice] = useState<ModerationResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stamped, setStamped] = useState(false)

  const selectedRouteId = routeId || routes[0]?.id || ''
  const selectedRoute = routes.find((r) => r.id === selectedRouteId)
  const selectedStation = stations.find((s) => s.id === stationId)

  const tags = category === 'practical' ? PRACTICAL_TAGS : OBSERVATION_TAGS
  const meta = STATUS_META[tag] || STATUS_META.clear
  const lineTheme = getRouteColor(selectedRouteId)
  const charsLeft = 280 - body.length

  function handleCategoryChange(cat: 'practical' | 'observation') {
    setCategory(cat)
    setTag(cat === 'practical' ? PRACTICAL_TAGS[0] : OBSERVATION_TAGS[0])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text || !selectedRouteId) return

    const problem = checkText(text)
    if (problem) {
      setNotice(problem)
      return
    }

    setSubmitting(true)
    setNotice(null)
    try {
      await createRoutePost({
        body: text,
        routeId: selectedRouteId,
        stationId: stationId || null,
        category,
        emotion: tag,
      })

      if (category === 'observation') {
        bumpStreak()
      }

      setStamped(true)
      setTimeout(() => {
        router.push('/')
      }, 1600)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch report'
      setNotice({ kind: 'abuse', message: msg })
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-brass)] font-semibold">
          Dispatch Station &bull; Anonymous Wire
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink-primary)] mt-1">
          Broadcast to Your Route
        </h2>
        <p className="font-serif italic text-[var(--ink-secondary)] text-sm sm:text-base mt-1">
          A delay, crowded carriage, or small act of kindness. No accounts or tracking.
        </p>
      </div>

      <AnimatePresence>
        {stamped ? (
          /* Stamped Franked Postcard Success Animation */
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="border-2 border-[var(--accent-brass)] bg-[var(--surface-card)] p-8 sm:p-12 text-center rounded-sm shadow-paper-elevated"
          >
            <div className="w-16 h-16 border-2 border-[var(--accent-brass)] text-[var(--accent-brass)] rounded-full flex items-center justify-center mx-auto mb-4 rotate-[-6deg]">
              <Stamp className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] mb-2">
              Dispatch Franked &amp; Transmitted
            </h3>
            <p className="font-serif italic text-sm text-[var(--ink-secondary)] max-w-sm mx-auto mb-4">
              Your commute note has been posted to the public wire. Returning to the timetable...
            </p>
            <span className="font-mono text-xs text-[var(--accent-green)] font-semibold uppercase tracking-wider">
              &bull; RECORDED ANONYMOUSLY &bull;
            </span>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-7 border border-[var(--rule-color)] bg-[var(--surface-card)] p-5 sm:p-6 rounded-sm shadow-paper-sm space-y-5"
            >
              {/* Supportive Moderation Notices */}
              {notice && (
                <div
                  className={`p-4 rounded-sm text-xs font-mono border flex items-start gap-3 ${
                    notice.kind === 'crisis'
                      ? 'bg-[var(--status-delay-bg)] border-[var(--status-delay-border)] text-[var(--ink-primary)]'
                      : 'bg-[var(--status-crowd-bg)] border-[var(--status-crowd-border)] text-[var(--status-crowd)]'
                  }`}
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-oxblood)]" />
                  <div>
                    <strong className="block mb-1 uppercase tracking-wider">
                      {notice.kind === 'crisis' ? 'Care & Support Notice' : 'Editorial Guideline'}
                    </strong>
                    <p className="font-serif text-sm italic">{notice.message}</p>
                  </div>
                </div>
              )}

              {/* 1. Category Switcher */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1.5 font-semibold">
                  1. Dispatch Classification
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-tint)] border border-[var(--rule-subtle)] rounded-sm font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('practical')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm transition-colors ${
                      category === 'practical'
                        ? 'bg-[var(--accent-oxblood)] text-white font-bold'
                        : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="small-caps text-sm tracking-wide">Practical Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('observation')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm transition-colors ${
                      category === 'observation'
                        ? 'bg-[var(--accent-navy)] text-white font-bold'
                        : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="small-caps text-sm tracking-wide">Commute Vibe</span>
                  </button>
                </div>
              </div>

              {/* 2. Tactile Sticker Chips */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1.5 font-semibold">
                  2. Transit Condition Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const tagMeta = STATUS_META[t] || STATUS_META.clear
                    const Icon = tagMeta.icon
                    const isSelected = tag === t

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        style={{
                          borderColor: isSelected ? tagMeta.borderColor : 'var(--rule-subtle)',
                          backgroundColor: isSelected ? tagMeta.bgColor : 'var(--surface-elevated)',
                          color: isSelected ? tagMeta.color : 'var(--ink-secondary)',
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-xs font-mono transition-all ${
                          isSelected ? 'font-bold ring-1 ring-current' : 'hover:border-[var(--rule-color)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="uppercase tracking-wider">{TAG_LABEL[t] || t}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Text Area with 280-char counter */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] font-semibold">
                    3. Your Observation
                  </label>
                  <span
                    className={`font-mono text-xs ${
                      charsLeft < 20 ? 'text-[var(--accent-oxblood)] font-bold' : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {charsLeft} chars remaining
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={280}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What is happening on this route right now? A delay, a quiet kindness, a crowded carriage..."
                  className="w-full p-3 bg-[var(--surface-elevated)] border border-[var(--rule-color)] rounded-sm font-serif text-[17px] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)] resize-y leading-relaxed"
                />
              </div>

              {/* 4. Route and Station Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1 font-semibold">
                    4. Transit Route
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--rule-color)] rounded-sm font-mono text-xs text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1 font-semibold">
                    Station (Optional)
                  </label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="w-full p-2 bg-[var(--surface-elevated)] border border-[var(--rule-color)] rounded-sm font-mono text-xs text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
                  >
                    <option value="">No specific station</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !body.trim() || !selectedRouteId}
                className="w-full py-3 px-4 bg-[var(--ink-primary)] text-[var(--bg-app)] font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting to wire...' : 'Transmit report anonymously'}</span>
              </button>
            </form>

            {/* Desktop Live Preview Card (5 cols) */}
            <div className="hidden lg:block lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--ink-muted)] block font-semibold">
                Live Timetable Card Preview
              </span>

              <div
                className="bg-[var(--surface-card)] border border-[var(--rule-color)] p-5 rounded-sm shadow-paper-md"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: lineTheme.hex,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: lineTheme.hex, borderColor: lineTheme.hex }}
                      className="font-mono text-xs font-bold border px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[var(--surface-tint)]"
                    >
                      {selectedRoute?.name || 'Route'}
                    </span>
                    <span
                      style={{ color: meta.color, borderColor: meta.borderColor, backgroundColor: meta.bgColor }}
                      className="font-mono text-[11px] border px-2 py-0.5 rounded-sm uppercase"
                    >
                      {TAG_LABEL[tag] || tag}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--ink-muted)]">Just now</span>
                </div>

                <p className="font-serif text-[18px] text-[var(--ink-primary)] leading-relaxed mb-4 italic min-h-[56px] whitespace-pre-wrap">
                  {body || 'Your dispatch preview will appear here as you write...'}
                </p>

                {selectedStation && (
                  <div className="text-xs font-mono text-[var(--ink-secondary)] pt-2 border-t border-[var(--rule-subtle)]">
                    Station: <strong>{selectedStation.name}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
