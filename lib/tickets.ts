import { createClient } from '@/utils/supabase/client'
import type { Ticket, TicketStatus, DashboardStats } from '@/types'

/** Resolves effective priority whether stored on `priority` or `ai_priority` */
export function getEffectivePriority(ticket: Ticket) {
  return ticket.priority ?? ticket.ai_priority ?? null
}

/** Resolves effective category whether stored on `category` or `ai_category` */
export function getEffectiveCategory(ticket: Ticket) {
  return ticket.category ?? ticket.ai_category ?? null
}

export async function fetchTickets(filters?: {
  status?: string
  priority?: string
  category?: string
}): Promise<{ tickets: Ticket[]; total: number }> {
  const supabase = createClient()

  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.category) query = query.eq('category', filters.category)

  const { data, count, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  return {
    tickets: (data ?? []) as Ticket[],
    total: count ?? 0,
  }
}

export async function fetchTicketById(id: string): Promise<Ticket> {
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
}): Promise<Ticket> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'open',
      priority: 'pending',
      creator_id: user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Ticket
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
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
}> {
  const { tickets } = await fetchTickets()

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
  }
}
