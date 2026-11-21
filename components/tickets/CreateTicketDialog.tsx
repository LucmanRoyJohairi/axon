'use client'

import { useState } from 'react'
import type { TicketCategory, TicketPriority } from '@/types'
import { CATEGORY_LABEL, PRIORITY_LABEL } from '@/lib/utils'
import { createNewTicket } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const CATEGORIES: TicketCategory[] = ['bug', 'feature', 'billing', 'support', 'other']
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical']

export default function CreateTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      await createNewTicket({
        title,
        description,
        category: category || null,
        priority: priority || 'pending',
      })
      setTitle('')
      setDescription('')
      setCategory('')
      setPriority('')
      onOpenChange(false)
      onCreated()
    } catch (err: any) {
      setError(err.message ?? 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border text-ink sm:max-w-lg p-6 gap-5">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <DialogTitle className="font-display text-lg font-semibold text-ink">
              Create Support Ticket
            </DialogTitle>
          </div>
          <DialogDescription className="text-ink-2 text-xs leading-relaxed">
            Describe the issue below. Leave Category and Priority on <span className="text-ink font-medium">Auto</span> to let AI classify and summarize it automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-ink-2">Subject</label>
              <span className="text-[10px] font-mono text-ink-3">{title.length}/120</span>
            </div>
            <Input
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Webhook signature verification failing in production"
              disabled={submitting}
              className="bg-surface-2 border-border text-ink placeholder:text-ink-3 h-10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">
              Description & Steps to Reproduce
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include error messages, affected endpoints, or steps to reproduce..."
              rows={4}
              disabled={submitting}
              className="bg-surface-2 border-border text-ink placeholder:text-ink-3 resize-none"
            />
          </div>

          {/* Optional Manual Overrides */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">
                Category <span className="text-ink-3 font-normal">(optional)</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory | '')}
                disabled={submitting}
                className="w-full h-9 rounded-lg bg-surface-2 border border-border px-3 text-xs text-ink focus:outline-none focus:border-accent/60"
              >
                <option value="">🤖 Auto (AI Triage)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">
                Priority <span className="text-ink-3 font-normal">(optional)</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority | '')}
                disabled={submitting}
                className="w-full h-9 rounded-lg bg-surface-2 border border-border px-3 text-xs text-ink focus:outline-none focus:border-accent/60"
              >
                <option value="">🤖 Auto (AI Triage)</option>
                {PRIORITIES.map((prio) => (
                  <option key={prio} value={prio}>
                    {PRIORITY_LABEL[prio]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Pipeline Callout */}
          <div className="rounded-lg bg-surface-2/80 border border-border/80 px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow flex-shrink-0" />
            <p className="text-[11px] text-ink-2 leading-snug">
              {category && priority
                ? 'Manual category & priority set — AI will still generate a concise summary.'
                : 'AI worker will analyze the description to generate a summary, category, and priority.'}
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Clean inline footer without mismatched DialogFooter strip */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="border-border bg-transparent text-ink-2 hover:text-ink"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="bg-accent text-bg font-semibold hover:bg-amber-300"
            >
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
