import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getRouteColor, STATUS_META, triggerHaptic } from '../theme'
import { TAG_LABEL, timeAgo } from '../lib'

export function PostCard({
  post,
  routeName,
  likeCount = 0,
  liked = false,
  comments = [],
  onLike,
  onComment,
  onReport,
  onReportComment,
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [reported, setReported] = useState(false)
  const [heartBurst, setHeartBurst] = useState(false)
  const lastTapRef = useRef(0)
  const cardRef = useRef(null)

  const lineTheme = getRouteColor(post.route_id)
  const statusMeta = STATUS_META[post.emotion] || STATUS_META.clear

  // Card spotlight on pointer hover (desktop only)
  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--spotlight-x', `${x}px`)
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`)
  }

  // Double tap to like with heart burst
  function handleCardTouch() {
    const now = Date.now()
    if (now - lastTapRef.current < 320) {
      triggerLike()
    }
    lastTapRef.current = now
  }

  function triggerLike() {
    if (!liked) {
      onLike(post.id)
      triggerHaptic('medium')
    }
    setHeartBurst(true)
    setTimeout(() => setHeartBurst(false), 850)
  }

  async function submitComment(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    const problem = await onComment(post.id, body)
    if (problem) return setErr(problem)
    setErr('')
    setText('')
    triggerHaptic('light')
  }

  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      {/* Background Revealed Report Action for Swipe */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 90,
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--status-delay)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-signage)',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
        onClick={async () => {
          if (!reported) {
            await onReport({ postId: post.id })
            setReported(true)
            triggerHaptic('heavy')
          }
        }}
      >
        {reported ? 'REPORTED' : 'REPORT ⚑'}
      </div>

      {/* Main Draggable Post Card */}
      <motion.article
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: -85, right: 0 }}
        dragElastic={0.12}
        onMouseMove={handleMouseMove}
        onClick={handleCardTouch}
        className="transit-card"
        style={{
          marginBottom: 0,
          paddingLeft: 20,
          position: 'relative',
          backgroundColor: 'var(--surface-card)',
          background: `radial-gradient(400px circle at var(--spotlight-x, -500px) var(--spotlight-y, -500px), rgba(0, 87, 183, 0.05), transparent 70%), var(--surface-card)`,
        }}
      >
        {/* Line-colored spine */}
        <div
          className="transit-card-spine"
          style={{ backgroundColor: lineTheme.hex }}
        />

        {/* Heart Burst Particle Effect */}
        <AnimatePresence>
          {heartBurst && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0, y: 0 }}
              animate={{ scale: [0.5, 1.4, 1.2], opacity: [0, 1, 0], y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 48,
                color: 'var(--status-delay)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              ♥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {routeName && (
            <span
              className="mono-spec"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: lineTheme.hex,
                border: `1.5px solid ${lineTheme.hex}`,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              {routeName}
            </span>
          )}

          {post.emotion && (
            <span
              className="transit-badge"
              style={{
                borderColor: statusMeta.color,
                color: statusMeta.color,
                background: statusMeta.bg,
                fontSize: 10,
              }}
            >
              {TAG_LABEL[post.emotion] || post.emotion}
            </span>
          )}

          <span
            className="mono-spec ms-auto"
            style={{ fontSize: 11, color: 'var(--ink-muted)' }}
          >
            {timeAgo(post.created_at)}
          </span>
        </div>

        {/* Body Text */}
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.5,
            margin: '8px 0 14px',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            color: 'var(--ink-primary)',
          }}
        >
          {post.body}
        </p>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              triggerLike()
            }}
            className="transit-chip"
            style={{
              borderColor: liked ? 'var(--status-delay)' : 'var(--border-strong)',
              color: liked ? 'var(--status-delay)' : 'inherit',
              backgroundColor: liked ? 'rgba(230, 57, 70, 0.08)' : 'transparent',
            }}
            aria-label={liked ? 'Unlike post' : 'Like post'}
          >
            <span style={{ fontSize: 14 }}>{liked ? '♥' : '♡'}</span>
            <span className="mono-spec">{likeCount}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
              triggerHaptic('light')
            }}
            className="transit-chip"
            aria-expanded={open}
            aria-label="Toggle comments"
          >
            <span>💬</span>
            <span className="mono-spec">{comments.length}</span>
          </button>

          <button
            onClick={async (e) => {
              e.stopPropagation()
              if (!reported) {
                await onReport({ postId: post.id })
                setReported(true)
                triggerHaptic('medium')
              }
            }}
            className="ms-auto"
            style={{
              background: 'transparent',
              border: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: reported ? 'var(--status-delay)' : 'var(--ink-muted)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            disabled={reported}
          >
            {reported ? '⚑ Reported' : '⚑ Report'}
          </button>
        </div>

        {/* Collapsible Spring Comments Section */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px dashed var(--border-dashed)', paddingTop: 12 }}
            >
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    marginBottom: 8,
                    fontSize: 13.5,
                  }}
                >
                  <div style={{ overflowWrap: 'anywhere' }}>{c.body}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      onClick={() => {
                        onReportComment(c.id)
                        triggerHaptic('light')
                      }}
                      style={{
                        background: 'transparent',
                        border: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--ink-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Report comment
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={submitComment} style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="transit-input"
                    maxLength={280}
                    placeholder="Dispatch a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ fontSize: 13, padding: '9px 12px' }}
                  />
                  <button
                    type="submit"
                    className="transit-btn-primary"
                    style={{ width: 'auto', minHeight: 40, padding: '0 16px', fontSize: 13 }}
                  >
                    POST
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="small text-danger">{err}</span>
                  <span className="mono-spec small text-muted">{text.length}/280</span>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  )
}
