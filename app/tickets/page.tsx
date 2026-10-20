'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getTickets, createTicket } from '@/lib/api'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types'
import { statusClass, priorityClass, categoryClass, STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL, timeAgo } from '@/lib/utils'

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITIES: TicketPriority[] = ['critical', 'high', 'medium', 'low']
const CATEGORIES: TicketCategory[] = ['bug', 'feature', 'billing', 'support', 'other']

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const [filters, setFilters] = useState<{
    status?: string; priority?: string; category?: string
  }>({})

  const load = useCallback(() => {
    setLoading(true)
    getTickets(filters).then(res => {
      setTickets(res.tickets)
      setTotal(res.total)
      setLoading(false)
    })
  }, [filters])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Tickets</h1>
          <p className="text-ink-2 text-sm mt-0.5">{total} tickets total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-bg text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-2 mb-5 opacity-0 animate-fade-up stagger-1"
        style={{ animationFillMode: 'forwards' }}
      >
        <FilterChips
          label="Status"
          options={STATUSES}
          labelMap={STATUS_LABEL}
          value={filters.status}
          onChange={v => setFilters(f => ({ ...f, status: v }))}
        />
        <FilterChips
          label="Priority"
          options={PRIORITIES}
          labelMap={PRIORITY_LABEL}
          value={filters.priority}
          onChange={v => setFilters(f => ({ ...f, priority: v }))}
        />
        <FilterChips
          label="Category"
          options={CATEGORIES}
          labelMap={CATEGORY_LABEL}
          value={filters.category}
          onChange={v => setFilters(f => ({ ...f, category: v }))}
        />
        {(filters.status || filters.priority || filters.category) && (
          <button
            onClick={() => setFilters({})}
            className="text-xs text-ink-3 hover:text-ink px-2 py-1 rounded border border-border hover:border-muted transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ticket list */}
      <div
        className="card divide-y divide-border opacity-0 animate-fade-up stagger-2"
        style={{ animationFillMode: 'forwards' }}
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="h-4 bg-surface-2 rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-2 rounded w-1/3" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-ink-3 text-sm">
            No tickets match your filters.
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load() }}
        />
      )}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="block px-5 py-4 hover:bg-surface-2 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {/* AI processing indicator */}
            {!ticket.ai_processed && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent/70 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-pulse-slow" />
                AI analyzing…
              </span>
            )}
            <span className="text-ink-3 font-mono text-[10px]">#{ticket.id.slice(-4)}</span>
          </div>
          <div className="text-sm font-medium text-ink group-hover:text-accent transition-colors truncate mb-2">
            {ticket.title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status]}</span>
            {ticket.ai_priority && <span className={priorityClass(ticket.ai_priority)}>{PRIORITY_LABEL[ticket.ai_priority]}</span>}
            {ticket.ai_category && <span className={categoryClass(ticket.ai_category)}>{CATEGORY_LABEL[ticket.ai_category]}</span>}
          </div>
          {ticket.ai_summary && (
            <p className="text-xs text-ink-2 mt-2 line-clamp-1">
              <span className="text-accent/50 font-mono text-[10px] mr-1.5">AI</span>
              {ticket.ai_summary}
            </p>
          )}
        </div>
        <div className="text-ink-3 text-xs flex-shrink-0 mt-0.5">{timeAgo(ticket.created_at)}</div>
      </div>
    </Link>
  )
}

function FilterChips<T extends string>({
  label, options, labelMap, value, onChange,
}: {
  label: string
  options: T[]
  labelMap: Record<T, string>
  value: string | undefined
  onChange: (v: string | undefined) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink-3 text-xs">{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? undefined : opt)}
          className={`px-2.5 py-1 rounded text-xs transition-all ${
            value === opt
              ? 'bg-accent/15 text-accent border border-accent/30'
              : 'text-ink-3 border border-border hover:border-muted hover:text-ink-2'
          }`}
        >
          {labelMap[opt]}
        </button>
      ))}
    </div>
  )
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    await createTicket({ title, description })
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg p-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">New Ticket</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed explanation — the AI will analyze this to suggest a category and priority."
              rows={4}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
          <p className="text-xs text-ink-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse-slow" />
            AI will auto-triage after submission
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-ink-2 hover:text-ink border border-border rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !description.trim()}
              className="px-4 py-2 text-sm font-semibold bg-accent text-bg rounded-lg hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
