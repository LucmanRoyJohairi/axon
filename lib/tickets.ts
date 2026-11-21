import { createClient } from '@/utils/supabase/client'
import type {
  Ticket,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  DashboardStats,
} from '@/types'
import { MOCK_TICKETS } from '@/lib/mock-data'

const MOCK_STORAGE_KEY = 'axon_sandbox_tickets_v1'

/** Resolves effective priority whether stored on `priority` or `ai_priority` */
export function getEffectivePriority(ticket: Ticket) {
  return ticket.priority ?? ticket.ai_priority ?? null
}

/** Resolves effective category whether stored on `category` or `ai_category` */
export function getEffectiveCategory(ticket: Ticket) {
  return ticket.category ?? ticket.ai_category ?? null
}

/** Checks if the current session is Local Dev Bypass or an Anonymous Guest */
async function shouldUseSandbox(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (
    process.env.NODE_ENV === 'development' &&
    document.cookie.includes('axon-dev-mode=1')
  ) {
    return true
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user?.is_anonymous)
}

function readSandboxTickets(): Ticket[] {
  if (typeof window === 'undefined') return [...MOCK_TICKETS]
  try {
    const raw = sessionStorage.getItem(MOCK_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Ticket[]
  } catch {
    // Fallback to initial seed if storage is unavailable
  }
  const seeded = [...MOCK_TICKETS]
  sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function writeSandboxTickets(tickets: Ticket[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(tickets))
  } catch {
    // Ignore storage quota errors
  }
}

/** Restores the initial mock ticket set in the browser sandbox */
export function resetSandboxTickets() {
  if (typeof window === 'undefined') return
  writeSandboxTickets([...MOCK_TICKETS])
}

export async function fetchTickets(filters?: {
  status?: string
  priority?: string
  category?: string
}): Promise<{ tickets: Ticket[]; total: number; isSandbox: boolean }> {
  if (await shouldUseSandbox()) {
    let tickets = readSandboxTickets()

    if (filters?.status) {
      tickets = tickets.filter((t) => t.status === filters.status)
    }
    if (filters?.priority) {
      tickets = tickets.filter((t) => getEffectivePriority(t) === filters.priority)
    }
    if (filters?.category) {
      tickets = tickets.filter((t) => getEffectiveCategory(t) === filters.category)
    }

    tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { tickets, total: tickets.length, isSandbox: true }
  }

  const supabase = createClient()
  let query = supabase.from('tickets').select('*', { count: 'exact' })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.category) query = query.eq('category', filters.category)

  const { data, count, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  return {
    tickets: (data ?? []) as Ticket[],
    total: count ?? 0,
    isSandbox: false,
  }
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  if (await shouldUseSandbox()) {
    const ticket = readSandboxTickets().find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    return ticket
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) throw new Error('Ticket not found')

  return data as Ticket
}

export async function createNewTicket(input: {
  title: string
  description: string
  category?: TicketCategory | null
  priority?: TicketPriority | null
}): Promise<Ticket> {
  if (await shouldUseSandbox()) {
    const tickets = readSandboxTickets()
    const now = new Date().toISOString()
    const newTicket: Ticket = {
      id: `tkt_${Date.now().toString().slice(-6)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'open',
      priority: input.priority ?? 'pending',
      category: input.category ?? null,
      ai_summary: null,
      ai_category: null,
      ai_priority: null,
      ai_processed: false,
      creator_id: 'guest_sandbox',
      assignee_id: null,
      created_at: now,
      updated_at: now,
    }
    writeSandboxTickets([newTicket, ...tickets])
    return newTicket
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'open',
      priority: input.priority ?? 'pending',
      category: input.category ?? null,
      creator_id: user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Ticket
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  if (await shouldUseSandbox()) {
    const tickets = readSandboxTickets()
    const idx = tickets.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Ticket not found')

    const updated: Ticket = {
      ...tickets[idx],
      status,
      updated_at: new Date().toISOString(),
    }
    tickets[idx] = updated
    writeSandboxTickets(tickets)
    return updated
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Ticket
}

export async function fetchDashboardData(): Promise<{
  stats: DashboardStats
  recent: Ticket[]
  isSandbox: boolean
}> {
  const { tickets, isSandbox } = await fetchTickets()

  const priorityBreakdown: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  const categoryBreakdown: Record<string, number> = {
    bug: 0,
    feature: 0,
    billing: 0,
    support: 0,
    other: 0,
  }

  let open = 0
  let inProgress = 0
  let resolved = 0
  let aiProcessed = 0

  for (const ticket of tickets) {
    if (ticket.status === 'open') open++
    if (ticket.status === 'in_progress') inProgress++
    if (ticket.status === 'resolved') resolved++

    const prio = getEffectivePriority(ticket)
    const cat = getEffectiveCategory(ticket)

    if (ticket.ai_processed || (prio && prio !== 'pending' && cat)) {
      aiProcessed++
    }

    if (prio && prio in priorityBreakdown) {
      priorityBreakdown[prio]++
    }

    if (cat) {
      if (cat in categoryBreakdown) {
        categoryBreakdown[cat]++
      } else {
        categoryBreakdown.other++
      }
    }
  }

  return {
    stats: {
      total_tickets: tickets.length,
      open_tickets: open,
      in_progress_tickets: inProgress,
      resolved_tickets: resolved,
      ai_processed_tickets: aiProcessed,
      tickets_by_priority: priorityBreakdown,
      tickets_by_category: categoryBreakdown,
    },
    recent: tickets.slice(0, 5),
    isSandbox,
  }
}
