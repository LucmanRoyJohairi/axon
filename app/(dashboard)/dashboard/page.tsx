'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { DashboardStats, Ticket } from '@/types'
import { fetchDashboardData, resetSandboxTickets } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import DashboardSkeleton from '@/components/ui/DashboardSkeleton'
import RecentTicketsTable from '@/components/tickets/RecentTicketsTable'
import StatCardsContainer from '@/components/ui/StatCardsContainer'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<Ticket[]>([])
  const [isSandbox, setIsSandbox] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    fetchDashboardData()
      .then((data) => {
        setStats(data.stats)
        setRecent(data.recent)
        setIsSandbox(data.isSandbox)
      })
      .catch((err) => console.error('Error compiling dashboard analytics:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleResetDemo() {
    resetSandboxTickets()
    loadData()
  }

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
      <div
        className="flex flex-wrap items-start justify-between gap-4 mb-8 opacity-0 animate-fade-up"
        style={{ animationFillMode: 'forwards' }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
            {isSandbox && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-accent/10 text-accent border border-accent/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                Mock Data Sandbox
              </span>
            )}
          </div>
          <p className="text-ink-2 text-sm mt-1">Overview of support queue and AI triage status.</p>
        </div>

        {isSandbox && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            className="border-border bg-surface text-ink-2 hover:text-ink text-xs"
          >
            Reset Demo Data
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <StatCardsContainer statCards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets column */}
        <div className="lg:col-span-2">
          {stats?.total_tickets === 0 ? (
            <Card
              className="bg-surface border-border rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-0 animate-fade-up h-full min-h-[300px]"
              style={{ animationFillMode: 'forwards' }}
            >
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
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'bg-accent text-bg hover:bg-amber-300 font-semibold'
                )}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Go to Tickets Page
              </Link>
            </Card>
          ) : (
            <RecentTicketsTable recent={recent} />
          )}
        </div>

        {/* Breakdown charts */}
        <div className="space-y-4">
          <BarBreakdown
            title="By Priority"
            data={stats?.tickets_by_priority || {}}
            total={stats?.total_tickets || 1}
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
  title,
  data,
  total,
  colorMap,
  delay,
}: {
  title: string
  data: Record<string, number>
  total: number
  colorMap: Record<string, string>
  delay: string
}) {
  return (
    <Card
      className={`bg-surface border-border rounded-xl p-4 gap-3 opacity-0 animate-fade-up ${delay}`}
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="text-xs font-semibold text-ink-2 uppercase tracking-wide">{title}</div>
      <div className="space-y-2.5">
        {Object.entries(data).map(([key, count]) => {
          const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-2 capitalize">{key}</span>
                <span className="text-ink-3 font-mono">{count}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: colorMap[key] ?? '#6b7280' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
