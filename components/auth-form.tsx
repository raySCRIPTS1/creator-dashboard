'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    if (isSignUp && password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }

    setPending(true)
    const result = isSignUp
      ? await authClient.signUp.email({ email, password, name: name || email.split('@')[0] })
      : await authClient.signIn.email({ email, password })
    setPending(false)

    if (result.error) {
      console.error('[auth] request failed', result.error)
      setError(
        isSignUp
          ? 'We couldn’t create that account. Try a different email or sign in instead.'
          : 'That email and password combination didn’t work.',
      )
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm"
    >
      <h1 className="text-2xl font-semibold tracking-tight">{isSignUp ? 'Create your workspace' : 'Welcome back'}</h1>
      <p className="mt-2 text-sm text-muted">
        {isSignUp ? 'Your stats and money, synced across every device.' : 'Sign in to pick up where you left off.'}
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate={false}>
        {isSignUp && (
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input id="name" name="name" autoComplete="name" className="field" placeholder="Alex Rivera" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignUp ? 8 : undefined}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="field"
            placeholder={isSignUp ? 'At least 8 characters' : '••••••••'}
          />
        </div>

        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-negative/30 bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" disabled={pending} className="mt-2 h-11">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignUp ? 'Already have an account? ' : 'New to CreatorPulse? '}
        <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="font-medium text-accent hover:underline">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </motion.div>
  )
}
