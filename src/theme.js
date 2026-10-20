// Deterministic transit line palette and status definitions
export const LINE_COLORS = [
  { id: 'blue', name: 'Cobalt Line', hex: '#0057B7', bg: 'rgba(0, 87, 183, 0.12)', border: '#0057B7' },
  { id: 'jade', name: 'Jade Loop', hex: '#00875A', bg: 'rgba(0, 135, 90, 0.12)', border: '#00875A' },
  { id: 'persimmon', name: 'Persimmon Express', hex: '#E85D04', bg: 'rgba(232, 93, 4, 0.12)', border: '#E85D04' },
  { id: 'violet', name: 'Violet Cityway', hex: '#7B2CBF', bg: 'rgba(123, 44, 191, 0.12)', border: '#7B2CBF' },
  { id: 'amber', name: 'Golden Central', hex: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', border: '#D97706' },
]

export function getRouteColor(routeId, index = 0) {
  if (!routeId) return LINE_COLORS[index % LINE_COLORS.length]
  let hash = 0
  for (let i = 0; i < routeId.length; i++) {
    hash = (hash << 5) - hash + routeId.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % LINE_COLORS.length
  return LINE_COLORS[idx]
}

export const STATUS_META = {
  delay: {
    label: 'Delayed',
    code: 'DLY',
    color: '#E63946',
    bg: 'rgba(230, 57, 70, 0.14)',
    border: '#E63946',
    pulse: true,
  },
  crowding: {
    label: 'Crowded',
    code: 'CRW',
    color: '#F77F00',
    bg: 'rgba(247, 127, 0, 0.14)',
    border: '#F77F00',
    pulse: true,
  },
  safety: {
    label: 'Safety Concern',
    code: 'SEC',
    color: '#D62288',
    bg: 'rgba(214, 34, 136, 0.14)',
    border: '#D62288',
    pulse: true,
  },
  clear: {
    label: 'All Clear',
    code: 'CLR',
    color: '#06D6A0',
    bg: 'rgba(6, 214, 160, 0.14)',
    border: '#06D6A0',
    pulse: false,
  },
  sightings: {
    label: 'Sighting',
    code: 'SGT',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.14)',
    border: '#3B82F6',
    pulse: false,
  },
  kindness: {
    label: 'Kindness',
    code: 'KND',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: '#10B981',
    pulse: false,
  },
  'small moments': {
    label: 'Small Moment',
    code: 'MOM',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.14)',
    border: '#8B5CF6',
    pulse: false,
  },
  vibes: {
    label: 'Vibes',
    code: 'VIB',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.14)',
    border: '#EC4899',
    pulse: false,
  },
}

export function triggerHaptic(type = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(10)
      else if (type === 'medium') navigator.vibrate(25)
      else if (type === 'heavy') navigator.vibrate([30, 40, 50])
      else if (type === 'stamp') navigator.vibrate([15, 20, 45])
    } catch {
      // Ignore vibration errors if restricted by device policy
    }
  }
}
