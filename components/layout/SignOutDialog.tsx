'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function SignOutDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  isDevMode,
  isAnonymous,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading: boolean
  isDevMode: boolean
  isAnonymous: boolean
}) {
  const description = isDevMode
    ? 'You will exit Local Dev Mode and return to the login screen.'
    : isAnonymous
      ? 'You are in a temporary guest session. Signing out will end this session.'
      : 'You will be signed out of your account and returned to the login screen.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border text-ink sm:max-w-sm p-6 gap-4">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="font-display text-base font-semibold text-ink">
            Sign out of Axon?
          </DialogTitle>
          <DialogDescription className="text-ink-2 text-xs leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-border bg-transparent text-ink-2 hover:text-ink"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 font-medium"
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
