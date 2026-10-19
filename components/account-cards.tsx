'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus, Trash2, TrendingUp, UserPlus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { deleteAccount, deleteSnapshot } from '@/app/actions'
import { DeltaBadge } from '@/components/delta-badge'
import { AddAccountDialog, LogStatsDialog } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { likeRate, percentChange, type AccountSummary } from '@/lib/analytics'
import type { Snapshot } from '@/lib/db/schema'
import { formatCompact, formatDate, formatNumber, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = { accounts: AccountSummary[]; snapshots: Snapshot[]; today: string }

export function AccountCards({ accounts, snapshots, today }: Props) {
  const [logFor, setLogFor] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AccountSummary | null>(null)
  const [expanded, setExpanded] = useState<number | null>(accounts[0]?.id ?? null)
  const [pending, start] = useTransition()

  if (!accounts.length) {
    return (
      <>
        <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <UserPlus className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-medium">No accounts yet</p>
            <p className="mt-1 text-sm text-muted">Add a TikTok handle to start logging its growth.</p>
          </div>
          <Button onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add account
          </Button>
        </div>
        <AddAccountDialog open={adding} onOpenChange={setAdding} />
      </>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {accounts.map((a, i) => {
          const history = snapshots.filter((s) => s.accountId === a.id)
          const isOpen = expanded === a.id
          const rate = a.latest ? likeRate(a.latest.likes, a.latest.views) : null
          return (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              className="panel overflow-hidden"
            >
              <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
                <div className="flex min-w-0 items-center gap-3 md:w-56">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-strong text-sm font-bold text-background">
                    {a.handle.slice(1, 3).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.handle}</p>
                    <p className="text-xs text-muted">
                      {a.latest ? `Updated ${formatDate(a.latest.date)}` : 'No stats logged yet'}
                    </p>
                  </div>
                </div>

                <dl className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                  {(['followers', 'views', 'likes', 'videos'] as const).map((m) => (
                    <div key={m}>
                      <dt className="text-xs capitalize text-muted">{m}</dt>
                      <dd className="tabular mt-1 text-lg font-semibold">
                        {a.latest ? formatCompact(a.latest[m]) : '—'}
                      </dd>
                      {a.change && (
                        <dd className="mt-1 text-xs">
                          <DeltaBadge
                            value={a.change.metric[m]}
                            percent={m === 'followers' && a.latest ? percentChange(a.latest[m], a.change.metric[m]) : undefined}
                          />
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>

                <div className="hidden h-12 w-28 lg:block" aria-hidden>
                  {history.length > 1 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <Line
                          type="monotone"
                          dataKey="followers"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={false}
                          animationDuration={900}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setLogFor(a.id)}>
                    <TrendingUp className="size-4" aria-hidden />
                    Log stats
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setExpanded(isOpen ? null : a.id)}
                    aria-expanded={isOpen}
                    aria-controls={`history-${a.id}`}
                  >
                    <ChevronDown className={cn('size-4 transition-transform duration-300', isOpen && 'rotate-180')} aria-hidden />
                    <span className="sr-only">{isOpen ? 'Hide' : 'Show'} history for {a.handle}</span>
                  </Button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`history-${a.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                    className="overflow-hidden border-t bg-background/40"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          History <span className="font-normal text-muted">· {history.length} entries</span>
                        </p>
                        {rate !== null && (
                          <p className="text-xs text-muted">
                            Like rate {formatPercent(rate).replace('+', '')} · {formatNumber(Math.round(a.latest!.views / Math.max(a.latest!.videos, 1)))} avg views per video
                          </p>
                        )}
                      </div>
                      <HistoryTable history={history} />
                      <div className="mt-4 flex justify-end">
                        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(a)}>
                          <Trash2 className="size-3.5" aria-hidden />
                          Remove account
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>

      <LogStatsDialog
        open={logFor !== null}
        onOpenChange={(v) => !v && setLogFor(null)}
        accounts={accounts}
        today={today}
        defaultAccountId={logFor ?? undefined}
      />

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title={`Remove ${confirmDelete?.handle ?? ''}?`}
        description="This deletes its stats history permanently. Linked transactions are kept but unlinked."
      >
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const target = confirmDelete!
                const res = await deleteAccount(target.id)
                if (res.ok) toast.success(`Removed ${target.handle}`)
                else toast.error(res.error)
                setConfirmDelete(null)
              })
            }
          >
            Remove
          </Button>
        </div>
      </Dialog>
    </>
  )
}

function HistoryTable({ history }: { history: Snapshot[] }) {
  const [, start] = useTransition()
  const rows = [...history].reverse()
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted">No entries yet. Log stats to start the history.</p>
  return (
    <div className="max-h-80 overflow-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-2 text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              Date
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Followers
            </th>
            <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">
              Views
            </th>
            <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">
              Likes
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Videos
            </th>
            <th scope="col" className="w-10 px-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="tabular">
          {rows.map((s, i) => {
            const prev = rows[i + 1]
            const diff = prev ? s.followers - prev.followers : null
            return (
              <tr key={s.id} className="group border-t">
                <td className="px-4 py-2.5 text-muted">{formatDate(s.date)}</td>
                <td className="px-4 py-2.5 text-right">
                  {formatNumber(s.followers)}
                  {diff !== null && diff !== 0 && (
                    <span className={cn('ml-2 text-xs', diff > 0 ? 'text-positive' : 'text-negative')}>
                      {diff > 0 ? '+' : '−'}
                      {formatNumber(Math.abs(diff))}
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-2.5 text-right sm:table-cell">{formatNumber(s.views)}</td>
                <td className="hidden px-4 py-2.5 text-right sm:table-cell">{formatNumber(s.likes)}</td>
                <td className="px-4 py-2.5 text-right">{formatNumber(s.videos)}</td>
                <td className="px-2">
                  <button
                    onClick={() =>
                      start(async () => {
                        const res = await deleteSnapshot(s.id)
                        if (res.ok) toast.success(`Deleted entry for ${formatDate(s.date)}`)
                      })
                    }
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-negative/10 hover:text-negative sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    <span className="sr-only">Delete entry for {formatDate(s.date)}</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
