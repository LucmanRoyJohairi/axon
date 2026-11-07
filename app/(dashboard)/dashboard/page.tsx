'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getTickets } from '@/lib/api'
import type { DashboardStats, Ticket } from '@/types'
import { statusClass, priorityClass, categoryClass, STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL, timeAgo } from '@/lib/utils'
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import RecentTicketsTable from '@/components/tickets/RecentTicketsTable'
import StatCardsContainer from '@/components/ui/StatCardsContainer'


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

  // right now using static data, will replace with api call once api is ready
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
      <StatCardsContainer statCards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent tickets */}
        <RecentTicketsTable
          recent={recent}
          statusClass={statusClass}
          priorityClass={priorityClass}
          categoryClass={categoryClass}
          STATUS_LABEL={STATUS_LABEL}
          PRIORITY_LABEL={PRIORITY_LABEL}
          CATEGORY_LABEL={CATEGORY_LABEL}
          timeAgo={timeAgo}
        
        />

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

