import { ArrowDownLeft, ArrowUpRight, Download, PiggyBank } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CategoryBreakdown } from '@/components/category-breakdown'
import { MoneyChart } from '@/components/money-chart'
import { PageHeader } from '@/components/page-header'
import { QuickActions } from '@/components/quick-actions'
import { Reveal, Stagger } from '@/components/reveal'
import { StatCard } from '@/components/stat-card'
import { TransactionList } from '@/components/transaction-list'
import { Button } from '@/components/ui/button'
import { categoryBreakdown, moneyTotals, monthlyMoney, summarizeAccounts } from '@/lib/analytics'
import { formatPercent } from '@/lib/format'
import { getWorkspace, todayISO } from '@/lib/queries'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Money' }

export default async function MoneyPage() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const today = todayISO()
  const { accounts, snapshots, transactions } = await getWorkspace(session.user.id)
  const summaries = summarizeAccounts(accounts, snapshots, 30)
  const totals = moneyTotals(transactions)
  const months = monthlyMoney(transactions, 12, today)
  const handles = Object.fromEntries(accounts.map((a) => [a.id, a.handle]))
  const margin = totals.income > 0 ? (totals.net / totals.income) * 100 : null

  return (
    <Stagger>
      <PageHeader
        eyebrow="Money"
        title="Earnings & expenses"
        description="All amounts in GBP, totalled from every transaction you've recorded."
        actions={
          <>
            {transactions.length > 0 && (
              <Button variant="ghost" asChild>
                <a href="/api/export" download>
                  <Download className="size-4" aria-hidden />
                  Export CSV
                </a>
              </Button>
            )}
            <QuickActions accounts={summaries} today={today} show={['transaction']} />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total income" value={totals.income} kind="pence" icon={ArrowDownLeft} />
        <StatCard label="Total expenses" value={totals.expense} kind="pence" icon={ArrowUpRight} />
        <StatCard
          label="Net profit"
          value={totals.net}
          kind="pence"
          icon={PiggyBank}
          footnote={margin !== null ? `${formatPercent(margin).replace('+', '')} profit margin` : undefined}
        />
      </div>

      <Reveal className="panel mt-4 p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-medium text-muted">Last 12 months</h2>
        <MoneyChart data={months} />
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Reveal>
          <CategoryBreakdown title="Income by source" rows={categoryBreakdown(transactions, 'income')} tone="positive" />
        </Reveal>
        <Reveal>
          <CategoryBreakdown title="Spending by category" rows={categoryBreakdown(transactions, 'expense')} tone="negative" />
        </Reveal>
      </div>

      <Reveal className="panel mt-4 p-5 sm:p-6">
        <h2 className="mb-2 text-sm font-medium text-muted">
          All transactions <span className="text-muted/70">· {transactions.length}</span>
        </h2>
        <TransactionList transactions={transactions} handles={handles} editable />
      </Reveal>
    </Stagger>
  )
}
