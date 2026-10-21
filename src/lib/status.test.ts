import { describe, it, expect } from 'vitest'
import { statusByRoute, timeAgo } from './status'
import { Post } from '@/types/database'

describe('Route Status & Time Formatting', () => {
  it('correctly aggregates most frequent practical status within 60 minutes', () => {
    const now = Date.now()
    const mockPosts: Post[] = [
      {
        id: '1',
        body: 'Delay near Churchgate',
        route_id: 'route-a',
        station_id: null,
        category: 'practical',
        emotion: 'delay',
        city: null,
        kind: 'route',
        hidden: false,
        report_count: 0,
        created_at: new Date(now - 10 * 60 * 1000).toISOString(), // 10 mins ago
      },
      {
        id: '2',
        body: 'Another delay notice',
        route_id: 'route-a',
        station_id: null,
        category: 'practical',
        emotion: 'delay',
        city: null,
        kind: 'route',
        hidden: false,
        report_count: 0,
        created_at: new Date(now - 15 * 60 * 1000).toISOString(), // 15 mins ago
      },
      {
        id: '3',
        body: 'Actually moving now',
        route_id: 'route-a',
        station_id: null,
        category: 'practical',
        emotion: 'clear',
        city: null,
        kind: 'route',
        hidden: false,
        report_count: 0,
        created_at: new Date(now - 20 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        body: 'Very old post from 2 hours ago',
        route_id: 'route-a',
        station_id: null,
        category: 'practical',
        emotion: 'crowding',
        city: null,
        kind: 'route',
        hidden: false,
        report_count: 0,
        created_at: new Date(now - 120 * 60 * 1000).toISOString(), // 2 hours ago (outside 60m window)
      },
      {
        id: '5',
        body: 'Lovely rain vibe',
        route_id: 'route-a',
        station_id: null,
        category: 'observation', // observation should not affect practical status
        emotion: 'vibes',
        city: null,
        kind: 'route',
        hidden: false,
        report_count: 0,
        created_at: new Date(now - 5 * 60 * 1000).toISOString(),
      },
    ]

    const result = statusByRoute(mockPosts)
    expect(result['route-a']).toBeDefined()
    expect(result['route-a'].tag).toBe('delay')
    expect(result['route-a'].count).toBe(2)
  })

  it('formats timeAgo relative strings accurately', () => {
    const now = Date.now()
    expect(timeAgo(new Date(now - 20000).toISOString())).toBe('just now')
    expect(timeAgo(new Date(now - 8 * 60000).toISOString())).toBe('8m ago')
    expect(timeAgo(new Date(now - 3 * 3600000).toISOString())).toBe('3h ago')
    expect(timeAgo(new Date(now - 2 * 86400000).toISOString())).toBe('2d ago')
  })
})
