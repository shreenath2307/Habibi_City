import {
  AlertTriangle,
  Users,
  ShieldAlert,
  CheckCircle,
  Eye,
  HeartHandshake,
  Feather,
  Sparkles,
} from 'lucide-react'
import React from 'react'

export interface HeritageRouteColor {
  id: string
  name: string
  hex: string
  bg: string
  border: string
}

export const HERITAGE_ROUTES: HeritageRouteColor[] = [
  { id: 'oxblood', name: 'Oxblood Line', hex: '#7A1F2B', bg: 'rgba(122, 31, 43, 0.08)', border: '#7A1F2B' },
  { id: 'navy', name: 'Royal Navy Line', hex: '#1D2B4A', bg: 'rgba(29, 43, 74, 0.08)', border: '#1D2B4A' },
  { id: 'green', name: 'Bottle Green Line', hex: '#1F4D3A', bg: 'rgba(31, 77, 58, 0.08)', border: '#1F4D3A' },
  { id: 'brass', name: 'Antique Brass Line', hex: '#A67C2E', bg: 'rgba(166, 124, 46, 0.08)', border: '#A67C2E' },
  { id: 'plum', name: 'Heritage Plum Line', hex: '#4A203B', bg: 'rgba(74, 32, 59, 0.08)', border: '#4A203B' },
]

export function getRouteColor(routeId?: string | null, index = 0): HeritageRouteColor {
  if (!routeId) return HERITAGE_ROUTES[index % HERITAGE_ROUTES.length]
  let hash = 0
  for (let i = 0; i < routeId.length; i++) {
    hash = (hash << 5) - hash + routeId.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % HERITAGE_ROUTES.length
  return HERITAGE_ROUTES[idx]
}

export interface StatusMetaItem {
  label: string
  code: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  symbol: string
}

export const STATUS_META: Record<string, StatusMetaItem> = {
  delay: {
    label: 'Delayed',
    code: 'DLY',
    color: '#7A1F2B',
    bgColor: 'rgba(122, 31, 43, 0.08)',
    borderColor: '#7A1F2B',
    icon: AlertTriangle,
    symbol: '▲',
  },
  crowding: {
    label: 'Crowded',
    code: 'CRW',
    color: '#A67C2E',
    bgColor: 'rgba(166, 124, 46, 0.10)',
    borderColor: '#A67C2E',
    icon: Users,
    symbol: '◆',
  },
  safety: {
    label: 'Safety concern',
    code: 'SEC',
    color: '#4A203B',
    bgColor: 'rgba(74, 32, 59, 0.08)',
    borderColor: '#4A203B',
    icon: ShieldAlert,
    symbol: '◈',
  },
  clear: {
    label: 'All clear',
    code: 'CLR',
    color: '#1F4D3A',
    bgColor: 'rgba(31, 77, 58, 0.08)',
    borderColor: '#1F4D3A',
    icon: CheckCircle,
    symbol: '○',
  },
  sightings: {
    label: 'Sighting',
    code: 'SGT',
    color: '#1D2B4A',
    bgColor: 'rgba(29, 43, 74, 0.08)',
    borderColor: '#1D2B4A',
    icon: Eye,
    symbol: '◇',
  },
  kindness: {
    label: 'Kindness',
    code: 'KND',
    color: '#1F4D3A',
    bgColor: 'rgba(31, 77, 58, 0.08)',
    borderColor: '#1F4D3A',
    icon: HeartHandshake,
    symbol: '♡',
  },
  'small moments': {
    label: 'Small moment',
    code: 'MOM',
    color: '#4A203B',
    bgColor: 'rgba(74, 32, 59, 0.08)',
    borderColor: '#4A203B',
    icon: Feather,
    symbol: '※',
  },
  vibes: {
    label: 'Vibes',
    code: 'VIB',
    color: '#A67C2E',
    bgColor: 'rgba(166, 124, 46, 0.08)',
    borderColor: '#A67C2E',
    icon: Sparkles,
    symbol: '✦',
  },
}
