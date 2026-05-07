import Link from "next/link";
import type {Ticket} from "@/types";

export default function RecentTicketsTable({recent, statusClass, priorityClass, categoryClass, STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL, timeAgo}:any){

    return <div
          className="lg:col-span-2 card opacity-0 animate-fade-up stagger-3"
          style={{ animationFillMode: 'forwards' }}
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Tickets</h2>
            <Link href="/tickets" className="text-xs text-accent hover:text-amber-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((ticket:Ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block px-5 py-3.5 hover:bg-surface-2 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink group-hover:text-accent transition-colors truncate font-medium">
                      {ticket.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={statusClass(ticket.status)}>{STATUS_LABEL[ticket.status]}</span>
                      {ticket.ai_priority && (
                        <span className={priorityClass(ticket.ai_priority)}>{PRIORITY_LABEL[ticket.ai_priority]}</span>
                      )}
                      {ticket.ai_category && (
                        <span className={categoryClass(ticket.ai_category)}>{CATEGORY_LABEL[ticket.ai_category]}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-ink-3 text-xs flex-shrink-0 pt-0.5">{timeAgo(ticket.created_at)}</div>
                </div>
                {/* AI summary preview */}
                {ticket.ai_summary && (
                  <p className="text-xs text-ink-2 mt-2 leading-relaxed line-clamp-1">
                    <span className="text-accent/60 font-mono text-[10px] mr-1.5">AI</span>
                    {ticket.ai_summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
}