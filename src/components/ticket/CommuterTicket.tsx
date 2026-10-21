'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getStreak } from '@/lib/streak'
import { Award, Stamp } from 'lucide-react'

export function CommuterTicket() {
  const [streak, setStreak] = useState(0)
  const [milestoneCelebration, setMilestoneCelebration] = useState(false)

  useEffect(() => {
    const current = getStreak()
    setStreak(current)

    // Trigger subtle wax-seal celebration if milestone reached
    if (current === 3 || current === 7 || current === 30) {
      setMilestoneCelebration(true)
      const timer = setTimeout(() => setMilestoneCelebration(false), 3500)
      return () => clearTimeout(timer)
    }
  }, [])

  // 7 slots representing the 7-day commute card cycle
  const currentSlot = streak % 7 === 0 && streak > 0 ? 7 : streak % 7
  const slots = [1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="relative border border-[var(--rule-color)] bg-[var(--surface-card)] p-4 sm:p-5 rounded-sm shadow-paper-sm select-none">
      {/* Wax seal celebration banner */}
      <AnimatePresence>
        {milestoneCelebration && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="mb-3 p-2 bg-[var(--accent-brass)]/10 border border-[var(--accent-brass)] rounded-sm text-center text-xs font-mono text-[var(--accent-brass)]"
          >
            <div className="flex items-center justify-center gap-1.5 font-bold uppercase">
              <Award className="w-4 h-4" />
              <span>Milestone Achieved: {streak}-Day Commuter!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--rule-subtle)] font-mono text-xs">
        <span className="font-bold text-[var(--ink-primary)] tracking-wider uppercase flex items-center gap-1.5">
          <Stamp className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
          Commuter Ticket
        </span>
        <span className="text-[10px] text-[var(--ink-muted)]">
          #{streak > 0 ? `HC-${streak}D` : 'HC-00'}
        </span>
      </div>

      <p className="font-serif italic text-xs text-[var(--ink-secondary)] mb-3 leading-relaxed">
        Post an observation each day to punch your ticket. Miss a day and it resets!
      </p>

      {/* 7-Slot Punch Grid */}
      <div className="grid grid-cols-7 gap-1.5 my-3">
        {slots.map((day) => {
          const isStamped = day <= currentSlot || streak >= 7
          const isCurrent = day === currentSlot

          return (
            <div
              key={day}
              className={`h-11 border border-dashed rounded-sm flex flex-col items-center justify-center relative transition-colors ${
                isStamped
                  ? 'border-[var(--accent-brass)] bg-[var(--accent-brass)]/10 text-[var(--accent-brass)]'
                  : 'border-[var(--rule-dashed)] text-[var(--ink-muted)]'
              }`}
            >
              <span className="font-mono text-[9px] uppercase">D{day}</span>
              {isStamped ? (
                <motion.span
                  initial={isCurrent ? { scale: 1.8, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-serif font-bold text-sm leading-none mt-0.5 text-[var(--accent-brass)]"
                >
                  ※
                </motion.span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--rule-subtle)] mt-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* Ticket Footer */}
      <div className="pt-2 border-t border-[var(--rule-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
        <span>Milestones: 3 &bull; 7 &bull; 30 Days</span>
        <span className="font-bold text-[var(--accent-green)]">
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </span>
      </div>
    </div>
  )
}
