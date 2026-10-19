'use client'

import { Plus, PoundSterling, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { AddAccountDialog, AddTransactionDialog, LogStatsDialog } from '@/components/forms'
import { Button } from '@/components/ui/button'
import type { AccountSummary } from '@/lib/analytics'

type Props = {
  accounts: AccountSummary[]
  today: string
  show?: ('account' | 'stats' | 'transaction')[]
}

export function QuickActions({ accounts, today, show = ['stats', 'transaction'] }: Props) {
  const [open, setOpen] = useState<null | 'account' | 'stats' | 'transaction'>(null)
  const hasAccounts = accounts.length > 0
  const close = (v: boolean) => !v && setOpen(null)

  return (
    <>
      {show.includes('account') && (
        <Button variant={hasAccounts ? 'outline' : 'default'} onClick={() => setOpen('account')}>
          <Plus className="size-4" aria-hidden />
          Add account
        </Button>
      )}
      {show.includes('transaction') && (
        <Button variant="outline" onClick={() => setOpen('transaction')}>
          <PoundSterling className="size-4" aria-hidden />
          Add transaction
        </Button>
      )}
      {show.includes('stats') && (
        <Button onClick={() => setOpen(hasAccounts ? 'stats' : 'account')}>
          <TrendingUp className="size-4" aria-hidden />
          {hasAccounts ? 'Log stats' : 'Add your first account'}
        </Button>
      )}

      <AddAccountDialog open={open === 'account'} onOpenChange={close} />
      {hasAccounts && <LogStatsDialog open={open === 'stats'} onOpenChange={close} accounts={accounts} today={today} />}
      <AddTransactionDialog open={open === 'transaction'} onOpenChange={close} accounts={accounts} today={today} />
    </>
  )
}
