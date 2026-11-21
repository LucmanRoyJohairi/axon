'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

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
    label: 'Tickets',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [isSignOutLoading, setIsSignOutLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    async function getUser() {
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
        setLoadingUser(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoadingUser(false)
    }

    getUser()
  }, [])

  async function handleSignOut() {
    setIsSignOutLoading(true)
    try {
      document.cookie = 'axon-dev-mode=; path=/; max-age=0'
      await supabase.auth.signOut()

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
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-border bg-surface flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="font-display font-semibold text-ink text-sm leading-tight">Axon</div>
            <div className="text-ink-3 text-[10px] font-mono tracking-widest uppercase">
              Ticketing Support
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-accent/15 text-accent border border-accent/40 font-medium'
                  : 'text-ink-2 hover:text-ink hover:bg-surface-2'
              )}
            >
              <span className={active ? 'text-accent' : 'text-ink-3'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Profile & Inline Sign Out Panel */}
      <div className="px-4 py-4 border-t border-border">
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
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              title="Sign out"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
