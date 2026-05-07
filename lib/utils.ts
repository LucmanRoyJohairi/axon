import type { TicketStatus, TicketPriority, TicketCategory } from '@/types'
import clsx from 'clsx'

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  bug: 'Bug',
  feature: 'Feature',
  billing: 'Billing',
  support: 'Support',
  other: 'Other',
}

export function statusClass(status: TicketStatus): string {
  return clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide', {
    'bg-sky-500/10 text-sky-400 border border-sky-500/20': status === 'open',
    'bg-amber-500/10 text-amber-400 border border-amber-500/20': status === 'in_progress',
    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': status === 'resolved',
    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20': status === 'closed',
  })
}

export function priorityClass(priority: TicketPriority): string {
  return clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', {
    'bg-zinc-700 text-zinc-300': priority === 'low',
    'bg-blue-500/15 text-blue-400': priority === 'medium',
    'bg-orange-500/15 text-orange-400': priority === 'high',
    'bg-red-500/15 text-red-400': priority === 'critical',
  })
}

export function categoryClass(category: TicketCategory): string {
  return clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', {
    'bg-red-500/10 text-red-400': category === 'bug',
    'bg-violet-500/10 text-violet-400': category === 'feature',
    'bg-green-500/10 text-green-400': category === 'billing',
    'bg-cyan-500/10 text-cyan-400': category === 'support',
    'bg-zinc-500/10 text-zinc-400': category === 'other',
  })
}

export const PRIORITY_DOT: Record<TicketPriority, string> = {
  low: 'bg-zinc-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  critical: 'bg-red-500',
}
