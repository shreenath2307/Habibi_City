import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import {
  OBSERVATION_TAGS,
  configured,
  PRACTICAL_TAGS,
  TAG_LABEL,
  bumpStreak,
  checkText,
  createLetter,
  createRoutePost,
  fetchLetterCities,
  fetchLetters,
  fetchLikes,
  likePost,
  reportItem,
  timeAgo,
} from './lib'
import { Hero, Notice, PostCard } from './components'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

/* ---------------- Write ---------------- */

export function WriteScreen({ routes, stations, onPosted }) {
  const [body, setBody] = useState('')
  const [routeId, setRouteId] = useState('')
  const [stationId, setStationId] = useState('')
  const [category, setCategory] = useState('practical')
  const [tag, setTag] = useState(PRACTICAL_TAGS[0])
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!routeId && routes[0]) setRouteId(routes[0].id)
  }, [routes, routeId])

  function switchCategory(next) {
    setCategory(next)
    setTag(next === 'practical' ? PRACTICAL_TAGS[0] : OBSERVATION_TAGS[0])
  }

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text || !routeId) return
    const problem = checkText(text)
    if (problem) return setNotice(problem)

    setBusy(true)
    try {
      await createRoutePost({ body: text, routeId, stationId, category, emotion: tag })
      if (category === 'observation') onPosted(bumpStreak())
      else onPosted(null)
      setBody('')
      setNotice(null)
    } catch (err) {
      setNotice({ kind: 'abuse', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  const tags = category === 'practical' ? PRACTICAL_TAGS : OBSERVATION_TAGS

  return (
    <>
      <Hero
        eyebrow="Post to your route"
        title="Say it as you"
        italic="ride"
        sub="A delay, a kindness, a small moment. Anonymous, no account, nothing stored about you."
        img="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=70"
      />

      <form className="card-soft" onSubmit={submit}>
        <Notice notice={notice} />

        <textarea
          className="form-control mb-3"
          rows={4}
          placeholder="What's happening on this route?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="toggle-group mb-3">
          <button
            type="button"
            className={category === 'practical' ? 'active' : ''}
            onClick={() => switchCategory('practical')}
          >
            Practical
          </button>
          <button
            type="button"
            className={category === 'observation' ? 'active' : ''}
            onClick={() => switchCategory('observation')}
          >
            Observation
          </button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="eyebrow d-block mb-1">Route</label>
            <select
              className="form-select"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="eyebrow d-block mb-1">Tag</label>
            <select className="form-select" value={tag} onChange={(e) => setTag(e.target.value)}>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {TAG_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="eyebrow d-block mb-1">Station (optional)</label>
            <select
              className="form-select"
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

        <button className="btn btn-ink w-100" disabled={busy || !body.trim()}>
          {busy ? 'Posting…' : 'Post anonymously'}
        </button>
      </form>
    </>
  )
}

/* ---------------- Letters ---------------- */

function LetterCard({ letter, likeCount, liked, onLike }) {
  const [reported, setReported] = useState(false)
  return (
    <article className="card-soft mb-2">
      <div className="d-flex justify-content-between">
        <span className="eyebrow">{letter.city}</span>
        <span className="small text-muted">{timeAgo(letter.created_at)}</span>
      </div>
      <p className="post-body letter-body">{letter.body}</p>
      <div className="d-flex gap-3">
        <button className={`linkbtn ${liked ? 'on' : ''}`} onClick={() => onLike(letter.id)}>
          {liked ? '♥' : '♡'} {likeCount}
        </button>
        <button
          className="linkbtn ms-auto"
          disabled={reported}
          onClick={async () => {
            await reportItem({ postId: letter.id })
            setReported(true)
          }}
        >
          {reported ? 'Reported' : 'Report'}
        </button>
      </div>
    </article>
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

  async function load(selected) {
    if (!selected || !configured) return
    const rows = await fetchLetters(selected)
    setLetters(rows)
    setLikes(await fetchLikes(rows.map((r) => r.id)))
  }

  useEffect(() => {
    load(city).catch((e) => setNotice({ kind: 'abuse', message: e.message }))
  }, [city])

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
      await load(city)
    } catch (err) {
      setNotice({ kind: 'abuse', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Hero
        eyebrow="Unsent letters"
        title="Dear city, I never"
        italic="sent this"
        sub="Letters written to a city and left here instead. Pick a city to read its letters."
        img="https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=70"
      />

      <div className="card-soft mb-3">
        <label className="eyebrow d-block mb-1">City</label>
        <select className="form-select" value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.length === 0 && <option value="">No cities yet</option>}
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <form className="mt-3" onSubmit={submit}>
          <Notice notice={notice} />
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder={city ? `Write a letter to ${city}…` : 'Write a letter…'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="btn btn-ink w-100" disabled={busy || !body.trim() || !city}>
            {busy ? 'Sending…' : 'Leave this letter'}
          </button>
        </form>
      </div>

      {letters.length === 0 && (
        <p className="text-muted small">No letters for this city yet.</p>
      )}
      {letters.map((l) => (
        <LetterCard
          key={l.id}
          letter={l}
          likeCount={likes.counts[l.id] || 0}
          liked={likes.mine.has(l.id)}
          onLike={onLike}
        />
      ))}
    </>
  )
}

/* ---------------- Map ---------------- */

export function MapScreen({ stations, posts, routesById, feedProps }) {
  const [selected, setSelected] = useState(null)

  const center = useMemo(() => {
    if (!stations.length) return [19.076, 72.8777]
    const lat = stations.reduce((a, s) => a + Number(s.lat), 0) / stations.length
    const lng = stations.reduce((a, s) => a + Number(s.lng), 0) / stations.length
    return [lat, lng]
  }, [stations])

  const stationPosts = selected ? posts.filter((p) => p.station_id === selected.id) : []

  return (
    <>
      <Hero
        eyebrow="Stations"
        title="The city, one stop"
        italic="at a time"
        sub="Tap a station marker to read the posts tagged to it."
        img="https://images.unsplash.com/photo-1527576539890-dfa815648363?auto=format&fit=crop&w=1200&q=70"
      />

      {stations.length > 0 && (
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="mb-3">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((s) => (
            <Marker
              key={s.id}
              position={[Number(s.lat), Number(s.lng)]}
              icon={markerIcon}
              eventHandlers={{ click: () => setSelected(s) }}
            >
              <Popup>{s.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {selected && (
        <>
          <h2 className="section-title serif mb-2">{selected.name}</h2>
          {stationPosts.length === 0 && (
            <p className="text-muted small">No posts tagged to this station yet.</p>
          )}
          {stationPosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              routeName={routesById[p.route_id]}
              likeCount={feedProps.likes.counts[p.id] || 0}
              liked={feedProps.likes.mine.has(p.id)}
              comments={feedProps.commentsByPost[p.id] || []}
              onLike={feedProps.onLike}
              onComment={feedProps.onComment}
              onReport={feedProps.onReport}
              onReportComment={feedProps.onReportComment}
            />
          ))}
        </>
      )}
    </>
  )
}
