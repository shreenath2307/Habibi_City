import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { triggerHaptic } from '../theme'

export function PunchCardStreak({ streak = 0, activeTab = 'feed' }) {
  const [expanded, setExpanded] = useState(false)
  const [prevTab, setPrevTab] = useState(activeTab)
  const prevStreakRef = useRef(streak)
  const canvasRef = useRef(null)
  const animIdRef = useRef(null)

  // Auto-close dropdown when switching tabs during render
  if (prevTab !== activeTab) {
    setPrevTab(activeTab)
    setExpanded(false)
  }

  const triggerCelebration = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Risograph ink confetti particles
    const colors = ['#0057b7', '#00875a', '#e85d04', '#7b2cbf', '#d62288', '#facc15']
    const particles = Array.from({ length: 65 }).map(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    }))

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.4 // gravity
        p.rotation += p.vRot
        p.alpha -= 0.012

        if (p.alpha > 0) {
          alive = true
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
          ctx.restore()
        }
      })

      if (alive) {
        animIdRef.current = requestAnimationFrame(update)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animIdRef.current = requestAnimationFrame(update)
  }, [])

  useEffect(() => {
    if (streak > prevStreakRef.current && (streak === 3 || streak === 7 || streak === 30)) {
      triggerCelebration()
      triggerHaptic('heavy')
    }
    prevStreakRef.current = streak
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
    }
  }, [streak, triggerCelebration])

  const cardContainerRef = useRef(null)

  useEffect(() => {
    if (!expanded) return
    function handleClickOutside(e) {
      if (cardContainerRef.current && !cardContainerRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expanded])

  // 7 slots representing the 7-day commute card cycle
  const currentSlot = streak % 7 === 0 && streak > 0 ? 7 : streak % 7
  const slots = [1, 2, 3, 4, 5, 6, 7]

  return (
    <>
      {/* Celebration overlay canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />

      <div ref={cardContainerRef} style={{ position: 'relative' }}>
        <button
          className="brand-station-tag"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--ink-primary)',
            color: 'var(--bg-canvas)',
            border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-riso-sm)',
          }}
          onClick={() => {
            setExpanded((v) => !v)
            triggerHaptic('light')
          }}
          aria-expanded={expanded}
          aria-label="Commute streak punch card"
        >
          <span style={{ color: '#facc15' }}>★</span>
          <span>STREAK: {streak} {streak === 1 ? 'DAY' : 'DAYS'}</span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>{expanded ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="ticket-card mt-2"
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                zIndex: 1050,
                width: '310px',
                padding: '16px',
                background: 'var(--surface-elevated)',
              }}
            >
              {/* Punch Hole on Ticket */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '2px solid var(--border-strong)',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span className="signage-heading" style={{ fontSize: 16, letterSpacing: '0.05em' }}>
                  COMMUTE STAMP CARD
                </span>
                <span className="mono-spec" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                  #HC-{streak}P
                </span>
              </div>

              <p style={{ fontSize: 12, margin: '0 0 12px', color: 'var(--ink-secondary)', lineHeight: 1.35 }}>
                Post an observation each commute to punch your card. Miss a day and it resets!
              </p>

              {/* 7-Day Punch Slots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, margin: '10px 0' }}>
                {slots.map((day) => {
                  const isStamped = day <= currentSlot || streak >= 7
                  const isCurrent = day === currentSlot

                  return (
                    <div
                      key={day}
                      style={{
                        height: 44,
                        border: '2px dashed var(--border-dashed)',
                        borderRadius: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundColor: isStamped ? 'rgba(0, 87, 183, 0.08)' : 'transparent',
                      }}
                    >
                      <span className="mono-spec" style={{ fontSize: 9, color: 'var(--ink-muted)' }}>
                        D{day}
                      </span>
                      {isStamped ? (
                        <motion.span
                          initial={isCurrent ? { scale: 2.2, rotate: -25, opacity: 0 } : false}
                          animate={{ scale: 1, rotate: (day % 3 - 1) * 12, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-signage)',
                            fontWeight: 800,
                            fontSize: 16,
                            color: 'var(--line-persimmon)',
                            lineHeight: 1,
                          }}
                        >
                          ✦
                        </motion.span>
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--border-subtle)' }} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="ticket-perforation" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-spec" style={{ fontSize: 11, fontWeight: 700 }}>
                  MILESTONES: 3D • 7D • 30D
                </span>
                <span
                  className="transit-badge"
                  style={{
                    fontSize: 10,
                    borderColor: 'var(--line-jade)',
                    color: 'var(--line-jade)',
                  }}
                >
                  VALID
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
