import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  addComment,
  checkText,
  fetchComments,
  fetchLikes,
  fetchRoutePosts,
  fetchRoutes,
  fetchStations,
  getDeviceId,
  getStreak,
  likePost,
  reportItem,
  statusByRoute,
  configured,
} from './lib'
import { DepartureTicker } from './components/DepartureTicker'
import { SkylineHero } from './components/SkylineHero'
import { PunchCardStreak } from './components/PunchCardStreak'
import { MetroStatusBoard } from './components/MetroStatusBoard'
import { PostCard } from './components/PostCard'
import { DesktopCursor } from './components/DesktopCursor'
import { WriteScreen } from './screens/WriteScreen'
import { LettersScreen } from './screens/LettersScreen'
import { MapScreen } from './screens/MapScreen'
import { triggerHaptic } from './theme'

const TABS = [
  ['feed', 'Feed', '⚡'],
  ['write', 'Write', '✎'],
  ['letters', 'Letters', '✉'],
  ['map', 'Map', '⌖'],
]

export default function App() {
  const [tab, setTab] = useState('feed')
  const [routes, setRoutes] = useState([])
  const [stations, setStations] = useState([])
  const [posts, setPosts] = useState([])
  const [likes, setLikes] = useState({ counts: {}, mine: new Set() })
  const [commentsByPost, setCommentsByPost] = useState({})
  const [streak, setStreak] = useState(getStreak) // resets to 0 if a day was missed
  const [routeFilter, setRouteFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(() => configured)

  useEffect(() => {
    getDeviceId()
    if (!configured) return

    Promise.all([fetchRoutes(), fetchStations()])
      .then(([r, s]) => {
        setRoutes(r)
        setStations(s)
      })
      .catch((e) => setError(e.message))

    loadPosts().finally(() => setLoading(false))
  }, [])

  async function loadPosts() {
    try {
      const rows = await fetchRoutePosts()
      setPosts(rows)
      const ids = rows.map((r) => r.id)
      const [l, c] = await Promise.all([fetchLikes(ids), fetchComments(ids)])
      setLikes(l)
      setCommentsByPost(c)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const routesById = useMemo(
    () => Object.fromEntries(routes.map((r) => [r.id, r.name])),
    [routes]
  )
  const statuses = useMemo(() => statusByRoute(posts), [posts])

  async function onLike(postId) {
    if (likes.mine.has(postId)) return
    // Optimistic like
    setLikes((prev) => {
      const mine = new Set(prev.mine)
      mine.add(postId)
      return { counts: { ...prev.counts, [postId]: (prev.counts[postId] || 0) + 1 }, mine }
    })

    try {
      await likePost(postId)
    } catch {
      // Visibly rollback if request fails
      setLikes((prev) => {
        const mine = new Set(prev.mine)
        mine.delete(postId)
        return {
          counts: { ...prev.counts, [postId]: Math.max(0, (prev.counts[postId] || 1) - 1) },
          mine,
        }
      })
    }
  }

  // Returns an error message to show inline, or null on success.
  async function onComment(postId, body) {
    const problem = checkText(body)
    if (problem) return problem.message
    try {
      const row = await addComment(postId, body)
      setCommentsByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), row] }))
      return null
    } catch (e) {
      return e.message
    }
  }

  async function onReport({ postId = null, commentId = null }) {
    try {
      await reportItem({ postId, commentId })
      await loadPosts() // a third report hides the item server-side
    } catch (e) {
      setError(e.message)
    }
  }

  const visible = posts.filter(
    (p) =>
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (routeFilter === 'all' || p.route_id === routeFilter)
  )

  const feedProps = {
    likes,
    commentsByPost,
    onLike,
    onComment,
    onReport,
    onReportComment: (id) => onReport({ commentId: id }),
  }

  return (
    <div className="app-shell">
      {/* Desktop-only custom trailing ring cursor */}
      <DesktopCursor />

      {/* Transit Header with Departure Ticker and Commuter Stamp Punch Card */}
      <header className="transit-header">
        <div className="topbar-main">
          <div className="brand-stamp">
            <span className="brand-stamp-icon">H</span>
            <div>
              <span className="brand-stamp-title">
                HABIBI <span>CITY</span>
              </span>
              <span className="brand-station-tag ms-2">TRANSIT DISPATCH</span>
            </div>
          </div>

          <PunchCardStreak streak={streak} activeTab={tab} />
        </div>

        <DepartureTicker posts={posts} />
      </header>

      {/* Missing configuration notice */}
      {!configured && (
        <div className="transit-notice transit-notice-warning" role="alert">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong>SUPABASE CREDENTIALS REQUIRED</strong>
            <p className="mb-0 mt-1 small">
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
              <code>.env</code>, then restart <code>npm run dev</code>.
            </p>
          </div>
        </div>
      )}

      {/* Inline system error notice */}
      {error && (
        <div className="transit-notice transit-notice-danger" role="alert">
          <span style={{ fontSize: 18 }}>🛑</span>
          <div>
            <strong>DISPATCH DISRUPTION</strong>
            <p className="mb-0 mt-1 small">{error}</p>
          </div>
        </div>
      )}

      {/* Screen Views with Animated Tab Transitions */}
      <AnimatePresence mode="wait">
        {tab === 'feed' && (
          <motion.main
            key="feed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <SkylineHero
              eyebrow="ANONYMOUS • ROUTE BY ROUTE"
              title="NOTES FROM THE"
              italic="commute"
              sub="What the city is like right now, broadcast live by the people riding through it."
            />

            <MetroStatusBoard
              routes={routes}
              statuses={statuses}
              routeFilter={routeFilter}
              onRouteFilter={setRouteFilter}
            />

            {/* Category Filter Rail */}
            <div className="filter-rail" aria-label="Filter dispatches by type">
              {[
                ['all', 'Everything', '✦'],
                ['practical', 'Practical', '⚡'],
                ['observation', 'Observation', '👁'],
              ].map(([c, label, icon]) => (
                <button
                  key={c}
                  className={`filter-btn ${categoryFilter === c ? 'active' : ''}`}
                  onClick={() => {
                    setCategoryFilter(c)
                    triggerHaptic('light')
                  }}
                >
                  <span style={{ marginRight: 6 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Empty State */}
            {visible.length === 0 && !loading && (
              <div className="transit-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🚇</div>
                <h3 className="signage-heading" style={{ fontSize: 22, margin: '0 0 6px' }}>
                  NO POSTS YET ON THIS LINE
                </h3>
                <p className="text-muted small mb-3">
                  Be the first commuter to drop a live report or observation.
                </p>
                <button
                  className="filter-btn active"
                  onClick={() => {
                    setTab('write')
                    triggerHaptic('medium')
                  }}
                >
                  POST A REPORT ↵
                </button>
              </div>
            )}

            {/* Staggered Post Feed */}
            {visible.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.4) }}
              >
                <PostCard
                  post={p}
                  routeName={routesById[p.route_id]}
                  likeCount={likes.counts[p.id] || 0}
                  liked={likes.mine.has(p.id)}
                  comments={commentsByPost[p.id] || []}
                  onLike={onLike}
                  onComment={onComment}
                  onReport={onReport}
                  onReportComment={feedProps.onReportComment}
                />
              </motion.div>
            ))}
          </motion.main>
        )}

        {tab === 'write' && (
          <motion.main
            key="write"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <WriteScreen
              routes={routes}
              stations={stations}
              onPosted={(newStreak) => {
                if (newStreak !== null) setStreak(newStreak)
                loadPosts()
                setTab('feed')
              }}
            />
          </motion.main>
        )}

        {tab === 'letters' && (
          <motion.main
            key="letters"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <LettersScreen />
          </motion.main>
        )}

        {tab === 'map' && (
          <motion.main
            key="map"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <MapScreen
              stations={stations}
              posts={posts}
              routesById={routesById}
              feedProps={feedProps}
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Floating Pill Navigation */}
      <nav className="floating-nav-container" aria-label="Main Transit Navigation">
        <div className="floating-pill-nav">
          {TABS.map(([key, label, icon]) => {
            const isActive = tab === key
            return (
              <button
                key={key}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setTab(key)
                  triggerHaptic('light')
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePillIndicator"
                    className="nav-active-indicator"
                    style={{ inset: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
