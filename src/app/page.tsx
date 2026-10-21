'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  useRoutesQuery,
  useRoutePostsQuery,
  useLikesQuery,
  useCommentsQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useReportItemMutation,
} from '@/lib/queries'
import { configured } from '@/lib/supabase'
import { statusByRoute } from '@/lib/status'
import { SlimHeroStrip } from '@/components/feed/SlimHeroStrip'
import { DepartureRibbon } from '@/components/board/DepartureRibbon'
import { LineConditions } from '@/components/board/LineConditions'
import { FilterRail } from '@/components/feed/FilterRail'
import { PostCard } from '@/components/feed/PostCard'
import { SidebarRail } from '@/components/ticket/SidebarRail'
import { AlertTriangle, PenTool, Inbox } from 'lucide-react'

export default function FrontPage() {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'practical' | 'observation'>('all')
  const [routeFilter, setRouteFilter] = useState<string>('all')

  const { data: routes = [], isLoading: routesLoading } = useRoutesQuery()
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useRoutePostsQuery()

  const postIds = useMemo(() => posts.map((p) => p.id), [posts])
  const { data: likes = { counts: {}, mine: new Set<string>() } } = useLikesQuery(postIds)
  const { data: commentsByPost = {} } = useCommentsQuery(postIds)

  const likeMutation = useLikePostMutation(postIds)
  const commentMutation = useAddCommentMutation(postIds)
  const reportMutation = useReportItemMutation()

  const routesById = useMemo(
    () => Object.fromEntries(routes.map((r) => [r.id, r.name])),
    [routes]
  )

  const statuses = useMemo(() => statusByRoute(posts), [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter
      const matchRoute = routeFilter === 'all' || p.route_id === routeFilter
      return matchCat && matchRoute
    })
  }, [posts, categoryFilter, routeFilter])

  async function handleLike(postId: string) {
    likeMutation.mutate(postId)
  }

  async function handleAddComment(postId: string, body: string): Promise<string | null> {
    try {
      await commentMutation.mutateAsync({ postId, body })
      return null
    } catch (e: unknown) {
      return e instanceof Error ? e.message : 'Failed to save comment'
    }
  }

  async function handleReportPost(postId: string) {
    await reportMutation.mutateAsync({ postId })
  }

  async function handleReportComment(commentId: string) {
    await reportMutation.mutateAsync({ commentId })
  }

  return (
    <div className="space-y-6">
      {/* Missing configuration notice */}
      {!configured && (
        <div
          className="p-4 bg-[var(--status-delay-bg)] border border-[var(--status-delay-border)] text-[var(--ink-primary)] rounded-sm text-xs font-mono mb-4 flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-[var(--accent-oxblood)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--accent-oxblood)] uppercase tracking-wider block mb-1">
              Supabase Project Connection Notice
            </strong>
            <p className="text-[var(--ink-secondary)] font-serif italic text-sm">
              Connect your database credentials in <code>.env</code> using{' '}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </div>
      )}

      {/* System Error notice */}
      {postsError && (
        <div
          className="p-4 bg-[var(--status-delay-bg)] border border-[var(--status-delay-border)] text-[var(--status-delay)] rounded-sm text-xs font-mono mb-4 flex items-center gap-2"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Notice: {(postsError as Error).message}</span>
        </div>
      )}

      {/* 12-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column (8 cols on desktop) */}
        <section className="lg:col-span-8 space-y-6" aria-label="Dispatch feed column">
          {/* 1. Dismissible Slim Hero Strip */}
          <SlimHeroStrip />

          {/* 2. Pausable Departure Ribbon */}
          <DepartureRibbon posts={posts} />

          {/* 3. Line Conditions Timetable Board */}
          <LineConditions
            routes={routes}
            statuses={statuses}
            selectedRouteId={routeFilter}
            onSelectRoute={setRouteFilter}
          />

          {/* 4. Filter Rail (Category tabs + route chips) */}
          <FilterRail
            categoryFilter={categoryFilter}
            onSelectCategory={setCategoryFilter}
            routeFilter={routeFilter}
            onSelectRoute={setRouteFilter}
            routes={routes}
          />

          {/* 5. Dispatch Feed */}
          {postsLoading || routesLoading ? (
            <div className="space-y-4 py-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-[var(--surface-card)] border border-[var(--rule-subtle)] rounded-sm animate-pulse"
                />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            /* Empty State */
            <div className="border border-[var(--rule-color)] bg-[var(--surface-card)] p-8 text-center rounded-sm shadow-paper-sm">
              <Inbox className="w-10 h-10 text-[var(--accent-brass)] mx-auto mb-3 opacity-80" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-1">
                No Dispatches on this Line
              </h3>
              <p className="font-serif italic text-sm text-[var(--ink-secondary)] mb-4 max-w-sm mx-auto">
                Be the first traveller to post a live delay, route condition, or quiet observation.
              </p>
              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ink-primary)] text-[var(--bg-app)] text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Dispatch a report</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  routeName={routesById[post.route_id || '']}
                  likeCount={likes.counts[post.id] || 0}
                  isLiked={likes.mine.has(post.id)}
                  comments={commentsByPost[post.id] || []}
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                  onReportPost={handleReportPost}
                  onReportComment={handleReportComment}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Rail (4 cols on desktop, sticky) */}
        <div className="lg:col-span-4">
          <SidebarRail />
        </div>
      </div>
    </div>
  )
}
