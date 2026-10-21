/**
 * Commuter Streak calculation (localStorage based)
 */
const STREAK_KEY = 'commute_streak'

interface StoredStreak {
  count: number
  last: string | null
}

export function dayString(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD in local time
}

export function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayString(d)
}

function readStreak(): StoredStreak {
  if (typeof window === 'undefined') {
    return { count: 0, last: null }
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { count: 0, last: null }
  } catch {
    return { count: 0, last: null }
  }
}

/**
 * Called on load: a missed day resets the streak to 0.
 */
export function getStreak(): number {
  const s = readStreak()
  if (s.last === dayString() || s.last === yesterdayString()) {
    return s.count
  }
  if (s.count !== 0 && typeof window !== 'undefined') {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 0, last: s.last }))
  }
  return 0
}

/**
 * Called after an observation post. Only the first post of a day counts towards streak.
 */
export function bumpStreak(): number {
  if (typeof window === 'undefined') return 0
  const s = readStreak()
  const today = dayString()
  if (s.last === today) return s.count
  const count = s.last === yesterdayString() ? s.count + 1 : 1
  localStorage.setItem(STREAK_KEY, JSON.stringify({ count, last: today }))
  return count
}
