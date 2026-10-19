'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Receipt, Trash2 } from 'lucide-react'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteTransaction } from '@/app/actions'
import { categoryLabel } from '@/lib/constants'
import type { Transaction } from '@/lib/db/schema'
import { formatDate, formatPence } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = { transactions: Transaction[]; handles: Record<number, string>; editable?: boolean }

export function TransactionList({ transactions, handles, editable = false }: Props) {
  const [optimistic, removeOptimistic] = useOptimistic(transactions, (state, id: number) => state.filter((t) => t.id !== id))
  const [, start] = useTransition()

  function remove(t: Transaction) {
    start(async () => {
      removeOptimistic(t.id)
      const res = await deleteTransaction(t.id)
      if (res.ok) toast.success(`Deleted “${t.description}”`)
      else toast.error(res.error)
    })
  }

  if (!optimistic.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <Receipt className="size-6 text-muted" aria-hidden />
        <p className="text-sm text-muted">No transactions yet.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col">
      <AnimatePresence initial={false}>
        {optimistic.map((t, i) => {
          const income = t.kind === 'income'
          return (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.03 } }}
              exit={{ opacity: 0, x: -16, height: 0, transition: { duration: 0.2 } }}
              className="group border-b last:border-b-0"
            >
              <div className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    income ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative',
                  )}
                >
                  {income ? <ArrowDownLeft className="size-4" aria-hidden /> : <ArrowUpRight className="size-4" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="truncate text-xs text-muted">
                    {categoryLabel(t.category)}
                    {t.accountId && handles[t.accountId] ? ` · ${handles[t.accountId]}` : ''} · {formatDate(t.date)}
                  </p>
                </div>
                <p className={cn('tabular shrink-0 text-sm font-semibold', income ? 'text-positive' : 'text-foreground')}>
                  {income ? '+' : '−'}
                  {formatPence(t.amountPence)}
                </p>
                {editable && (
                  <button
                    onClick={() => remove(t)}
                    className="rounded-lg p-2 text-muted opacity-100 transition-all hover:bg-negative/10 hover:text-negative sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="sr-only">Delete {t.description}</span>
                  </button>
                )}
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
