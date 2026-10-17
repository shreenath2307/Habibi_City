import { useState } from 'react'
import { TAG_LABEL, timeAgo } from './lib'

export function Hero({ eyebrow, title, italic, sub, img }) {
  return (
    <header className="hero mb-3" style={{ '--hero-img': `url(${img})` }}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="serif">
        {title} <em>{italic}</em>
      </h1>
      <p>{sub}</p>
    </header>
  )
}

export function Chip({ category, tag }) {
  if (!tag) return null
  return (
    <span className={`chip chip-${category}`}>{TAG_LABEL[tag] || tag}</span>
  )
}

/* Route status board with its own route filter. */
export function StatusBoard({ routes, statuses, routeFilter, onRouteFilter }) {
  const shown = routeFilter === 'all' ? routes : routes.filter((r) => r.id === routeFilter)
  return (
    <section className="card-soft mb-3">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
        <h2 className="section-title serif">Route status</h2>
        <select
          className="form-select w-auto"
          style={{ fontSize: 13, padding: '7px 30px 7px 11px' }}
          value={routeFilter}
          onChange={(e) => onRouteFilter(e.target.value)}
        >
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
          <option value="all">All routes</option>
        </select>
      </div>

      {shown.length === 0 && <p className="text-muted small mb-0">No routes yet.</p>}

      {shown.map((r) => {
        const s = statuses[r.id]
        return (
          <div className="status-row" key={r.id}>
            <span className="status-name">{r.name}</span>
            <span className="status-value">
              {s ? (
                <>
                  <strong>{TAG_LABEL[s.tag] || s.tag}</strong>
                  {s.count} {s.count === 1 ? 'report' : 'reports'} in the last hour
                </>
              ) : (
                'No recent reports.'
              )}
            </span>
          </div>
        )
      })}
    </section>
  )
}

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

  async function submit(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    const problem = await onComment(post.id, body)
    if (problem) return setErr(problem)
    setErr('')
    setText('')
  }

  return (
    <article className="card-soft mb-2">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {routeName && <span className="chip">{routeName}</span>}
        <Chip category={post.category} tag={post.emotion} />
        <span className="ms-auto small text-muted">{timeAgo(post.created_at)}</span>
      </div>

      <p className="post-body">{post.body}</p>

      <div className="d-flex align-items-center gap-3">
        <button className={`linkbtn ${liked ? 'on' : ''}`} onClick={() => onLike(post.id)}>
          {liked ? '♥' : '♡'} {likeCount}
        </button>
        <button className="linkbtn" onClick={() => setOpen((v) => !v)}>
          Comments ({comments.length})
        </button>
        <button
          className="linkbtn ms-auto"
          disabled={reported}
          onClick={async () => {
            await onReport({ postId: post.id })
            setReported(true)
          }}
        >
          {reported ? 'Reported' : 'Report'}
        </button>
      </div>

      {open && (
        <div className="mt-2">
          {comments.map((c) => (
            <div className="comment" key={c.id}>
              <div>{c.body}</div>
              <button
                className="linkbtn"
                style={{ fontSize: 11 }}
                onClick={() => onReportComment(c.id)}
              >
                Report
              </button>
            </div>
          ))}

          <form className="d-flex gap-2 mt-2" onSubmit={submit}>
            <input
              className="form-control"
              maxLength={280}
              placeholder="Add a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn btn-ink px-3" type="submit">
              Post
            </button>
          </form>
          <div className="d-flex justify-content-between mt-1">
            <small className="text-danger">{err}</small>
            <small className="text-muted">{text.length}/280</small>
          </div>
        </div>
      )}
    </article>
  )
}

export function Notice({ notice }) {
  if (!notice) return null
  const style = notice.kind === 'crisis' ? 'alert-warning' : 'alert-secondary'
  return (
    <div className={`alert ${style} rounded-4 small`} role="alert">
      {notice.message}
    </div>
  )
}
