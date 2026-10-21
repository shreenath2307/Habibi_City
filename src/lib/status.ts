import { Post, RouteStatus } from '@/types/database'

/**
 * Calculates the most common practical tag per route over the last 60 minutes.
 */
export function statusByRoute(posts: Post[]): Record<string, RouteStatus> {
  const cutoff = Date.now() - 60 * 60 * 1000
  const tally: Record<string, Record<string, number>> = {}

  for (const p of posts) {
    if (p.category !== 'practical' || !p.route_id) continue
    if (new Date(p.created_at).getTime() < cutoff) continue
    const tag = p.emotion || 'clear'
    if (!tally[p.route_id]) {
      tally[p.route_id] = {}
    }
    tally[p.route_id][tag] = (tally[p.route_id][tag] || 0) + 1
  }

  const out: Record<string, RouteStatus> = {}
  for (const [routeId, tags] of Object.entries(tally)) {
    const sorted = Object.entries(tags).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0) {
      const [tag, count] = sorted[0]
      out[routeId] = { tag, count }
    }
  }
  return out
}

/**
 * Editorial formatted relative time (e.g., 'just now', '12m ago', '3h ago', '2d ago')
 */
export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
