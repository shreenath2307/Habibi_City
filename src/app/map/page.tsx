'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useStationsQuery, useRoutePostsQuery, useRoutesQuery } from '@/lib/queries'
import { Station } from '@/types/database'
import { timeAgo } from '@/lib/status'
import { STATUS_META, getRouteColor } from '@/lib/themeConstants'
import { Compass, MapPin, Navigation, Inbox } from 'lucide-react'

// Dynamic SSR-disabled Leaflet import to prevent window reference issues
const TransitMap = dynamic(() => import('@/components/map/TransitMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[420px] bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm flex flex-col items-center justify-center p-8 text-center">
      <Compass className="w-8 h-8 text-[var(--accent-brass)] animate-spin mb-2" />
      <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)]">
        Rendering Transit Geometry &bull; Please Hold
      </span>
    </div>
  ),
})

export default function MapPage() {
  const { data: stations = [] } = useStationsQuery()
  const { data: posts = [] } = useRoutePostsQuery()
  const { data: routes = [] } = useRoutesQuery()
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  const routesById = useMemo(
    () => Object.fromEntries(routes.map((r) => [r.id, r.name])),
    [routes]
  )

  const stationPosts = useMemo(() => {
    if (!selectedStation) return []
    return posts.filter((p) => p.station_id === selectedStation.id)
  }, [posts, selectedStation])

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-[var(--rule-color)]">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-brass)] font-semibold">
          Network Cartography &bull; Static Waypoints
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink-primary)] mt-1">
          City Station Geometry
        </h2>
        <p className="font-serif italic text-[var(--ink-secondary)] text-sm sm:text-base mt-0.5">
          Select a station platform to inspect recent dispatches from commuters at that stop.
        </p>
      </div>

      {/* Main Map & Left Rail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Station List Rail (4 cols) */}
        <div className="lg:col-span-4 border border-[var(--rule-color)] bg-[var(--surface-card)] p-4 rounded-sm shadow-paper-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--rule-subtle)] font-mono text-xs">
            <span className="font-bold uppercase tracking-wider text-[var(--ink-primary)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
              Stations ({stations.length})
            </span>
            <span className="text-[10px] text-[var(--ink-muted)]">Click to focus</span>
          </div>

          <div className="divide-y divide-[var(--rule-subtle)] max-h-[360px] overflow-y-auto pr-1">
            {stations.map((s) => {
              const isSelected = selectedStation?.id === s.id
              const count = posts.filter((p) => p.station_id === s.id).length

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStation(s)}
                  className={`w-full py-2.5 px-2 flex items-center justify-between text-left rounded-sm transition-colors text-xs font-mono ${
                    isSelected
                      ? 'bg-[var(--surface-elevated)] text-[var(--accent-oxblood)] font-bold ring-1 ring-[var(--accent-brass)]'
                      : 'hover:bg-[var(--surface-tint)] text-[var(--ink-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Navigation
                      className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[var(--accent-oxblood)]' : 'text-[var(--ink-muted)]'}`}
                    />
                    <span className="truncate text-[13px]">{s.name}</span>
                  </div>

                  <span className="text-[10px] text-[var(--ink-muted)] shrink-0 ml-2">
                    {count} {count === 1 ? 'note' : 'notes'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Map Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <TransitMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />
        </div>
      </div>

      {/* Station Arrival Manifest Panel */}
      <section className="border border-[var(--rule-color)] bg-[var(--surface-card)] p-5 sm:p-6 rounded-sm shadow-paper-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--rule-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-oxblood)]" />
            <h3 className="font-display text-xl font-bold text-[var(--ink-primary)]">
              {selectedStation ? `Arrival Manifest &bull; ${selectedStation.name}` : 'Platform Arrival Manifest'}
            </h3>
          </div>
          <span className="font-mono text-xs text-[var(--ink-muted)]">
            {selectedStation ? `${stationPosts.length} dispatches logged` : 'Select a platform on the map'}
          </span>
        </div>

        {!selectedStation ? (
          <div className="py-6 text-center text-sm font-serif italic text-[var(--ink-muted)]">
            Select any station marker on the map or from the list above to read dispatches recorded at that stop.
          </div>
        ) : stationPosts.length === 0 ? (
          <div className="py-6 text-center">
            <Inbox className="w-8 h-8 text-[var(--ink-muted)] mx-auto mb-2 opacity-60" strokeWidth={1.5} />
            <p className="font-serif italic text-sm text-[var(--ink-secondary)]">
              No recent dispatches logged at {selectedStation.name} station.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stationPosts.map((p) => {
              const lineTheme = getRouteColor(p.route_id)
              const meta = STATUS_META[p.emotion || 'clear'] || STATUS_META.clear
              const Icon = meta.icon

              return (
                <div
                  key={p.id}
                  className="p-3.5 bg-[var(--surface-elevated)] border border-[var(--rule-subtle)] rounded-sm space-y-2"
                  style={{ borderLeftWidth: '3px', borderLeftColor: lineTheme.hex }}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold" style={{ color: lineTheme.hex }}>
                        {routesById[p.route_id || ''] || 'Route'}
                      </span>
                      <span
                        style={{ color: meta.color }}
                        className="flex items-center gap-1 px-1.5 py-0.5 border text-[10px] rounded-sm uppercase"
                      >
                        <Icon className="w-2.5 h-2.5" />
                        <span>{meta.label}</span>
                      </span>
                    </div>
                    <span className="text-[var(--ink-muted)] text-[10px]">{timeAgo(p.created_at)}</span>
                  </div>

                  <p className="font-serif text-[15px] text-[var(--ink-primary)] leading-snug">
                    {p.body}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
