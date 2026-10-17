import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// True once .env holds real project keys; the app shows a setup notice when false.
export const configured = Boolean(URL && KEY)

export const supabase = createClient(
  URL || 'https://placeholder.supabase.co',
  KEY || 'placeholder-anon-key'
)

/* ---------- constants ---------- */

export const PRACTICAL_TAGS = ['delay', 'crowding', 'safety', 'clear']
export const OBSERVATION_TAGS = ['sightings', 'kindness', 'small moments', 'vibes']

export const TAG_LABEL = {
  delay: 'Delayed',
  crowding: 'Crowded',
  safety: 'Safety concern',
  clear: 'All clear',
  sightings: 'Sighting',
  kindness: 'Kindness',
  'small moments': 'Small moment',
  vibes: 'Vibes',
}

/* ---------- anonymous device identity ---------- */

export function getDeviceId() {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('device_id', id)
  }
  return id
}

/* ---------- commute streak (localStorage only) ---------- */

const STREAK_KEY = 'commute_streak'

function dayString(d = new Date()) {
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD, local time
}

function yesterdayString() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayString(d)
}

function readStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, last: null }
  } catch {
    return { count: 0, last: null }
  }
}

// Called on load: a missed day resets the streak to 0.
export function getStreak() {
  const s = readStreak()
  if (s.last === dayString() || s.last === yesterdayString()) return s.count
  if (s.count !== 0) {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 0, last: s.last }))
  }
  return 0
}

// Called after an observation post. Only the first post of a day counts.
export function bumpStreak() {
  const s = readStreak()
  const today = dayString()
  if (s.last === today) return s.count
  const count = s.last === yesterdayString() ? s.count + 1 : 1
  localStorage.setItem(STREAK_KEY, JSON.stringify({ count, last: today }))
  return count
}

/* ---------- moderation ---------- */

const BANNED = ['fuck', 'shit', 'bitch', 'bastard', 'asshole', 'slut', 'retard', 'whore']
const CRISIS = [
  'end my life',
  'ending my life',
  'suicide',
  'suicidal',
  'kill myself',
  'killing myself',
  'want to die',
  'end it all',
]

export const CRISIS_MESSAGE =
  "If you're struggling, please reach out to a local helpline or someone you trust."

// Returns null when the text is fine, otherwise a reason to show the user.
export function checkText(text) {
  const t = text.toLowerCase()
  if (CRISIS.some((w) => t.includes(w))) return { kind: 'crisis', message: CRISIS_MESSAGE }
  if (BANNED.some((w) => new RegExp('\\b' + w, 'i').test(t))) {
    return { kind: 'abuse', message: 'Please rewrite this without abusive language.' }
  }
  return null
}

/* ---------- queries ---------- */

export async function fetchRoutes() {
  const { data, error } = await supabase.from('routes').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchStations() {
  const { data, error } = await supabase.from('stations').select('id, name, lat, lng').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchRoutePosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('kind', 'route')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

export async function fetchLetters(city) {
  let q = supabase
    .from('posts')
    .select('*')
    .eq('kind', 'letter')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
  if (city) q = q.eq('city', city)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function fetchLetterCities() {
  const { data, error } = await supabase
    .from('posts')
    .select('city')
    .eq('kind', 'letter')
    .eq('hidden', false)
  if (error) throw error
  return [...new Set((data ?? []).map((r) => r.city).filter(Boolean))].sort()
}

export async function createRoutePost({ body, routeId, stationId, category, emotion }) {
  const { error } = await supabase.from('posts').insert({
    body,
    route_id: routeId,
    station_id: stationId || null,
    category,
    emotion,
    kind: 'route',
  })
  if (error) throw error
}

export async function createLetter({ body, city }) {
  const row = { body, city, category: 'observation', kind: 'letter', route_id: null }
  let { error } = await supabase.from('posts').insert(row)
  if (error && /route_id/.test(error.message || '')) {
    // Fallback for a schema where route_id is NOT NULL.
    const routes = await fetchRoutes()
    if (routes[0]) {
      ;({ error } = await supabase.from('posts').insert({ ...row, route_id: routes[0].id }))
    }
  }
  if (error) throw error
}

export async function fetchLikes(postIds) {
  if (!postIds.length) return { counts: {}, mine: new Set() }
  const { data, error } = await supabase
    .from('reactions')
    .select('post_id, device_id')
    .eq('type', 'like')
    .in('post_id', postIds)
  if (error) throw error
  const counts = {}
  const mine = new Set()
  const me = getDeviceId()
  for (const r of data ?? []) {
    counts[r.post_id] = (counts[r.post_id] || 0) + 1
    if (r.device_id === me) mine.add(r.post_id)
  }
  return { counts, mine }
}

export async function likePost(postId) {
  const { error } = await supabase
    .from('reactions')
    .insert({ post_id: postId, device_id: getDeviceId(), type: 'like' })
  // 23505 = unique violation, i.e. this device already liked the post.
  if (error && error.code !== '23505') throw error
}

export async function fetchComments(postIds) {
  if (!postIds.length) return {}
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('hidden', false)
    .in('post_id', postIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  const byPost = {}
  for (const c of data ?? []) (byPost[c.post_id] ||= []).push(c)
  return byPost
}

export async function addComment(postId, body) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, body })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function reportItem({ postId = null, commentId = null }) {
  const { error } = await supabase
    .from('reports')
    .insert({ post_id: postId, comment_id: commentId, device_id: getDeviceId() })
  if (error) throw error
}

/* ---------- status board ---------- */

// Most common practical tag per route over the last 60 minutes.
export function statusByRoute(posts) {
  const cutoff = Date.now() - 60 * 60 * 1000
  const tally = {}
  for (const p of posts) {
    if (p.category !== 'practical' || !p.route_id) continue
    if (new Date(p.created_at).getTime() < cutoff) continue
    const tag = p.emotion || 'clear'
    tally[p.route_id] ||= {}
    tally[p.route_id][tag] = (tally[p.route_id][tag] || 0) + 1
  }
  const out = {}
  for (const [routeId, tags] of Object.entries(tally)) {
    const [tag, count] = Object.entries(tags).sort((a, b) => b[1] - a[1])[0]
    out[routeId] = { tag, count }
  }
  return out
}

export function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}
