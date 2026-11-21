'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Ticket } from '@/types'
import { fetchTickets } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import TicketRow from '@/components/tickets/TicketRow'
import TicketFilters, { type TicketFilterState } from '@/components/tickets/TicketFilters'
import CreateTicketDialog from '@/components/tickets/CreateTicketDialog'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filters, setFilters] = useState<TicketFilterState>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchTickets(filters)
      setTickets(res.tickets)
      setTotal(res.total)
    } catch (err: any) {
      console.error('Error loading tickets:', err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.category)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Tickets</h1>
          <p className="text-ink-2 text-sm mt-0.5">{total} tickets total</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-accent text-bg font-semibold hover:bg-amber-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          New Ticket
        </Button>
      </div>

      <TicketFilters filters={filters} onChange={setFilters} />

      <Card
        className="bg-surface border-border rounded-xl divide-y divide-border py-0 gap-0 overflow-hidden opacity-0 animate-fade-up stagger-2"
        style={{ animationFillMode: 'forwards' }}
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 space-y-2">
              <Skeleton className="h-4 w-2/3 bg-surface-2" />
              <Skeleton className="h-3 w-1/3 bg-surface-2" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-ink-3 text-sm">
            {hasActiveFilters
              ? 'No tickets match your filters.'
              : 'No tickets created yet. Click "New Ticket" to get started!'}
          </div>
        ) : (
          tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </Card>

      <CreateTicketDialog open={showCreate} onOpenChange={setShowCreate} onCreated={load} />
    </div>
  )
}
