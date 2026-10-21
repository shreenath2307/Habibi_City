'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Post, Comment } from '@/types/database'
import { getRouteColor, STATUS_META } from '@/lib/themeConstants'
import { TAG_LABEL } from '@/lib/moderation'
import { timeAgo } from '@/lib/status'
import { CommentTray } from './CommentTray'
import { Heart, MessageSquare, Flag, Check } from 'lucide-react'

interface PostCardProps {
  post: Post
  routeName?: string
  likeCount: number
  isLiked: boolean
  comments: Comment[]
  onLike: (postId: string) => Promise<void>
  onAddComment: (postId: string, body: string) => Promise<string | null>
  onReportPost: (postId: string) => Promise<void>
  onReportComment: (commentId: string) => Promise<void>
}

export function PostCard({
  post,
  routeName,
  likeCount,
  isLiked,
  comments,
  onLike,
  onAddComment,
  onReportPost,
  onReportComment,
}: PostCardProps) {
  const [trayOpen, setTrayOpen] = useState(false)
  const [reported, setReported] = useState(false)
  const [stampAnimation, setStampAnimation] = useState(false)
  const lastTapRef = useRef(0)

  const lineTheme = getRouteColor(post.route_id)
  const meta = STATUS_META[post.emotion || 'clear'] || STATUS_META.clear
  const Icon = meta.icon

  // Double tap to like with ink stamp effect
  function handleTap() {
    const now = Date.now()
    if (now - lastTapRef.current < 320) {
      triggerLike()
    }
    lastTapRef.current = now
  }

  function triggerLike() {
    if (!isLiked) {
      onLike(post.id)
    }
    setStampAnimation(true)
    setTimeout(() => setStampAnimation(false), 600)
  }

  async function handleReport() {
    if (reported) return
    try {
      await onReportPost(post.id)
      setReported(true)
    } catch {
      // Ignore
    }
  }

  return (
    <div className="relative mb-4 select-text">
      <motion.article
        onClick={handleTap}
        className="relative bg-[var(--surface-card)] border border-[var(--rule-subtle)] p-4 sm:p-5 rounded-sm shadow-paper-sm transition-shadow hover:shadow-paper-md"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: lineTheme.hex,
        }}
      >
        {/* Ink Stamp Overlay Effect on Double Tap */}
        <AnimatePresence>
          {stampAnimation && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
              animate={{ scale: 1.2, opacity: 0.85, rotate: -8 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="border-2 border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] px-3 py-1 font-mono uppercase tracking-widest text-xs font-bold rounded-sm rotate-[-8deg] bg-[var(--bg-app)]/90 shadow-sm">
                &bull; APPROVED &bull;
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Header: Route code, Tag badge, and Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {routeName && (
              <span
                style={{ borderColor: lineTheme.hex, color: lineTheme.hex }}
                className="font-mono text-xs font-bold border px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[var(--surface-tint)]"
              >
                {routeName}
              </span>
            )}

            <div
              style={{
                borderColor: meta.borderColor,
                color: meta.color,
                backgroundColor: meta.bgColor,
              }}
              className="flex items-center gap-1 font-mono text-[11px] border px-2 py-0.5 rounded-sm"
            >
              <Icon className="w-3 h-3" strokeWidth={1.5} />
              <span className="uppercase tracking-wider">
                {TAG_LABEL[post.emotion || 'clear'] || post.emotion}
              </span>
            </div>
          </div>

          <span className="font-mono text-xs text-[var(--ink-muted)]">
            {timeAgo(post.created_at)}
          </span>
        </div>

        {/* Body Text */}
        <p className="font-serif text-[17px] sm:text-[18px] text-[var(--ink-primary)] leading-[1.58] mb-4 whitespace-pre-wrap break-words">
          {post.body}
        </p>

        {/* Action Controls: Like, Comment, Report */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--rule-subtle)] font-mono text-xs">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                triggerLike()
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors ${
                isLiked
                  ? 'bg-[var(--status-delay-bg)] border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
                  : 'border-[var(--rule-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--rule-color)]'
              }`}
              aria-label={isLiked ? 'Unlike dispatch' : 'Like dispatch'}
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={isLiked ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
              <span>{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTrayOpen((prev) => !prev)}
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors ${
                trayOpen
                  ? 'bg-[var(--surface-elevated)] border-[var(--rule-color)] text-[var(--ink-primary)] font-semibold'
                  : 'border-[var(--rule-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--rule-color)]'
              }`}
              aria-expanded={trayOpen}
              aria-label="Notes on this dispatch"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{comments.length}</span>
            </button>
          </div>

          {/* Report Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleReport()
            }}
            disabled={reported}
            className={`inline-flex items-center gap-1 uppercase tracking-wider text-[11px] transition-colors ${
              reported
                ? 'text-[var(--accent-oxblood)] opacity-70'
                : 'text-[var(--ink-muted)] hover:text-[var(--accent-oxblood)]'
            }`}
            aria-label="Report this dispatch"
          >
            {reported ? (
              <>
                <Check className="w-3 h-3" />
                <span>Reported</span>
              </>
            ) : (
              <>
                <Flag className="w-3 h-3" strokeWidth={1.5} />
                <span>Report</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Comment Tray */}
        {trayOpen && (
          <CommentTray
            postId={post.id}
            comments={comments}
            onAddComment={onAddComment}
            onReportComment={onReportComment}
          />
        )}
      </motion.article>
    </div>
  )
}
