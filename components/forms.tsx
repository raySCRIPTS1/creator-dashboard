'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addAccount, addTransaction, logSnapshot, type ActionResult } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Segmented } from '@/components/segmented'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants'
import type { AccountSummary } from '@/lib/analytics'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

type Base = { open: boolean; onOpenChange: (open: boolean) => void }

function useSubmit(onDone: () => void, success: string) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const run = (fn: () => Promise<ActionResult>) => {
    setError(null)
    start(async () => {
      try {
        const res = await fn()
        if (!res.ok) {
          setError(res.error)
          return
        }
        toast.success(success)
        onDone()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }
  return { pending, error, run }
}

function FormError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-xl border border-negative/30 bg-negative/10 px-3.5 py-2.5 text-sm text-negative">
      {error}
    </p>
  )
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" disabled={pending} className="mt-2 h-11 w-full">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  )
}

export function AddAccountDialog({ open, onOpenChange }: Base) {
  const { pending, error, run } = useSubmit(() => onOpenChange(false), 'Account added')
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a TikTok account"
      description="Add the handle exactly as it appears on TikTok. You'll log its stats next."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const handle = String(new FormData(e.currentTarget).get('handle') ?? '')
          run(() => addAccount({ handle }))
        }}
      >
        <div>
          <label htmlFor="handle" className="label">
            Handle
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
            <input id="handle" name="handle" required autoFocus autoComplete="off" className="field pl-8" placeholder="yourhandle" />
          </div>
        </div>
        <FormError error={error} />
        <Submit pending={pending}>Add account</Submit>
      </form>
    </Dialog>
  )
}

type LogProps = Base & { accounts: AccountSummary[]; today: string; defaultAccountId?: number }

export function LogStatsDialog({ open, onOpenChange, accounts, today, defaultAccountId }: LogProps) {
  const [accountId, setAccountId] = useState<number>(defaultAccountId ?? accounts[0]?.id ?? 0)
  const { pending, error, run } = useSubmit(() => onOpenChange(false), 'Stats saved')

  useEffect(() => {
    if (open) setAccountId(defaultAccountId ?? accounts[0]?.id ?? 0)
  }, [open, defaultAccountId, accounts])

  const account = accounts.find((a) => a.id === accountId)
  const latest = account?.latest

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Log stats"
      description="Copy the totals from your TikTok profile. Logging the same day again updates that day's entry."
    >
      <form
        key={`${accountId}-${open}`}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          run(() =>
            logSnapshot({
              accountId,
              date: String(f.get('date')),
              followers: String(f.get('followers')),
              views: String(f.get('views')),
              likes: String(f.get('likes')),
              videos: String(f.get('videos')),
            }),
          )
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="account" className="label">
              Account
            </label>
            <select
              id="account"
              className="field"
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.handle}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="label">
              Date
            </label>
            <input id="date" name="date" type="date" required max={today} defaultValue={today} className="field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['followers', 'views', 'likes', 'videos'] as const).map((m) => (
            <div key={m}>
              <label htmlFor={m} className="label capitalize">
                {m === 'views' ? 'Total views' : m === 'likes' ? 'Total likes' : m}
              </label>
              <input
                id={m}
                name={m}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                required
                defaultValue={latest ? latest[m] : undefined}
                className="field tabular"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        {latest && (
          <p className="text-xs text-muted">
            Prefilled from your last entry on {formatDate(latest.date)} ({formatNumber(latest.followers)} followers).
          </p>
        )}
        <FormError error={error} />
        <Submit pending={pending}>Save stats</Submit>
      </form>
    </Dialog>
  )
}

type TxProps = Base & { accounts: AccountSummary[]; today: string }

export function AddTransactionDialog({ open, onOpenChange, accounts, today }: TxProps) {
  const [kind, setKind] = useState<'income' | 'expense'>('income')
  const { pending, error, run } = useSubmit(() => onOpenChange(false), 'Transaction added')
  const categories = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add transaction" description="Record money in or out, in GBP.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          run(() =>
            addTransaction({
              kind,
              description: String(f.get('description')),
              amount: String(f.get('amount')),
              category: String(f.get('category')),
              accountId: String(f.get('accountId') ?? '0'),
              date: String(f.get('date')),
            }),
          )
        }}
      >
        <Segmented
          label="Transaction type"
          className="w-full [&>button]:flex-1"
          options={[
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
          value={kind}
          onChange={setKind}
        />
        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <input
            id="description"
            name="description"
            required
            maxLength={120}
            className="field"
            placeholder={kind === 'income' ? 'Skincare brand sponsorship' : 'Ring light'}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="amount" className="label">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">£</span>
              <input
                id="amount"
                name="amount"
                required
                inputMode="decimal"
                pattern="^\d{1,7}(\.\d{1,2})?$"
                className={cn('field tabular pl-7')}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="tx-date" className="label">
              Date
            </label>
            <input id="tx-date" name="date" type="date" required max={today} defaultValue={today} className="field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select key={kind} id="category" name="category" className="field">
              {Object.entries(categories).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="accountId" className="label">
              Account
            </label>
            <select id="accountId" name="accountId" className="field" defaultValue="0">
              <option value="0">Not linked</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.handle}
                </option>
              ))}
            </select>
          </div>
        </div>
        <FormError error={error} />
        <Submit pending={pending}>Add {kind}</Submit>
      </form>
    </Dialog>
  )
}
