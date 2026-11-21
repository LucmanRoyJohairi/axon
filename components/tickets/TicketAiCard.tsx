import type { Ticket } from '@/types'
import { priorityClass, categoryClass, PRIORITY_LABEL, CATEGORY_LABEL } from '@/lib/utils'
import { getEffectivePriority, getEffectiveCategory } from '@/lib/tickets'

export default function TicketAiCard({ ticket }: { ticket: Ticket }) {
  const priority = getEffectivePriority(ticket)
  const category = getEffectiveCategory(ticket)

  if (!ticket.ai_processed) {
    return (
      <div
        className="card-inner p-4 opacity-0 animate-fade-up stagger-2 bg-zinc-900/20 border border-border/40 rounded-xl"
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="flex items-center gap-2 text-ink-3 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent/60 animate-pulse-slow" />
          AI is analyzing this ticket…
        </div>
      </div>
    )
  }

  return (
    <div className="opacity-0 animate-fade-up stagger-2" style={{ animationFillMode: 'forwards' }}>
      <div className="card-inner p-4 border-l-2 border-l-accent/40 bg-zinc-900/40 rounded-r-xl border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-accent/15 border border-[#e8a840]/40 flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-[#e8a840] tracking-wide">AI Triage</span>
          <span className="text-ink-3 text-[10px] font-mono ml-auto">Claude</span>
        </div>

        {ticket.ai_summary && (
          <p className="text-sm text-ink-2 leading-relaxed mb-3">{ticket.ai_summary}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {priority && (
            <span className={priorityClass(priority)}>
              Priority: {PRIORITY_LABEL[priority] || priority}
            </span>
          )}
          {category && (
            <span className={categoryClass(category)}>
              {CATEGORY_LABEL[category] || category}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
