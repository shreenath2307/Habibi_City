import { useEffect, useMemo, useState } from 'react'
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
import { Hero, PostCard, StatusBoard } from './components'
import { LettersScreen, MapScreen, WriteScreen } from './screens'

const TABS = [
  ['feed', 'Feed'],
  ['write', 'Write'],
  ['letters', 'Letters'],
  ['map', 'Map'],
]

export default function App() {
  const [tab, setTab] = useState('feed')
  const [routes, setRoutes] = useState([])
  const [stations, setStations] = useState([])
  const [posts, setPosts] = useState([])
  const [likes, setLikes] = useState({ counts: {}, mine: new Set() })
  const [commentsByPost, setCommentsByPost] = useState({})
  const [streak, setStreak] = useState(getStreak) // resets to 0 if a day was missed
  const [routeFilter, setRouteFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    getDeviceId()
    if (!configured) return
    Promise.all([fetchRoutes(), fetchStations()])
      .then(([r, s]) => {
        setRoutes(r)
        setStations(s)
        setRouteFilter((f) => f || r[0]?.id || 'all')
      })
      .catch((e) => setError(e.message))
    loadPosts()
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
    await likePost(postId)
    setLikes((prev) => {
      const mine = new Set(prev.mine)
      mine.add(postId)
      return { counts: { ...prev.counts, [postId]: (prev.counts[postId] || 0) + 1 }, mine }
    })
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
    (p) => categoryFilter === 'all' || p.category === categoryFilter
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
    <div className="app">
      <div className="topbar">
        <span className="brand">
          Habibi <span>City</span>
        </span>
        <span className="streak">Commute streak: {streak} days</span>
      </div>

      {!configured && (
        <div className="alert alert-warning rounded-4 small">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
          <code>.env</code>, then restart <code>npm run dev</code>.
        </div>
      )}

      {error && <div className="alert alert-danger rounded-4 small">{error}</div>}

      {tab === 'feed' && (
        <>
          <Hero
            eyebrow="Anonymous, route by route"
            title="Notes from the"
            italic="commute"
            sub="What the city is like right now, told by the people riding through it."
            img="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=70"
          />

          <StatusBoard
            routes={routes}
            statuses={statuses}
            routeFilter={routeFilter}
            onRouteFilter={setRouteFilter}
          />

          <div className="toggle-group mb-3">
            {['all', 'practical', 'observation'].map((c) => (
              <button
                key={c}
                className={categoryFilter === c ? 'active' : ''}
                onClick={() => setCategoryFilter(c)}
              >
                {c === 'all' ? 'Everything' : c[0].toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className="text-muted small">No posts yet.</p>}
          {visible.map((p) => (
            <PostCard
              key={p.id}
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
          ))}
        </>
      )}

      {tab === 'write' && (
        <WriteScreen
          routes={routes}
          stations={stations}
          onPosted={(newStreak) => {
            if (newStreak !== null) setStreak(newStreak)
            loadPosts()
            setTab('feed')
          }}
        />
      )}

      {tab === 'letters' && <LettersScreen />}

      {tab === 'map' && (
        <MapScreen
          stations={stations}
          posts={posts}
          routesById={routesById}
          feedProps={feedProps}
        />
      )}

      <nav className="pillnav">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
