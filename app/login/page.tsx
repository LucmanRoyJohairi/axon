'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingMode, setLoadingMode] = useState<'password' | 'guest' | null>(null)

  const isDevBypassEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'

  const isLoading = loadingMode !== null

  // Standard Email/Password Sign-In
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoadingMode('password')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError

      router.refresh()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoadingMode(null)
    }
  }

  // Guest Mode Sign-In (creates anonymous Supabase session)
  async function handleGuestSignIn() {
    setError(null)
    setLoadingMode('guest')

    try {
      const { error: guestError } = await supabase.auth.signInAnonymously()
      if (guestError) throw guestError

      router.refresh()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Failed to start guest session')
    } finally {
      setLoadingMode(null)
    }
  }

  // Local Dev Mode Bypass (no Supabase user or guest account created)
  function handleDevBypass() {
    document.cookie = 'axon-dev-mode=1; path=/; max-age=86400; SameSite=Lax'
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background accent glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 border border-accent/25 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Axon</h1>
          <p className="text-ink-3 text-sm mt-1">AI-powered support tickets</p>
        </div>

        {/* Main Card */}
        <Card className="bg-surface border-border rounded-xl p-6 gap-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="bg-surface-2 border-border text-ink placeholder:text-ink-3"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="bg-surface-2 border-border text-ink placeholder:text-ink-3"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-bg text-sm font-semibold hover:bg-amber-300 mt-2"
            >
              {loadingMode === 'password' ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Separator Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-surface px-3 text-ink-3">Or</span>
            </div>
          </div>

          {/* Guest Mode Action Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full border-border bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <svg
              xmlns="http://w3.org"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-4 h-4 text-ink-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {loadingMode === 'guest' ? 'Creating Guest Session…' : 'Continue as Guest'}
          </Button>
        </Card>

        {/* Local Development Bypass Panel */}
        {isDevBypassEnabled && (
          <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-xs text-ink-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                Development Mode
              </span>
              <Badge variant="outline" className="border-accent/30 text-accent font-mono text-[10px] py-0">
                LOCAL ONLY
              </Badge>
            </div>
            <p className="text-ink-3 leading-relaxed">
              Bypass Supabase auth locally without creating a user or guest account.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleDevBypass}
              disabled={isLoading}
              className="w-full bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 font-medium"
            >
              Enter Dev Mode →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
