'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Ticket } from '@/types'
import { statusClass, STATUS_LABEL, formatDate, timeAgo } from '@/lib/utils'
import { fetchTicketById } from '@/lib/tickets'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import TicketAiCard from '@/components/tickets/TicketAiCard'
import TicketSidebar from '@/components/tickets/TicketSidebar'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchTicketById(id)
      .then(setTicket)
      .catch((e: any) => setError(e.message || 'Ticket not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-3 w-32 bg-surface" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4 bg-surface" />
            <Skeleton className="h-24 w-full rounded-xl bg-surface" />
            <Skeleton className="h-40 w-full rounded-xl bg-surface" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl bg-surface" />
            <Skeleton className="h-32 w-full rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-3 mb-4">Ticket not found.</p>
        <Link href="/tickets" className="text-accent hover:underline text-sm">
          ← Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-ink-3 mb-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <Link href="/tickets" className="hover:text-ink transition-colors">Tickets</Link>
        <span>/</span>
        <span className="font-mono">#{ticket.id.slice(-8).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="opacity-0 animate-fade-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-start gap-3 mb-3">
              <span className={statusClass(ticket.status)}>
                {STATUS_LABEL[ticket.status] || ticket.status}
              </span>
            </div>
            <h1 className="font-display text-xl font-semibold text-ink text-balance leading-snug">
              {ticket.title}
            </h1>
            <p className="text-xs text-ink-3 mt-2">
              Opened {timeAgo(ticket.created_at)} · {formatDate(ticket.created_at)}
            </p>
          </div>

          <TicketAiCard ticket={ticket} />

          <Card
            className="bg-surface border-border rounded-xl p-5 gap-3 opacity-0 animate-fade-up stagger-3"
            style={{ animationFillMode: 'forwards' }}
          >
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Description</h2>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">
              {ticket.description || 'No description explicitly provided.'}
            </p>
          </Card>
        </div>

        <TicketSidebar ticket={ticket} onUpdated={setTicket} />
      </div>
    </div>
  )
}
