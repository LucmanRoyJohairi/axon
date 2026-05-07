/**
 * API Client
 *
 * Right now USE_MOCK = true, so all functions return mock data.
 * When your FastAPI backend is running, flip USE_MOCK to false
 * and set NEXT_PUBLIC_API_URL in your .env.local — nothing else changes.
 */

import type { Ticket, TicketListResponse, DashboardStats, AuthToken } from '@/types'
import { MOCK_TICKETS, MOCK_STATS } from './mock-data'

const USE_MOCK = true
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthToken> {
  if (USE_MOCK) {
    // Fake a 500ms network delay so it feels real
    await delay(500)
    return {
      access_token: 'mock-token-abc123',
      token_type: 'bearer',
      user: { id: 'usr_01', email, full_name: 'Zero', is_admin: true, created_at: '' },
    }
  }
  return apiFetch<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function getTickets(params?: {
  page?: number
  status?: string
  priority?: string
  category?: string
}): Promise<TicketListResponse> {
  if (USE_MOCK) {
    await delay(300)
    let tickets = [...MOCK_TICKETS]
    if (params?.status) tickets = tickets.filter(t => t.status === params.status)
    if (params?.priority) tickets = tickets.filter(t => t.ai_priority === params.priority)
    if (params?.category) tickets = tickets.filter(t => t.ai_category === params.category)
    return { tickets, total: tickets.length, page: 1, page_size: 20 }
  }
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, String(v)])
  ).toString()
  return apiFetch<TicketListResponse>(`/tickets${qs ? `?${qs}` : ''}`)
}

export async function getTicket(id: string): Promise<Ticket> {
  if (USE_MOCK) {
    await delay(200)
    const ticket = MOCK_TICKETS.find(t => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    return ticket
  }
  return apiFetch<Ticket>(`/tickets/${id}`)
}

export async function createTicket(data: {
  title: string
  description: string
  priority?: string
}): Promise<Ticket> {
  if (USE_MOCK) {
    await delay(400)
    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'open',
      priority: null,
      category: null,
      ai_summary: null,
      ai_category: null,
      ai_priority: null,
      ai_processed: false,
      creator_id: 'usr_01',
      assignee_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_TICKETS.unshift(newTicket)
    return newTicket
  }
  return apiFetch<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay(300)
    return MOCK_STATS
  }
  return apiFetch<DashboardStats>('/tickets/stats')
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
