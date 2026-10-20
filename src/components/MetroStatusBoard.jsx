import { motion } from 'motion/react'
import { getRouteColor, STATUS_META, triggerHaptic } from '../theme'
import { TAG_LABEL } from '../lib'

export function MetroStatusBoard({ routes = [], statuses = {}, routeFilter, onRouteFilter }) {
  return (
    <section className="transit-card mb-4" aria-label="Live Metro Route Status Diagram">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'var(--status-clear)',
              boxShadow: '0 0 8px var(--status-clear)',
            }}
          />
          <h2 className="signage-heading" style={{ fontSize: 22, margin: 0 }}>
            LIVE METRO DIAGRAM
          </h2>
        </div>

        <button
          className={`filter-btn ${routeFilter === 'all' ? 'active' : ''}`}
          style={{ fontSize: 12, padding: '4px 12px' }}
          onClick={() => {
            onRouteFilter('all')
            triggerHaptic('light')
          }}
        >
          ALL LINES
        </button>
      </div>

      {routes.length === 0 ? (
        <p className="text-muted small mb-0">No active lines found on the transit grid.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routes.map((route, idx) => {
            const lineTheme = getRouteColor(route.id, idx)
            const status = statuses[route.id]
            const meta = status ? STATUS_META[status.tag] || STATUS_META.clear : null
            const isSelected = routeFilter === route.id

            return (
              <motion.div
                key={route.id}
                layout
                onClick={() => {
                  onRouteFilter(isSelected ? 'all' : route.id)
                  triggerHaptic('medium')
                }}
                className="interactive"
                style={{
                  position: 'relative',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: isSelected ? `2px solid ${lineTheme.hex}` : '2px solid var(--border-subtle)',
                  background: isSelected ? lineTheme.bg : 'var(--surface-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                {/* Route Header Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        backgroundColor: lineTheme.hex,
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                      }}
                    >
                      L{idx + 1}
                    </span>
                    <span className="signage-heading" style={{ fontSize: 18, color: 'var(--ink-primary)' }}>
                      {route.name}
                    </span>
                  </div>

                  {status ? (
                    <span
                      className="transit-badge"
                      style={{
                        borderColor: meta.color,
                        color: meta.color,
                        background: meta.bg,
                        fontSize: 10,
                      }}
                    >
                      {meta.pulse && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: meta.color,
                            animation: 'pulse-dot 1s infinite ease-in-out',
                          }}
                        />
                      )}
                      {TAG_LABEL[status.tag] || status.tag} ({status.count})
                    </span>
                  ) : (
                    <span className="mono-spec" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                      ALL CLEAR
                    </span>
                  )}
                </div>

                {/* Metro Schematic Track Line */}
                <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                  {/* Colored Line Track */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                    style={{
                      transformOrigin: 'left',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 5,
                      backgroundColor: lineTheme.hex,
                      borderRadius: 3,
                    }}
                  />

                  {/* Station Schematic Nodes */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
                    {[0, 1, 2, 3, 4].map((stnIndex) => {
                      const isAlertNode = status && stnIndex === 2
                      return (
                        <div
                          key={stnIndex}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: `3px solid ${isAlertNode ? meta.color : lineTheme.hex}`,
                            boxShadow: isAlertNode ? `0 0 8px ${meta.color}` : 'none',
                            animation: isAlertNode ? 'pulse-dot 1.2s infinite ease-in-out' : 'none',
                          }}
                        />
                      )
                    })}
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
