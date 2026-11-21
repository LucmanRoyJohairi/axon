'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/tickets',
    label: 'All Tickets',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

export interface SidebarCounts {
  total: number
  open: number
  critical: number
}

export default function SidebarNav({
  counts,
  aiOnline = false,
}: {
  counts: SidebarCounts
  aiOnline?: boolean
}) {
  const pathname = usePathname()

  return (
    <>
      <div className="flex-1 px-3 pt-4 space-y-6 overflow-y-auto">
        {/* Workspace */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-ink-3">
            Workspace
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
                    active
                      ? 'bg-accent/15 text-accent border border-accent/40 font-medium'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={active ? 'text-accent' : 'text-ink-3'}>{item.icon}</span>
                    {item.label}
                  </span>
                  {item.href === '/tickets' && counts.total > 0 && (
                    <span className="text-[11px] font-mono text-ink-3">{counts.total}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Queue Views */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-ink-3">
            Queue Views
          </div>
          <div className="space-y-1">
            <Link
              href="/tickets?status=open"
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Open Queue
              </span>
              <span className="text-[11px] font-mono text-ink-3">{counts.open}</span>
            </Link>
            <Link
              href="/tickets?priority=critical"
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Critical
              </span>
              <span className="text-[11px] font-mono text-ink-3">{counts.critical}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Triage Status Pill */}
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-surface-2/70 border border-border px-3 py-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-ink-2 flex items-center gap-1.5">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  aiOnline ? 'bg-emerald-400 animate-pulse-slow' : 'bg-zinc-500'
                )}
              />
              {aiOnline ? 'AI Triage Active' : 'AI Worker Offline'}
            </span>
            <span className="text-[10px] font-mono text-ink-3">
              {aiOnline ? 'ONLINE' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] text-ink-3 leading-snug">
            {aiOnline
              ? 'Auto-classifying incoming tickets by priority & category.'
              : 'Backend worker not connected — tickets queue for triage.'}
          </p>
        </div>
      </div>
    </>
  )
}
