'use client'

import React from 'react'
import { Route } from '@/types/database'
import { Layers, AlertCircle, Eye, X } from 'lucide-react'

interface FilterRailProps {
  categoryFilter: 'all' | 'practical' | 'observation'
  onSelectCategory: (cat: 'all' | 'practical' | 'observation') => void
  routeFilter: string
  onSelectRoute: (id: string) => void
  routes: Route[]
}

export function FilterRail({
  categoryFilter,
  onSelectCategory,
  routeFilter,
  onSelectRoute,
  routes,
}: FilterRailProps) {
  const selectedRoute = routes.find((r) => r.id === routeFilter)
  const hasActiveFilter = categoryFilter !== 'all' || routeFilter !== 'all'

  return (
    <div className="mb-6 space-y-3" role="region" aria-label="Dispatch filters">
      {/* Segmented Category Control */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex p-1 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm text-xs font-mono"
          role="tablist"
        >
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[var(--ink-primary)] text-[var(--bg-app)] font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
            role="tab"
            aria-selected={categoryFilter === 'all'}
          >
            <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="small-caps text-sm tracking-wide">Everything</span>
          </button>

          <button
            onClick={() => onSelectCategory('practical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              categoryFilter === 'practical'
                ? 'bg-[var(--accent-oxblood)] text-white font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
            role="tab"
            aria-selected={categoryFilter === 'practical'}
          >
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="small-caps text-sm tracking-wide">Practical</span>
          </button>

          <button
            onClick={() => onSelectCategory('observation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              categoryFilter === 'observation'
                ? 'bg-[var(--accent-navy)] text-white font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
            role="tab"
            aria-selected={categoryFilter === 'observation'}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="small-caps text-sm tracking-wide">Observations</span>
          </button>
        </div>

        {/* Active Filter Summary with Clear Link */}
        {hasActiveFilter && (
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-secondary)]">
            <span>
              Showing:{' '}
              <strong className="text-[var(--ink-primary)]">
                {selectedRoute ? selectedRoute.name : 'All routes'}{' '}
                {categoryFilter !== 'all' ? `(${categoryFilter})` : ''}
              </strong>
            </span>
            <button
              onClick={() => {
                onSelectCategory('all')
                onSelectRoute('all')
              }}
              className="inline-flex items-center gap-0.5 text-[var(--accent-oxblood)] hover:underline ml-1"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Route Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <button
          onClick={() => onSelectRoute('all')}
          className={`px-2.5 py-1 rounded-sm border shrink-0 transition-colors ${
            routeFilter === 'all'
              ? 'bg-[var(--surface-elevated)] border-[var(--ink-primary)] font-semibold text-[var(--ink-primary)]'
              : 'border-[var(--rule-subtle)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
          }`}
        >
          All routes
        </button>
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelectRoute(r.id)}
            className={`px-2.5 py-1 rounded-sm border shrink-0 transition-colors ${
              routeFilter === r.id
                ? 'bg-[var(--surface-elevated)] border-[var(--ink-primary)] font-semibold text-[var(--ink-primary)]'
                : 'border-[var(--rule-subtle)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  )
}
