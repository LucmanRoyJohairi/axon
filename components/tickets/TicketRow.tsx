import Link from 'next/link'
import type { Ticket } from '@/types'
import {
  statusClass,
  priorityClass,
  categoryClass,
  STATUS_LABEL,
  PRIORITY_LABEL,
  CATEGORY_LABEL,
  timeAgo,
} from '@/lib/utils'
import { getEffectivePriority, getEffectiveCategory } from '@/lib/tickets'

export default function TicketRow({ ticket }: { ticket: Ticket }) {
  const priority = getEffectivePriority(ticket)
  const category = getEffectiveCategory(ticket)
  const isAnalyzing = !ticket.ai_processed && (!priority || priority === 'pending')

  return (
    <Link href={`/tickets/${ticket.id}`} className="block px-5 py-4 hover:bg-surface-2 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {isAnalyzing && (
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
            {priority && <span className={priorityClass(priority)}>{PRIORITY_LABEL[priority]}</span>}
            {category && <span className={categoryClass(category)}>{CATEGORY_LABEL[category]}</span>}
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
