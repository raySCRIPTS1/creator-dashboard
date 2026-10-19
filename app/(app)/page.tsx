import { Eye, Heart, PoundSterling, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GrowthChart } from '@/components/growth-chart'
import { MoneyChart } from '@/components/money-chart'
import { PageHeader } from '@/components/page-header'
import { QuickActions } from '@/components/quick-actions'
import { Reveal, Stagger } from '@/components/reveal'
import { StatCard } from '@/components/stat-card'
import { TransactionList } from '@/components/transaction-list'
import { Onboarding } from '@/components/onboarding'
import { likeRate, monthlyMoney, percentChange, summarizeAccounts, totalsFromSummaries } from '@/lib/analytics'
import { formatDate, formatPercent } from '@/lib/format'
import { getWorkspace, todayISO } from '@/lib/queries'
import { getSession } from '@/lib/session'

export default async function OverviewPage() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const today = todayISO()
  const { accounts, snapshots, transactions } = await getWorkspace(session.user.id)
  const summaries = summarizeAccounts(accounts, snapshots, 30)
  const { totals, change } = totalsFromSummaries(summaries)
  const months = monthlyMoney(transactions, 6, today)
  const thisMonth = months.at(-1)!
  const lastMonth = months.at(-2)!
  const changeDays = Math.max(0, ...summaries.map((s) => s.change?.days ?? 0))
  const lastLogged = summaries.map((s) => s.latest?.date).filter(Boolean).sort().at(-1)
  const firstName = session.user.name?.split(' ')[0] || 'there'
  const handles = Object.fromEntries(accounts.map((a) => [a.id, a.handle]))
  const rate = likeRate(totals.likes, totals.views)
  const vsLabel = change && changeDays > 0 ? `vs ${changeDays} day${changeDays === 1 ? '' : 's'} ago` : undefined

  return (
    <Stagger>
      <PageHeader
        eyebrow={formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`Hey ${firstName}, here's your pulse`}
        description={
          lastLogged
            ? `Totals across ${accounts.length} account${accounts.length === 1 ? '' : 's'}, last logged ${formatDate(lastLogged)}.`
            : 'Add an account and log your stats to start tracking real growth.'
        }
        actions={<QuickActions accounts={summaries} today={today} />}
      />

      {!snapshots.length ? (
        <Onboarding hasAccount={accounts.length > 0} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Followers"
              value={totals.followers}
              icon={Users}
              delta={change?.followers ?? null}
              percent={change ? percentChange(totals.followers, change.followers) : null}
              footnote={vsLabel}
            />
            <StatCard
              label="Total views"
              value={totals.views}
              icon={Eye}
              delta={change?.views ?? null}
              percent={change ? percentChange(totals.views, change.views) : null}
              footnote={vsLabel}
            />
            <StatCard
              label="Total likes"
              value={totals.likes}
              icon={Heart}
              delta={change?.likes ?? null}
              footnote={rate !== null ? `${formatPercent(rate).replace('+', '')} like rate` : undefined}
            />
            <StatCard
              label="Net this month"
              value={thisMonth.net}
              kind="pence"
              icon={PoundSterling}
              delta={transactions.length ? thisMonth.net - lastMonth.net : null}
              footnote={transactions.length ? 'vs last month' : 'No transactions yet'}
            />
          </div>

          <Reveal className="mt-4">
            <GrowthChart snapshots={snapshots} today={today} />
          </Reveal>
        </>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Reveal className="panel p-5 sm:p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Income vs expenses · 6 months</h2>
            <div className="flex gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-positive" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-negative" />
                Expenses
              </span>
            </div>
          </div>
          <MoneyChart data={months} />
        </Reveal>
        <Reveal className="panel p-5 sm:p-6 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Recent transactions</h2>
            <Link href="/money" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <TransactionList transactions={transactions.slice(0, 5)} handles={handles} />
        </Reveal>
      </div>
    </Stagger>
  )
}
