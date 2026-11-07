'use client'

import { useEffect, useState } from 'react'
import type { DashboardStats, Ticket } from '@/types'
import { statusClass, priorityClass, categoryClass, STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL, timeAgo } from '@/lib/utils'
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import RecentTicketsTable from '@/components/tickets/RecentTicketsTable'
import StatCardsContainer from '@/components/ui/StatCardsContainer'
import { createClient } from '@/utils/supabase/client' // Import client utility
import Link from 'next/link'


export default function DashboardPage() {
  const supabase = createClient() // Initialize browser client
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch tickets from Supabase table
        // Ordered by creation date to show the newest rows first
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const fallbackTickets = tickets || []

        // 2. Safely parse and calculate realtime dashboard analytics aggregates
        const total = fallbackTickets.length
        const open = fallbackTickets.filter(t => t.status === 'open').length
        const inProgress = fallbackTickets.filter(t => t.status === 'in_progress').length
        
        // Assuming AI processed items are categorized or don't have a 'pending' state
        const aiProcessed = fallbackTickets.filter(t => t.priority !== 'pending' && t.category).length

        // Initialize object keys to match breakdown chart requirements
        const priorityBreakdown: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
        const categoryBreakdown: Record<string, number> = { bug: 0, feature: 0, billing: 0, support: 0, other: 0 }

        fallbackTickets.forEach(ticket => {
          if (ticket.priority && ticket.priority in priorityBreakdown) {
            priorityBreakdown[ticket.priority]++
          }
          if (ticket.category && ticket.category in categoryBreakdown) {
            categoryBreakdown[ticket.category]++
          } else if (ticket.category) {
            categoryBreakdown['other']++
          }
        })

        // 3. Map aggregates onto your expected DashboardStats interface structure
        setStats({
          total_tickets: total,
          open_tickets: open,
          in_progress_tickets: inProgress,
          ai_processed_tickets: aiProcessed,
          tickets_by_priority: priorityBreakdown,
          tickets_by_category: categoryBreakdown
        })

        // 4. Extract the 5 most recent records for the display table wrapper
        // Ensuring dates format cleanly through type compatibility casting
        setRecent(fallbackTickets.slice(0, 5) as unknown as Ticket[])
      } catch (err) {
        console.error('Error compiling dashboard analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) return <DashboardSkeleton />

  const statCards = [
    { label: 'Total Tickets', value: stats?.total_tickets || 0, sub: 'all time', color: 'text-ink' },
    { label: 'Open', value: stats?.open_tickets || 0, sub: 'need attention', color: 'text-sky-400' },
    { label: 'In Progress', value: stats?.in_progress_tickets || 0, sub: 'being worked on', color: 'text-amber-400' },
    { label: 'AI Processed', value: stats?.ai_processed_tickets || 0, sub: `of ${stats?.total_tickets || 0} total`, color: 'text-accent' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-ink-2 text-sm mt-1">Overview of support queue and AI triage status.</p>
      </div>

      {/* Stat cards */}
      <StatCardsContainer statCards={statCards} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent tickets column */}
            <div className="lg:grid-cols-1 lg:col-span-2">
              {stats?.total_tickets === 0 ? (
                <div className="card p-8 flex flex-col items-center justify-center text-center opacity-0 animate-fade-up h-full min-h-[300px]" style={{ animationFillMode: 'forwards' }}>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4 border border-border">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-ink mb-1">No tickets found</h3>
                  <p className="text-xs text-ink-3 max-w-sm mb-5">
                    Your support queue is completely empty. Create a ticket to view active real-time stats and metrics.
                  </p>
                  <Link 
                    href="/tickets" 
                    className="px-4 py-2 text-xs font-semibold bg-accent text-bg rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Go to Tickets Page
                  </Link>
                </div>
              ) : (
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
              )}

              
              {/* Breakdown charts */}
             
            </div>
             <div className="space-y-4">
                <BarBreakdown
                  title="By Priority"
                  data={stats?.tickets_by_priority || {}}
                  total={stats?.total_tickets || 1} // Fallback to 1 to prevent division by zero styling bugs
                  colorMap={{ critical: '#f87171', high: '#fb923c', medium: '#60a5fa', low: '#6b7280' }}
                  delay="stagger-4"
                />
                <BarBreakdown
                  title="By Category"
                  data={stats?.tickets_by_category || {}}
                  total={stats?.total_tickets || 1}
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
                  width: `${Math.round((count / (total || 1)) * 100)}%`, // Avoid division by zero issues
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
