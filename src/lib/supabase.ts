import { createClient } from '@supabase/supabase-js'
import { Comment, Post, Route, Station, LikesState } from '@/types/database'
import { getDeviceId } from './device'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const configured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder')
)

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

/* ---------- Typed Supabase Queries ---------- */

export async function fetchRoutes(): Promise<Route[]> {
  const { data, error } = await supabase.from('routes').select('id, name').order('name')
  if (error) throw error
  return (data as Route[]) ?? []
}

export async function fetchStations(): Promise<Station[]> {
  const { data, error } = await supabase.from('stations').select('id, name, lat, lng').order('name')
  if (error) throw error
  return (data as Station[]) ?? []
}

export async function fetchRoutePosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('kind', 'route')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data as Post[]) ?? []
}

export async function fetchLetters(city?: string): Promise<Post[]> {
  let q = supabase
    .from('posts')
    .select('*')
    .eq('kind', 'letter')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
  if (city) q = q.eq('city', city)
  const { data, error } = await q
  if (error) throw error
  return (data as Post[]) ?? []
}

export async function fetchLetterCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('city')
    .eq('kind', 'letter')
    .eq('hidden', false)
  if (error) throw error
  const rawList = (data ?? []).map((r: { city: string | null }) => r.city).filter(Boolean) as string[]
  return [...new Set(rawList)].sort()
}

export async function createRoutePost(params: {
  body: string
  routeId: string
  stationId?: string | null
  category: string
  emotion: string
}): Promise<void> {
  const { error } = await supabase.from('posts').insert({
    body: params.body,
    route_id: params.routeId,
    station_id: params.stationId || null,
    category: params.category,
    emotion: params.emotion,
    kind: 'route',
  })
  if (error) throw error
}

export async function createLetter(params: { body: string; city: string }): Promise<void> {
  const row = {
    body: params.body,
    city: params.city,
    category: 'observation',
    kind: 'letter',
    route_id: null,
  }
  let { error } = await supabase.from('posts').insert(row)
  if (error && /route_id/.test(error.message || '')) {
    // Fallback if schema has route_id as NOT NULL
    const routes = await fetchRoutes()
    if (routes[0]) {
      const fallback = await supabase.from('posts').insert({ ...row, route_id: routes[0].id })
      error = fallback.error
    }
  }
  if (error) throw error
}

export async function fetchLikes(postIds: string[]): Promise<LikesState> {
  if (!postIds.length) return { counts: {}, mine: new Set<string>() }
  const { data, error } = await supabase
    .from('reactions')
    .select('post_id, device_id')
    .eq('type', 'like')
    .in('post_id', postIds)
  if (error) throw error
  const counts: Record<string, number> = {}
  const mine = new Set<string>()
  const me = getDeviceId()
  for (const r of data ?? []) {
    counts[r.post_id] = (counts[r.post_id] || 0) + 1
    if (r.device_id === me) mine.add(r.post_id)
  }
  return { counts, mine }
}

export async function likePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('reactions')
    .insert({ post_id: postId, device_id: getDeviceId(), type: 'like' })
  // 23505 = unique constraint violation (already liked by this device)
  if (error && error.code !== '23505') throw error
}

export async function fetchComments(postIds: string[]): Promise<Record<string, Comment[]>> {
  if (!postIds.length) return {}
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('hidden', false)
    .in('post_id', postIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  const byPost: Record<string, Comment[]> = {}
  for (const c of (data as Comment[]) ?? []) {
    if (!byPost[c.post_id]) byPost[c.post_id] = []
    byPost[c.post_id].push(c)
  }
  return byPost
}

export async function addComment(postId: string, body: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, body })
    .select()
    .single()
  if (error) throw error
  return data as Comment
}

export async function reportItem(params: {
  postId?: string | null
  commentId?: string | null
}): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert({
      post_id: params.postId || null,
      comment_id: params.commentId || null,
      device_id: getDeviceId(),
    })
  if (error) throw error
}
