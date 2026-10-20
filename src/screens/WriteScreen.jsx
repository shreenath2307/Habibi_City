import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  PRACTICAL_TAGS,
  OBSERVATION_TAGS,
  TAG_LABEL,
  bumpStreak,
  checkText,
  createRoutePost,
} from '../lib'
import { STATUS_META, triggerHaptic } from '../theme'
import { SkylineHero } from '../components/SkylineHero'

export function WriteScreen({ routes, stations, onPosted }) {
  const [body, setBody] = useState('')
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const routeId = selectedRouteId || routes[0]?.id || ''
  const [stationId, setStationId] = useState('')
  const [category, setCategory] = useState('practical')
  const [tag, setTag] = useState(PRACTICAL_TAGS[0])
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ejecting, setEjecting] = useState(false)

  function switchCategory(next) {
    setCategory(next)
    setTag(next === 'practical' ? PRACTICAL_TAGS[0] : OBSERVATION_TAGS[0])
    triggerHaptic('light')
  }

  const tags = category === 'practical' ? PRACTICAL_TAGS : OBSERVATION_TAGS
  const currentMeta = STATUS_META[tag] || STATUS_META.clear

  const maxChars = 280
  const charsLeft = maxChars - body.length
  const charProgress = Math.min(1, body.length / maxChars)

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text || !routeId) return
    const problem = checkText(text)
    if (problem) return setNotice(problem)

    setBusy(true)
    try {
      await createRoutePost({ body: text, routeId, stationId, category, emotion: tag })
      // Trigger ticket printing ejection animation
      setEjecting(true)
      triggerHaptic('stamp')

      setTimeout(() => {
        if (category === 'observation') onPosted(bumpStreak())
        else onPosted(null)
      }, 700)
    } catch (err) {
      setNotice({ kind: 'abuse', message: err.message })
      setBusy(false)
    }
  }

  return (
    <>
      <SkylineHero
        eyebrow="POST TO YOUR ROUTE"
        title="SAY IT AS YOU"
        italic="ride"
        sub="A delay, a kindness, a small moment. Anonymous, no account, nothing stored about you."
      />

      <AnimatePresence>
        {ejecting ? (
          <motion.div
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -150, opacity: 0, scale: 0.85, rotate: -4 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="transit-card"
            style={{
              padding: '30px',
              textAlign: 'center',
              backgroundColor: 'var(--surface-elevated)',
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 10 }}>🎫</div>
            <div className="signage-heading" style={{ fontSize: 24 }}>
              DISPATCHING TO ROUTE TICKET...
            </div>
            <p className="mono-spec text-muted" style={{ fontSize: 12 }}>
              PRINTING ANONYMOUS COMMUTE RECORD
            </p>
          </motion.div>
        ) : (
          <form
            className="transit-card"
            onSubmit={submit}
            style={{
              backgroundColor: currentMeta.bg,
              borderColor: currentMeta.border,
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            {notice && (
              <div
                className={`transit-notice ${
                  notice.kind === 'crisis' ? 'transit-notice-warning' : 'transit-notice-danger'
                }`}
                role="alert"
              >
                <span>⚠️</span>
                <span>{notice.message}</span>
              </div>
            )}

            {/* Category Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                backgroundColor: 'rgba(18, 19, 22, 0.08)',
                padding: 4,
                borderRadius: 'var(--radius-pill)',
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                className={`filter-btn ${category === 'practical' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                onClick={() => switchCategory('practical')}
              >
                ⚡ PRACTICAL DISPATCH
              </button>
              <button
                type="button"
                className={`filter-btn ${category === 'observation' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                onClick={() => switchCategory('observation')}
              >
                ✦ OBSERVATION / VIBE
              </button>
            </div>

            {/* Tactile Sticker Chips */}
            <div style={{ marginBottom: 14 }}>
              <label className="mono-spec text-muted d-block mb-1" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                Select Sticker Tag:
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((t) => {
                  const meta = STATUS_META[t] || STATUS_META.clear
                  const isSelected = tag === t

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTag(t)
                        triggerHaptic('light')
                      }}
                      className="transit-chip"
                      style={{
                        transform: isSelected ? 'scale(1.05) rotate(-1deg)' : 'scale(1)',
                        borderColor: isSelected ? meta.color : 'var(--border-strong)',
                        backgroundColor: isSelected ? meta.color : 'var(--surface-card)',
                        color: isSelected ? '#ffffff' : 'var(--ink-primary)',
                        boxShadow: isSelected ? 'var(--shadow-riso-sm)' : 'none',
                      }}
                    >
                      <span>{isSelected ? '●' : '○'}</span>
                      <span className="mono-spec">{TAG_LABEL[t] || t}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Post Content Textarea */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <textarea
                className="transit-textarea"
                rows={4}
                maxLength={maxChars}
                placeholder="What's happening on this route right now?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{
                  backgroundColor: 'var(--surface-card)',
                  resize: 'vertical',
                }}
              />

              {/* Circular Character Counter Progress Gauge */}
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={charsLeft < 20 ? 'var(--status-delay)' : currentMeta.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${charProgress * 100}, 100`}
                  />
                </svg>
                <span className="mono-spec" style={{ fontSize: 10, color: charsLeft < 20 ? 'var(--status-delay)' : 'var(--ink-muted)' }}>
                  {charsLeft}
                </span>
              </div>
            </div>

            {/* Route & Optional Station Selectors */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="mono-spec d-block mb-1 text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                  Transit Route
                </label>
                <select
                  className="transit-select"
                  value={routeId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6">
                <label className="mono-spec d-block mb-1 text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                  Station (Optional)
                </label>
                <select
                  className="transit-select"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                >
                  <option value="">No station</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="transit-btn-primary"
              disabled={busy || !body.trim()}
              style={{
                backgroundColor: 'var(--ink-primary)',
                color: 'var(--bg-canvas)',
              }}
            >
              {busy ? 'DISPATCHING...' : 'DISPATCH ANONYMOUSLY ↵'}
            </button>
          </form>
        )}
      </AnimatePresence>
    </>
  )
}
