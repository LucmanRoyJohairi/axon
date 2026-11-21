export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'pending' | 'low' | 'medium' | 'high' | 'critical'
export type TicketCategory = 'bug' | 'feature' | 'billing' | 'support' | 'other'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority | null
  category: TicketCategory | null

  // AI-generated fields (populated once triage worker runs)
  ai_summary: string | null
  ai_category: TicketCategory | null
  ai_priority: TicketPriority | null
  ai_processed: boolean

  creator_id: string | null
  assignee_id: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export interface DashboardStats {
  total_tickets: number
  open_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  ai_processed_tickets: number
  tickets_by_priority: Record<string, number>
  tickets_by_category: Record<string, number>
}
