export type PostCategory = 'practical' | 'observation'
export type PostKind = 'route' | 'letter'

export type PracticalTag = 'delay' | 'crowding' | 'safety' | 'clear'
export type ObservationTag = 'sightings' | 'kindness' | 'small moments' | 'vibes'
export type DispatchTag = PracticalTag | ObservationTag

export interface Route {
  id: string
  name: string
}

export interface Station {
  id: string
  name: string
  lat: number
  lng: number
}

export interface Post {
  id: string
  body: string
  route_id: string | null
  station_id: string | null
  category: PostCategory
  emotion: string | null
  city: string | null
  kind: PostKind
  hidden: boolean
  report_count: number
  created_at: string
}

export interface Reaction {
  id: string
  post_id: string
  device_id: string
  type: string
}

export interface Comment {
  id: string
  post_id: string
  body: string
  hidden: boolean
  report_count: number
  created_at: string
}

export interface Report {
  id: string
  post_id: string | null
  comment_id: string | null
  device_id: string
  created_at: string
}

export interface RouteStatus {
  tag: string
  count: number
}

export interface LikesState {
  counts: Record<string, number>
  mine: Set<string>
}

export interface ModerationResult {
  kind: 'crisis' | 'abuse'
  message: string
}
