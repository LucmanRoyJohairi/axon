'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getTickets } from '@/lib/api'
import type { DashboardStats, Ticket } from '@/types'
import { statusClass, priorityClass, categoryClass, STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL, timeAgo } from '@/lib/utils'
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getTickets({ page: 1 })]).then(([s, t]) => {
      setStats(s)
      setRecent(t.tickets.slice(0, 5))
      setLoading(false)
    })
  }, [])

  if (loading) return <DashboardSkeleton />

  const statCards = [
    { label: 'Total Tickets', value: stats!.total_tickets, sub: 'all time', color: 'text-ink' },
    { label: 'Open', value: stats!.open_tickets, sub: 'need attention', color: 'text-sky-400' },
    { label: 'In Progress', value: stats!.in_progress_tickets, sub: 'being worked on', color: 'text-amber-400' },
    { label: 'AI Processed', value: stats!.ai_processed_tickets, sub: `of ${stats!.total_tickets} total`, color: 'text-accent' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-ink-2 text-sm mt-1">Overview of your support queue and AI triage status.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="card p-5 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          >
            <div className="text-ink-3 text-xs font-medium tracking-wide uppercase mb-2">{card.label}</div>
            <div className={`text-3xl font-display font-semibold ${card.color} leading-none mb-1`}>
              {card.value}
            </div>
            <div className="text-ink-3 text-xs">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent tickets */}
        <div
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
            {recent.map(ticket => (
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

        {/* Breakdown charts */}
        <div className="space-y-4">
          <BarBreakdown
            title="By Priority"
            data={stats!.tickets_by_priority}
            total={stats!.total_tickets}
            colorMap={{ critical: '#f87171', high: '#fb923c', medium: '#60a5fa', low: '#6b7280' }}
            delay="stagger-4"
          />
          <BarBreakdown
            title="By Category"
            data={stats!.tickets_by_category}
            total={stats!.total_tickets}
            colorMap={{ bug: '#f87171', feature: '#a78bfa', billing: '#34d399', support: '#22d3ee', other: '#6b7280' }}
            delay="stagger-5"
          />
        </div>

      </div>
    </div>
  )
}

function BarBreakdown({
  title, data, total, colorMap, delay
}: {
  title: string
  data: Record<string, number>
  total: number
  colorMap: Record<string, string>
  delay: string
}) {
  return (
    <div className={`card p-4 opacity-0 animate-fade-up ${delay}`} style={{ animationFillMode: 'forwards' }}>
      <div className="text-xs font-semibold text-ink-2 uppercase tracking-wide mb-3">{title}</div>
      <div className="space-y-2.5">
        {Object.entries(data).map(([key, count]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-2 capitalize">{key}</span>
              <span className="text-ink-3 font-mono">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((count / total) * 100)}%`,
                  backgroundColor: colorMap[key] ?? '#6b7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

