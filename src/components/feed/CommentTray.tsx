'use client'

import React, { useState } from 'react'
import { Comment } from '@/types/database'
import { checkText } from '@/lib/moderation'
import { timeAgo } from '@/lib/status'
import { Send, Flag, Check } from 'lucide-react'

interface CommentTrayProps {
  postId: string
  comments: Comment[]
  onAddComment: (postId: string, body: string) => Promise<string | null>
  onReportComment: (commentId: string) => Promise<void>
}

export function CommentTray({
  postId,
  comments,
  onAddComment,
  onReportComment,
}: CommentTrayProps) {
  const [text, setText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reportedComments, setReportedComments] = useState<Set<string>>(new Set())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const problem = checkText(trimmed)
    if (problem) {
      setErrorMsg(problem.message)
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    try {
      const err = await onAddComment(postId, trimmed)
      if (err) {
        setErrorMsg(err)
      } else {
        setText('')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to post note.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReport(id: string) {
    if (reportedComments.has(id)) return
    try {
      await onReportComment(id)
      setReportedComments((prev) => new Set(prev).add(id))
    } catch {
      // Ignore error
    }
  }

  return (
    <div className="pt-3 mt-3 border-t border-dashed border-[var(--rule-dashed)] select-text">
      {/* List of comments */}
      <div className="space-y-2 mb-3">
        {comments.map((c) => {
          const isReported = reportedComments.has(c.id)

          return (
            <div
              key={c.id}
              className="p-2.5 bg-[var(--surface-tint)] rounded-sm border border-[var(--rule-subtle)] text-xs text-[var(--ink-primary)]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap leading-relaxed">{c.body}</p>
                <span className="font-mono text-[10px] text-[var(--ink-muted)] shrink-0">
                  {timeAgo(c.created_at)}
                </span>
              </div>

              <div className="flex justify-end mt-1.5">
                <button
                  onClick={() => handleReport(c.id)}
                  disabled={isReported}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--ink-muted)] hover:text-[var(--accent-oxblood)] uppercase disabled:opacity-50"
                >
                  {isReported ? (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      <span>Reported</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-2.5 h-2.5" />
                      <span>Report note</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}

        {comments.length === 0 && (
          <p className="font-serif italic text-xs text-[var(--ink-muted)] py-1">
            No traveller notes posted yet on this dispatch.
          </p>
        )}
      </div>

      {/* New comment input form */}
      <form onSubmit={handleSubmit} className="space-y-1.5">
        {errorMsg && (
          <div className="p-2 bg-[var(--status-delay-bg)] border border-[var(--status-delay-border)] text-[var(--status-delay)] text-xs rounded-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (errorMsg) setErrorMsg('')
            }}
            maxLength={280}
            placeholder="Write a passenger note on this report..."
            className="flex-1 px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--rule-color)] rounded-sm text-xs text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--ink-primary)] text-[var(--bg-app)] text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-[var(--ink-muted)] px-1">
          <span>Max 280 characters &bull; Moderated</span>
          <span>{text.length}/280</span>
        </div>
      </form>
    </div>
  )
}
