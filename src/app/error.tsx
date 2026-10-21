'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Transit dispatch interruption:', error)
  }, [error])

  return (
    <div className="w-full py-16 px-4 text-center max-w-md mx-auto">
      <div className="border border-[var(--accent-oxblood)] bg-[var(--surface-card)] p-6 rounded-sm shadow-paper-md">
        <h2 className="font-display text-2xl font-bold text-[var(--accent-oxblood)] mb-2">
          Service Disruption
        </h2>
        <p className="text-sm text-[var(--ink-secondary)] mb-4">
          An unexpected interruption occurred on the line. We apologise for the transit delay.
        </p>
        <button
          onClick={() => reset()}
          type="button"
          className="px-4 py-2 bg-[var(--ink-primary)] text-[var(--bg-app)] text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
        >
          Signal Clear &bull; Try Again
        </button>
      </div>
    </div>
  )
}
