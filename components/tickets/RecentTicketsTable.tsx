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
import { Card } from '@/components/ui/card'

export default function RecentTicketsTable({ recent }: { recent: Ticket[] }) {
  return (
    <Card
      className="lg:col-span-2 bg-surface border-border rounded-xl overflow-hidden py-0 gap-0 opacity-0 animate-fade-up stagger-3"
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Recent Tickets</h2>
        <Link href="/tickets" className="text-xs font-medium text-accent hover:text-amber-300 transition-colors">
          View all →
        </Link>
      </div>
      <div className="divide-y divide-border">
        {recent.map((ticket) => {
          const priority = getEffectivePriority(ticket)
          const category = getEffectiveCategory(ticket)
          const isAnalyzing = !ticket.ai_processed && (!priority || priority === 'pending')

          return (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block px-5 py-4 hover:bg-surface-2 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] text-ink group-hover:text-accent transition-colors truncate font-medium">
                    {ticket.title}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status]}</span>
                    {priority && (
                      <span className={priorityClass(priority)}>{PRIORITY_LABEL[priority]}</span>
                    )}
                    {category && (
                      <span className={categoryClass(category)}>{CATEGORY_LABEL[category]}</span>
                    )}
                    {isAnalyzing && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-accent/10 text-accent border border-accent/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                        AI analyzing…
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-ink-3 text-xs flex-shrink-0 pt-0.5">{timeAgo(ticket.created_at)}</div>
              </div>
              {ticket.ai_summary && (
                <p className="text-[13px] text-ink-2 mt-2.5 leading-relaxed line-clamp-1">
                  <span className="text-accent font-mono text-[11px] font-semibold mr-1.5">AI</span>
                  {ticket.ai_summary}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
