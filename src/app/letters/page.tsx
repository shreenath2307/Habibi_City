'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  fetchLetterCities,
  fetchLetters,
  fetchLikes,
  likePost,
  reportItem,
  createLetter,
} from '@/lib/supabase'
import { checkText } from '@/lib/moderation'
import { timeAgo } from '@/lib/status'
import { Post, LikesState } from '@/types/database'
import { Mail, Heart, Flag, Check, Send, Plus, X, Stamp } from 'lucide-react'

export default function LettersPage() {
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [letters, setLetters] = useState<Post[]>([])
  const [likes, setLikes] = useState<LikesState>({ counts: {}, mine: new Set() })
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [newCity, setNewCity] = useState('')
  const [newBody, setNewBody] = useState('')
  const [modalNotice, setModalNotice] = useState<string | null>(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Expanded letter IDs for smooth unfolding
  const [unfolded, setUnfolded] = useState<Set<string>>(new Set())
  const [reportedLetters, setReportedLetters] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLetterCities()
      .then((list) => {
        setCities(list)
        if (list.length > 0) {
          setSelectedCity(list[0])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)

    fetchLetters(selectedCity)
      .then(async (rows) => {
        setLetters(rows)
        const l = await fetchLikes(rows.map((r) => r.id))
        setLikes(l)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedCity])

  async function handleLike(id: string) {
    if (likes.mine.has(id)) return
    setLikes((prev) => {
      const nextMine = new Set(prev.mine).add(id)
      return {
        counts: { ...prev.counts, [id]: (prev.counts[id] || 0) + 1 },
        mine: nextMine,
      }
    })
    try {
      await likePost(id)
    } catch {
      // Rollback
      setLikes((prev) => {
        const nextMine = new Set(prev.mine)
        nextMine.delete(id)
        return {
          counts: { ...prev.counts, [id]: Math.max(0, (prev.counts[id] || 1) - 1) },
          mine: nextMine,
        }
      })
    }
  }

  async function handleReport(id: string) {
    if (reportedLetters.has(id)) return
    try {
      await reportItem({ postId: id })
      setReportedLetters((prev) => new Set(prev).add(id))
    } catch {
      // Ignore
    }
  }

  function toggleUnfold(id: string) {
    setUnfolded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreateLetter(e: React.FormEvent) {
    e.preventDefault()
    const text = newBody.trim()
    const city = newCity.trim() || selectedCity
    if (!text || !city) return

    const problem = checkText(text)
    if (problem) {
      setModalNotice(problem.message)
      return
    }

    setModalSubmitting(true)
    setModalNotice(null)
    try {
      await createLetter({ body: text, city })
      setNewBody('')
      setModalOpen(false)

      // Reload
      if (!cities.includes(city)) {
        setCities((prev) => [...prev, city].sort())
      }
      setSelectedCity(city)
      const rows = await fetchLetters(city)
      setLetters(rows)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post letter'
      setModalNotice(msg)
    } finally {
      setModalSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Broadsheet Heading & Write a Letter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--rule-color)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-brass)] font-semibold">
            Poste Restante &bull; The Unsent Archives
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink-primary)] mt-1">
            Letters to the City
          </h2>
          <p className="font-serif italic text-[var(--ink-secondary)] text-sm sm:text-base mt-0.5">
            Words addressed to places and moments, left here instead of being mailed.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-oxblood)] text-white font-mono text-xs uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0 font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Write a letter</span>
        </button>
      </div>

      {/* City Destinations Filter Rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        <span className="text-[var(--ink-muted)] uppercase tracking-wider text-[11px] mr-1 shrink-0">
          Destination:
        </span>
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-3 py-1.5 rounded-sm border shrink-0 transition-colors uppercase ${
              selectedCity === c
                ? 'bg-[var(--ink-primary)] text-[var(--bg-app)] border-[var(--ink-primary)] font-bold'
                : 'border-[var(--rule-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--rule-color)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Letters List */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm animate-pulse"
            />
          ))}
        </div>
      ) : letters.length === 0 ? (
        <div className="border border-[var(--rule-color)] bg-[var(--surface-card)] p-8 text-center rounded-sm">
          <Mail className="w-10 h-10 text-[var(--accent-brass)] mx-auto mb-3 opacity-80" strokeWidth={1.5} />
          <h3 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-1">
            No Letters in {selectedCity || 'this city'} yet
          </h3>
          <p className="font-serif italic text-sm text-[var(--ink-secondary)] mb-4">
            Be the first traveller to leave an unsent letter in this destination archive.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ink-primary)] text-[var(--bg-app)] text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Leave a letter</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const isOpen = unfolded.has(letter.id)
            const isLiked = likes.mine.has(letter.id)
            const count = likes.counts[letter.id] || 0
            const isReported = reportedLetters.has(letter.id)

            return (
              <motion.article
                key={letter.id}
                layout
                onClick={() => toggleUnfold(letter.id)}
                className="border border-[var(--rule-color)] bg-[var(--surface-card)] p-5 sm:p-6 rounded-sm shadow-paper-sm transition-shadow hover:shadow-paper-md cursor-pointer select-text"
              >
                {/* Airmail Stationery Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--rule-subtle)] text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] text-[9px] font-serif font-bold">
                      ※
                    </span>
                    <span className="font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                      To: {letter.city}
                    </span>
                    <span className="text-[10px] text-[var(--ink-muted)] hidden sm:inline">
                      &bull; Poste Restante
                    </span>
                  </div>
                  <span className="text-[var(--ink-muted)]">{timeAgo(letter.created_at)}</span>
                </div>

                {/* Unfolding Letter Body */}
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-[var(--surface-tint)] border border-dashed border-[var(--rule-dashed)] rounded-sm my-2">
                        <p className="font-letter text-xl sm:text-2xl text-[var(--ink-primary)] leading-[1.6] whitespace-pre-wrap drop-cap">
                          {letter.body}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="font-letter text-lg sm:text-xl text-[var(--ink-secondary)] leading-relaxed line-clamp-2 my-2 italic">
                      &ldquo;{letter.body}&rdquo;
                    </p>
                  )}
                </AnimatePresence>

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--rule-subtle)] font-mono text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(letter.id)
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors ${
                      isLiked
                        ? 'bg-[var(--status-delay-bg)] border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
                        : 'border-[var(--rule-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    <span>{count}</span>
                  </button>

                  <span className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">
                    {isOpen ? 'Fold letter ▲' : 'Tap to unfold envelope ▼'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReport(letter.id)
                    }}
                    disabled={isReported}
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--accent-oxblood)] disabled:opacity-50"
                  >
                    {isReported ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Reported</span>
                      </>
                    ) : (
                      <>
                        <Flag className="w-3 h-3" strokeWidth={1.5} />
                        <span>Report</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      {/* Write Letter Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[var(--surface-card)] border-2 border-[var(--rule-color)] rounded-sm shadow-paper-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule-subtle)]">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-[var(--accent-brass)]" />
                <h3 className="font-display text-xl font-bold text-[var(--ink-primary)]">
                  Leave an Unsent Letter
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalNotice && (
              <div className="p-3 bg-[var(--status-delay-bg)] border border-[var(--status-delay-border)] text-[var(--status-delay)] text-xs rounded-sm font-mono">
                {modalNotice}
              </div>
            )}

            <form onSubmit={handleCreateLetter} className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1 font-semibold">
                  Destination City
                </label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder={selectedCity || 'e.g. Mumbai, Delhi, London...'}
                  className="w-full p-2.5 bg-[var(--surface-elevated)] border border-[var(--rule-color)] rounded-sm font-mono text-xs text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] block mb-1 font-semibold">
                  Your Letter to the City
                </label>
                <textarea
                  rows={5}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Dear Mumbai, thank you for the quiet tea stall at dawn..."
                  className="w-full p-3 bg-[var(--surface-elevated)] border border-[var(--rule-color)] rounded-sm font-letter text-xl text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)] leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--rule-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[var(--rule-subtle)] text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-[var(--surface-tint)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting || !newBody.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-oxblood)] text-white text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90 disabled:opacity-50 font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{modalSubmitting ? 'Posting...' : 'Leave letter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
