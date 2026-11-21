'use client'

import { useState } from 'react'
import { createNewTicket } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      await createNewTicket({ title, description })
      setTitle('')
      setDescription('')
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
      <DialogContent className="bg-surface border-border text-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-ink">
            New Ticket
          </DialogTitle>
          <DialogDescription className="text-ink-3 text-xs flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse-slow" />
            AI will auto-triage category and priority after submission
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              disabled={submitting}
              className="bg-surface-2 border-border text-ink placeholder:text-ink-3"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation — the AI will analyze this to suggest a category and priority."
              rows={4}
              disabled={submitting}
              className="bg-surface-2 border-border text-ink placeholder:text-ink-3 resize-none"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
