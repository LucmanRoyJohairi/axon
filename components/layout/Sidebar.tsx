'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { fetchTickets } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import SidebarNav, { type SidebarCounts } from '@/components/layout/SidebarNav'
import SignOutDialog from '@/components/layout/SignOutDialog'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const [isSignOutLoading, setIsSignOutLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [counts, setCounts] = useState<SidebarCounts>({ total: 0, open: 0, critical: 0 })

  useEffect(() => {
    async function initSidebar() {
      const devBypass =
        process.env.NODE_ENV === 'development' &&
        document.cookie.includes('axon-dev-mode=1')

      if (devBypass) {
        setIsDevMode(true)
        setUser({
          id: 'local-dev',
          email: 'dev@axon.local',
          user_metadata: { full_name: 'Local Dev' },
          is_anonymous: false,
        })
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
      setLoadingUser(false)

      try {
        const { tickets } = await fetchTickets()
        setCounts({
          total: tickets.length,
          open: tickets.filter((t) => t.status === 'open').length,
          critical: tickets.filter((t) => (t.priority ?? t.ai_priority) === 'critical').length,
        })
      } catch {
        // Non-blocking if counts fail to load
      }
    }

    initSidebar()
  }, [pathname])

  async function handleConfirmSignOut() {
    setIsSignOutLoading(true)
    try {
      document.cookie = 'axon-dev-mode=; path=/; max-age=0'
      await supabase.auth.signOut()

      setIsSignOutOpen(false)
      router.refresh()
      router.push('/login')
    } catch (err: any) {
      console.error('Sign out error:', err.message)
    } finally {
      setIsSignOutLoading(false)
    }
  }

  const isAnonymous = !isDevMode && (user?.is_anonymous || !user?.email)
  const displayName = user?.user_metadata?.full_name || (isAnonymous ? 'Guest User' : 'User')
  const displaySub = isDevMode
    ? 'Local Dev Mode'
    : isAnonymous
      ? 'Temporary Session'
      : user?.email
  const initialLetter = displayName.charAt(0).toUpperCase()

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-56 border-r border-border bg-surface flex flex-col z-20">
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-ink text-[15px] leading-tight">Axon</div>
              <div className="text-ink-3 text-[11px] font-mono tracking-wider uppercase">
                Ticketing Support
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Status */}
        <SidebarNav counts={counts} />

        {/* User Footer */}
        <div className="px-4 py-3.5 border-t border-border">
          {loadingUser ? (
            <div className="flex items-center gap-2.5 px-1 py-1">
              <Skeleton className="w-7 h-7 rounded-full bg-surface-2" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-1/2 bg-surface-2" />
                <Skeleton className="h-2 w-3/4 bg-surface-2" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-1 py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      'text-xs font-semibold border',
                      isAnonymous
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        : 'bg-accent/20 text-accent border-accent/50'
                    )}
                  >
                    {initialLetter}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ink truncate">{displayName}</div>
                  <div
                    className={cn(
                      'text-[10px] truncate',
                      isDevMode
                        ? 'text-accent/80 font-mono'
                        : isAnonymous
                          ? 'text-zinc-500 font-mono italic'
                          : 'text-ink-3'
                    )}
                  >
                    {displaySub}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsSignOutOpen(true)}
                title="Sign out"
                className="text-ink-3 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </aside>

      <SignOutDialog
        open={isSignOutOpen}
        onOpenChange={setIsSignOutOpen}
        onConfirm={handleConfirmSignOut}
        loading={isSignOutLoading}
        isDevMode={isDevMode}
        isAnonymous={isAnonymous}
      />
    </>
  )
}
