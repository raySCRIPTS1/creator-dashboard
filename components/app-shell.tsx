'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, LogOut, Settings, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/logo'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/money', label: 'Money', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
]

type Props = { user: { name: string; email: string }; children: React.ReactNode }

export function AppShell({ user, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  async function signOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const initials = (user.name || user.email).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-surface/60 px-4 py-6 backdrop-blur lg:flex">
        <Link href="/" className="px-2">
          <Logo />
        </Link>
        <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border bg-surface-2"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className={cn('relative size-[18px]', active && 'text-accent')} aria-hidden />
                <span className="relative">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-xl border bg-surface-2/60 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-semibold text-accent">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name || 'Creator'}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl border bg-surface/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur lg:hidden"
      >
        {nav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium',
                active ? 'text-foreground' : 'text-muted',
              )}
            >
              {active && (
                <motion.span layoutId="mobile-nav-active" className="absolute inset-0 rounded-xl bg-surface-2" />
              )}
              <item.icon className={cn('relative size-5', active && 'text-accent')} aria-hidden />
              <span className="relative">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
