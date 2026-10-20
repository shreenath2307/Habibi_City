import { useMemo } from 'react'
import { STATUS_META } from '../theme'
import { timeAgo } from '../lib'

export function DepartureTicker({ posts = [] }) {
  const latestPosts = useMemo(() => {
    return posts.slice(0, 8)
  }, [posts])

  if (!latestPosts.length) {
    return (
      <div className="departure-ticker" role="region" aria-label="Live departure alerts">
        <span className="ticker-badge">LIVE</span>
        <span className="ticker-idle">TRACK MONITOR ACTIVE • ALL LINES REPORTING IN REAL-TIME</span>
      </div>
    )
  }

  return (
    <div className="departure-ticker" role="region" aria-label="Live departure alerts">
      <span className="ticker-badge">DISPATCH</span>
      <div className="ticker-marquee" aria-live="off">
        {latestPosts.map((post) => {
          const meta = STATUS_META[post.emotion] || STATUS_META.clear
          return (
            <span key={post.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: meta.color, fontWeight: 700 }}>[{meta.code}]</span>
              <span>{post.body.length > 55 ? post.body.slice(0, 52) + '…' : post.body}</span>
              <span style={{ opacity: 0.5 }}>• {timeAgo(post.created_at)}</span>
              <span style={{ opacity: 0.3 }}>|</span>
            </span>
          )
        })}
        {/* Duplicate for infinite seamless scroll */}
        {latestPosts.map((post) => {
          const meta = STATUS_META[post.emotion] || STATUS_META.clear
          return (
            <span key={`dup-${post.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: meta.color, fontWeight: 700 }}>[{meta.code}]</span>
              <span>{post.body.length > 55 ? post.body.slice(0, 52) + '…' : post.body}</span>
              <span style={{ opacity: 0.5 }}>• {timeAgo(post.created_at)}</span>
              <span style={{ opacity: 0.3 }}>|</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
