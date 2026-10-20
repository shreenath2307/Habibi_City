import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  configured,
  checkText,
  createLetter,
  fetchLetterCities,
  fetchLetters,
  fetchLikes,
  likePost,
  reportItem,
  timeAgo,
} from '../lib'
import { triggerHaptic } from '../theme'
import { SkylineHero } from '../components/SkylineHero'

function DriftingPaperPlanes() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.12,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ x: -100, y: 150 + i * 220, rotate: 18 }}
          animate={{ x: '110vw', y: 80 + i * 200, rotate: 12 }}
          transition={{
            duration: 18 + i * 7,
            repeat: Infinity,
            delay: i * 6,
            ease: 'linear',
          }}
          style={{ position: 'absolute', fontSize: 28 }}
        >
          ✈
        </motion.div>
      ))}
    </div>
  )
}

function EnvelopeLetterCard({ letter, likeCount, liked, onLike, onReport }) {
  const [open, setOpen] = useState(false)
  const [reported, setReported] = useState(false)

  return (
    <motion.article
      layout
      className="ticket-card mb-3"
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => {
        setOpen((v) => !v)
        triggerHaptic('light')
      }}
    >
      {/* Airmail Envelope Flap Header */}
      <div
        style={{
          background: 'repeating-linear-gradient(45deg, #e63946, #e63946 10px, transparent 10px, transparent 20px, #0057b7 20px, #0057b7 30px, transparent 30px, transparent 40px)',
          height: 6,
          width: '100%',
        }}
      />

      <div style={{ padding: '16px 18px', backgroundColor: 'var(--surface-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="mono-spec"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1.5px solid var(--border-strong)',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: 'var(--bg-canvas-subtle)',
              }}
            >
              TO: {letter.city}
            </span>
            <span className="mono-spec text-muted" style={{ fontSize: 10 }}>
              POSTE RESTANTE
            </span>
          </div>

          <span className="mono-spec text-muted" style={{ fontSize: 11 }}>
            {timeAgo(letter.created_at)}
          </span>
        </div>

        {/* Envelope Preview or Full Unfolded Letter */}
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  padding: '16px',
                  borderRadius: 8,
                  border: '1px dashed var(--border-dashed)',
                  margin: '10px 0 14px',
                }}
              >
                <p
                  className="serif-letter"
                  style={{
                    fontSize: 21,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--ink-primary)',
                  }}
                >
                  "{letter.body}"
                </p>
              </div>
            </motion.div>
          ) : (
            <p
              className="serif-letter"
              style={{
                fontSize: 18,
                margin: '8px 0 10px',
                color: 'var(--ink-secondary)',
                lineHeight: 1.4,
              }}
            >
              {letter.body.length > 90 ? letter.body.slice(0, 88) + '… (Tap to unfold envelope)' : letter.body}
            </p>
          )}
        </AnimatePresence>

        {/* Envelope Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike(letter.id)
              triggerHaptic('medium')
            }}
            className="transit-chip"
            style={{
              borderColor: liked ? 'var(--status-delay)' : 'var(--border-strong)',
              color: liked ? 'var(--status-delay)' : 'inherit',
            }}
          >
            <span>{liked ? '♥' : '♡'}</span>
            <span className="mono-spec">{likeCount}</span>
          </button>

          <span className="mono-spec text-muted" style={{ fontSize: 10 }}>
            {open ? 'FOLD ENVELOPE ▲' : 'UNFOLD LETTER ▼'}
          </span>

          <button
            onClick={async (e) => {
              e.stopPropagation()
              if (!reported) {
                await onReport(letter.id)
                setReported(true)
                triggerHaptic('heavy')
              }
            }}
            style={{
              background: 'transparent',
              border: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: reported ? 'var(--status-delay)' : 'var(--ink-muted)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            disabled={reported}
          >
            {reported ? 'Reported' : 'Report'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export function LettersScreen() {
  const [cities, setCities] = useState([])
  const [city, setCity] = useState('')
  const [letters, setLetters] = useState([])
  const [likes, setLikes] = useState({ counts: {}, mine: new Set() })
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!configured) return
    fetchLetterCities()
      .then((list) => {
        setCities(list)
        setCity((c) => c || list[0] || '')
      })
      .catch((e) => setNotice({ kind: 'abuse', message: e.message }))
  }, [])

  useEffect(() => {
    let ignore = false
    if (!city || !configured) return

    fetchLetters(city)
      .then(async (rows) => {
        if (ignore) return
        setLetters(rows)
        const l = await fetchLikes(rows.map((r) => r.id))
        if (ignore) return
        setLikes(l)
      })
      .catch((e) => {
        if (!ignore) setNotice({ kind: 'abuse', message: e.message })
      })

    return () => {
      ignore = true
    }
  }, [city])

  async function reloadLetters(c) {
    if (!c || !configured) return
    const rows = await fetchLetters(c)
    setLetters(rows)
    const l = await fetchLikes(rows.map((r) => r.id))
    setLikes(l)
  }

  async function onLike(id) {
    await likePost(id)
    setLikes((prev) => {
      if (prev.mine.has(id)) return prev
      const mine = new Set(prev.mine)
      mine.add(id)
      return { counts: { ...prev.counts, [id]: (prev.counts[id] || 0) + 1 }, mine }
    })
  }

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text || !city) return
    const problem = checkText(text)
    if (problem) return setNotice(problem)
    setBusy(true)
    try {
      await createLetter({ body: text, city })
      setBody('')
      setNotice(null)
      await reloadLetters(city)
      triggerHaptic('stamp')
    } catch (err) {
      setNotice({ kind: 'abuse', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DriftingPaperPlanes />

      <SkylineHero
        eyebrow="UNSENT LETTERS"
        title="DEAR CITY, I NEVER"
        italic="sent this"
        sub="Letters written to a city and left here instead. Pick a destination to read its letters."
      />

      {/* Destination Tabs Filter */}
      <div className="filter-rail" aria-label="City destination filter">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCity(c)
              triggerHaptic('light')
            }}
            className={`filter-btn ${city === c ? 'active' : ''}`}
          >
            DEST: {c}
          </button>
        ))}
        {cities.length === 0 && (
          <span className="mono-spec text-muted" style={{ padding: '8px 12px' }}>
            AWAITING DESTINATIONS...
          </span>
        )}
      </div>

      {/* Write Letter Station Box */}
      <div className="transit-card mb-4" style={{ backgroundColor: 'var(--surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="signage-heading" style={{ fontSize: 18 }}>
            LEAVE AN UNSENT LETTER
          </span>
          <span className="mono-spec" style={{ fontSize: 11, color: 'var(--line-persimmon)' }}>
            AIR-MAIL DISPATCH
          </span>
        </div>

        {notice && (
          <div className="transit-notice transit-notice-warning" role="alert">
            <span>⚠️</span>
            <span>{notice.message}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <textarea
            className="transit-textarea serif-letter mb-2"
            rows={3}
            placeholder={city ? `Write a letter to ${city}...` : 'Write an unsent letter to the city...'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ fontSize: 18 }}
          />

          <button
            type="submit"
            className="transit-btn-primary"
            disabled={busy || !body.trim() || !city}
          >
            {busy ? 'POSTING LETTER...' : 'LEAVE THIS LETTER IN THE CITY ✉'}
          </button>
        </form>
      </div>

      {letters.length === 0 && (
        <div className="transit-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✉️</div>
          <div className="signage-heading" style={{ fontSize: 20 }}>
            NO LETTERS LEFT IN {city || 'THIS CITY'} YET
          </div>
          <p className="text-muted small mt-1">
            Be the first commuter to drop an anonymous letter here.
          </p>
        </div>
      )}

      {letters.map((l) => (
        <EnvelopeLetterCard
          key={l.id}
          letter={l}
          likeCount={likes.counts[l.id] || 0}
          liked={likes.mine.has(l.id)}
          onLike={onLike}
          onReport={(id) => reportItem({ postId: id })}
        />
      ))}
    </>
  )
}
