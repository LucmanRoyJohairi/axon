'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTicket } from '@/lib/api'
import type { Ticket } from '@/types'
import {
  statusClass, priorityClass, categoryClass,
  STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL,
  formatDate, timeAgo,
} from '@/lib/utils'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTicket(id)
      .then(t => { setTicket(t); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  if (loading) return <DetailSkeleton />
  if (error || !ticket) return (
    <div className="p-8 text-center">
      <p className="text-ink-3 mb-4">Ticket not found.</p>
      <Link href="/tickets" className="text-accent hover:underline text-sm">← Back to tickets</Link>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-ink-3 mb-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <Link href="/tickets" className="hover:text-ink transition-colors">Tickets</Link>
        <span>/</span>
        <span className="font-mono">#{ticket.id.slice(-8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title + status */}
          <div className="opacity-0 animate-fade-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-start gap-3 mb-3">
              <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status]}</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-ink text-balance leading-snug">
              {ticket.title}
            </h1>
            <p className="text-xs text-ink-3 mt-2">
              Opened {timeAgo(ticket.created_at)} · {formatDate(ticket.created_at)}
            </p>
          </div>

          {/* AI Analysis Card */}
          {ticket.ai_processed ? (
            <div
              className="opacity-0 animate-fade-up stagger-2"
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="card-inner p-4 border-l-2 border-l-accent/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-accent/15 border border-[#e8a840] flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-[#e8a840] tracking-wide">AI Triage</span>
                  <span className="text-ink-3 text-[10px] font-mono ml-auto">Claude</span>
                </div>

                {ticket.ai_summary && (
                  <p className="text-sm text-ink-2 leading-relaxed mb-3">
                    {ticket.ai_summary}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {ticket.ai_priority && (
                    <span className={priorityClass(ticket.ai_priority)}>
                      Priority: {PRIORITY_LABEL[ticket.ai_priority]}
                    </span>
                  )}
                  {ticket.ai_category && (
                    <span className={categoryClass(ticket.ai_category)}>
                      {CATEGORY_LABEL[ticket.ai_category]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card-inner p-4 opacity-0 animate-fade-up stagger-2"
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2 text-ink-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-accent/40 animate-pulse-slow" />
                AI is analyzing this ticket…
              </div>
            </div>
          )}

          {/* Description */}
          <div
            className="card p-5 opacity-0 animate-fade-up stagger-3"
            style={{ animationFillMode: 'forwards' }}
          >
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Description</h2>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

        </div>

        {/* Sidebar metadata */}
        <div
          className="space-y-4 opacity-0 animate-fade-up stagger-2"
          style={{ animationFillMode: 'forwards' }}
        >
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Details</h3>
            <dl className="space-y-3">
              <MetaRow label="Status">
                <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status]}</span>
              </MetaRow>
              <MetaRow label="Priority">
                {ticket.ai_priority
                  ? <span className={priorityClass(ticket.ai_priority)}>{PRIORITY_LABEL[ticket.ai_priority]}</span>
                  : <span className="text-ink-3 text-xs">—</span>}
              </MetaRow>
              <MetaRow label="Category">
                {ticket.ai_category
                  ? <span className={categoryClass(ticket.ai_category)}>{CATEGORY_LABEL[ticket.ai_category]}</span>
                  : <span className="text-ink-3 text-xs">—</span>}
              </MetaRow>
              <MetaRow label="Assignee">
                <span className="text-ink-3 text-xs">{ticket.assignee_id ? ticket.assignee_id.slice(0, 8) : 'Unassigned'}</span>
              </MetaRow>
            </dl>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Timeline</h3>
            <dl className="space-y-2">
              <MetaRow label="Created">
                <span className="text-ink-2 text-xs">{timeAgo(ticket.created_at)}</span>
              </MetaRow>
              <MetaRow label="Updated">
                <span className="text-ink-2 text-xs">{timeAgo(ticket.updated_at)}</span>
              </MetaRow>
              <MetaRow label="AI Processed">
                {ticket.ai_processed
                  ? <span className="text-emerald-400 text-xs">✓ Done</span>
                  : <span className="text-amber-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" /> Pending</span>}
              </MetaRow>
            </dl>
          </div>

          {/* Actions */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">Actions</h3>
            <div className="space-y-2">
              {(['in_progress', 'resolved'] as const).map(status => (
                <button
                  key={status}
                  className="w-full text-left px-3 py-2 text-xs text-ink-2 hover:text-ink border border-border hover:border-muted rounded-lg transition-colors"
                >
                  Mark as {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink-3 mt-3">Status updates connect to the backend in Week 2.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-ink-3 flex-shrink-0">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-3 bg-surface rounded w-32 mb-6" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-8 bg-surface rounded w-3/4" />
          <div className="card h-24" />
          <div className="card h-40" />
        </div>
        <div className="space-y-4">
          <div className="card h-40" />
          <div className="card h-32" />
        </div>
      </div>
    </div>
  )
}
