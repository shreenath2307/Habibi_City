'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Route, RouteStatus } from '@/types/database'
import { getRouteColor, STATUS_META } from '@/lib/themeConstants'
import { TAG_LABEL } from '@/lib/moderation'

interface LineConditionsProps {
  routes: Route[]
  statuses: Record<string, RouteStatus>
  selectedRouteId: string
  onSelectRoute: (id: string) => void
}

export function LineConditions({
  routes,
  statuses,
  selectedRouteId,
  onSelectRoute,
}: LineConditionsProps) {
  return (
    <section
      className="mb-6 border border-[var(--rule-color)] bg-[var(--surface-card)] p-4 sm:p-5 rounded-sm shadow-paper-sm select-none"
      aria-label="Route conditions timetable"
    >
      {/* Header with Title and All Lines button */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--rule-subtle)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-brass)]" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--ink-primary)] tracking-tight">
            Line Conditions
          </h2>
          <span className="font-mono text-[11px] text-[var(--ink-muted)] hidden sm:inline">
            &bull; Past 60 Minutes
          </span>
        </div>

        <button
          onClick={() => onSelectRoute('all')}
          className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors border ${
            selectedRouteId === 'all'
              ? 'bg-[var(--ink-primary)] text-[var(--bg-app)] border-[var(--ink-primary)] font-semibold'
              : 'border-[var(--rule-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--rule-color)]'
          }`}
        >
          All lines
        </button>
      </div>

      {routes.length === 0 ? (
        <p className="font-serif italic text-sm text-[var(--ink-secondary)] py-4 text-center">
          No transit routes registered on the network timetable.
        </p>
      ) : (
        <div className="divide-y divide-[var(--rule-subtle)]">
          {routes.map((route, idx) => {
            const lineTheme = getRouteColor(route.id, idx)
            const status = statuses[route.id]
            const meta = status ? STATUS_META[status.tag] || STATUS_META.clear : STATUS_META.clear
            const Icon = meta.icon
            const isSelected = selectedRouteId === route.id

            return (
              <motion.div
                key={route.id}
                onClick={() => onSelectRoute(isSelected ? 'all' : route.id)}
                className={`py-3 px-2 sm:px-3 flex items-center justify-between cursor-pointer rounded-sm transition-all ${
                  isSelected
                    ? 'bg-[var(--surface-elevated)] ring-1 ring-[var(--accent-brass)] shadow-paper-sm'
                    : 'hover:bg-[var(--surface-tint)]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectRoute(isSelected ? 'all' : route.id)
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`Route ${route.name}, status ${status ? meta.label : 'All clear'}`}
              >
                {/* Left: Line Code + Route Name + Timetable Track */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span
                    style={{ backgroundColor: lineTheme.hex }}
                    className="font-mono text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shrink-0 uppercase tracking-widest"
                  >
                    L{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <span className="font-display text-base sm:text-lg font-bold text-[var(--ink-primary)] block truncate">
                      {route.name}
                    </span>
                    {/* Timetable Track Dots */}
                    <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                      {[0, 1, 2, 3].map((dot) => (
                        <span
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: dot === 0 ? lineTheme.hex : 'var(--rule-subtle)',
                          }}
                        />
                      ))}
                      <span className="text-[10px] font-mono text-[var(--ink-muted)] ml-1">
                        Waypoints active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge with distinct icon shape + report count */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    style={{
                      borderColor: meta.borderColor,
                      color: meta.color,
                      backgroundColor: meta.bgColor,
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 border rounded-sm text-xs font-mono font-medium"
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="uppercase text-[11px] tracking-wider">
                      {TAG_LABEL[status?.tag || 'clear'] || 'All clear'}
                    </span>
                    {status && status.count > 0 && (
                      <span className="font-bold opacity-80">({status.count})</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
