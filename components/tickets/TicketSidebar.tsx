'use client'

import { useState } from 'react'
import type { Ticket, TicketStatus } from '@/types'
import {
  statusClass,
  priorityClass,
  categoryClass,
  STATUS_LABEL,
  PRIORITY_LABEL,
  CATEGORY_LABEL,
  timeAgo,
} from '@/lib/utils'
import { updateTicketStatus, getEffectivePriority, getEffectiveCategory } from '@/lib/tickets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TicketSidebar({
  ticket,
  onUpdated,
}: {
  ticket: Ticket
  onUpdated: (updated: Ticket) => void
}) {
  const [updatingStatus, setUpdatingStatus] = useState<TicketStatus | null>(null)
  const priority = getEffectivePriority(ticket)
  const category = getEffectiveCategory(ticket)

  async function handleStatusChange(nextStatus: TicketStatus) {
    if (ticket.status === nextStatus) return
    setUpdatingStatus(nextStatus)
    try {
      const updated = await updateTicketStatus(ticket.id, nextStatus)
      onUpdated(updated)
    } catch (err: any) {
      console.error('Failed to update status:', err.message)
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <div className="space-y-4 opacity-0 animate-fade-up stagger-2" style={{ animationFillMode: 'forwards' }}>
      <Card className="bg-surface border-border rounded-xl p-4 gap-3">
        <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Details</h3>
        <dl className="space-y-3">
          <MetaRow label="Status">
            <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status] || ticket.status}</span>
          </MetaRow>
          <MetaRow label="Priority">
            {priority ? (
              <span className={priorityClass(priority)}>{PRIORITY_LABEL[priority] || priority}</span>
            ) : (
              <span className="text-ink-3 text-xs">—</span>
            )}
          </MetaRow>
          <MetaRow label="Category">
            {category ? (
              <span className={categoryClass(category)}>{CATEGORY_LABEL[category] || category}</span>
            ) : (
              <span className="text-ink-3 text-xs">—</span>
            )}
          </MetaRow>
          <MetaRow label="Assignee">
            <span className="text-ink-3 text-xs">
              {ticket.assignee_id ? ticket.assignee_id.slice(0, 8).toUpperCase() : 'Unassigned'}
            </span>
          </MetaRow>
        </dl>
      </Card>

      <Card className="bg-surface border-border rounded-xl p-4 gap-3">
        <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Timeline</h3>
        <dl className="space-y-2">
          <MetaRow label="Created">
            <span className="text-ink-2 text-xs">{timeAgo(ticket.created_at)}</span>
          </MetaRow>
          <MetaRow label="Updated">
            <span className="text-ink-2 text-xs">{timeAgo(ticket.updated_at)}</span>
          </MetaRow>
          <MetaRow label="AI Processed">
            {ticket.ai_processed ? (
              <span className="text-emerald-400 text-xs">✓ Done</span>
            ) : (
              <span className="text-amber-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" /> Pending
              </span>
            )}
          </MetaRow>
        </dl>
      </Card>

      <Card className="bg-surface border-border rounded-xl p-4 gap-3">
        <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Actions</h3>
        <div className="space-y-2">
          {(['open', 'in_progress', 'resolved'] as const)
            .filter((s) => s !== ticket.status)
            .map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                disabled={updatingStatus !== null}
                onClick={() => handleStatusChange(status)}
                className="w-full justify-start text-xs text-ink-2 hover:text-ink border-border bg-transparent hover:bg-surface-2"
              >
                {updatingStatus === status ? 'Updating…' : `Mark as ${STATUS_LABEL[status]}`}
              </Button>
            ))}
        </div>
      </Card>
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
