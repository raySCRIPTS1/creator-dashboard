import type { CreatorAccount, Snapshot, Transaction } from '@/lib/db/schema'

export type Metric = 'followers' | 'views' | 'likes' | 'videos'
export const METRICS: Metric[] = ['followers', 'views', 'likes', 'videos']

export type MetricValues = Record<Metric, number>

export type AccountSummary = {
  id: number
  handle: string
  platform: string
  source: string
  latest: (MetricValues & { date: string }) | null
  change: { metric: MetricValues; days: number } | null
  snapshotCount: number
}

const DAY = 86_400_000

export function toDayNumber(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / DAY
}

export function fromDayNumber(day: number) {
  return new Date(day * DAY).toISOString().slice(0, 10)
}

const zero = (): MetricValues => ({ followers: 0, views: 0, likes: 0, videos: 0 })
const pick = (s: Snapshot): MetricValues => ({
  followers: s.followers,
  views: s.views,
  likes: s.likes,
  videos: s.videos,
})

/**
 * Picks the snapshot to compare against: the latest one on or before
 * (latest date - windowDays). Falls back to the earliest snapshot so new
 * accounts still show growth since tracking began.
 */
function baselineFor(sorted: Snapshot[], windowDays: number) {
  if (sorted.length < 2) return null
  const latest = sorted[sorted.length - 1]
  const target = toDayNumber(latest.date) - windowDays
  let baseline: Snapshot | null = null
  for (const s of sorted.slice(0, -1)) {
    if (toDayNumber(s.date) <= target) baseline = s
  }
  return baseline ?? sorted[0]
}

export function summarizeAccounts(
  accounts: CreatorAccount[],
  snapshots: Snapshot[],
  windowDays = 30,
): AccountSummary[] {
  const byAccount = groupSnapshots(snapshots)
  return accounts.map((a) => {
    const list = byAccount.get(a.id) ?? []
    const latest = list.at(-1) ?? null
    const baseline = baselineFor(list, windowDays)
    return {
      id: a.id,
      handle: a.handle,
      platform: a.platform,
      source: a.source,
      snapshotCount: list.length,
      latest: latest ? { ...pick(latest), date: latest.date } : null,
      change:
        latest && baseline
          ? {
              days: toDayNumber(latest.date) - toDayNumber(baseline.date),
              metric: Object.fromEntries(
                METRICS.map((m) => [m, latest[m] - baseline[m]]),
              ) as MetricValues,
            }
          : null,
    }
  })
}

function groupSnapshots(snapshots: Snapshot[]) {
  const map = new Map<number, Snapshot[]>()
  for (const s of snapshots) {
    const list = map.get(s.accountId) ?? []
    list.push(s)
    map.set(s.accountId, list)
  }
  for (const list of map.values()) list.sort((a, b) => a.date.localeCompare(b.date))
  return map
}

export type SeriesPoint = MetricValues & { date: string }

/**
 * Daily combined totals across accounts. Each account's value on a day is its
 * most recent snapshot on or before that day (carried forward), so gaps in
 * logging don't create false drops in the chart.
 */
export function combinedSeries(snapshots: Snapshot[], days: number | null, today: string): SeriesPoint[] {
  if (!snapshots.length) return []
  const byAccount = groupSnapshots(snapshots)
  const first = Math.min(...snapshots.map((s) => toDayNumber(s.date)))
  const end = Math.max(toDayNumber(today), ...snapshots.map((s) => toDayNumber(s.date)))
  const start = days === null ? first : Math.max(first, end - days + 1)

  const cursors = new Map<number, { idx: number; current: Snapshot | null }>()
  for (const id of byAccount.keys()) cursors.set(id, { idx: 0, current: null })

  const points: SeriesPoint[] = []
  for (let day = first; day <= end; day++) {
    const totals = zero()
    for (const [id, list] of byAccount) {
      const c = cursors.get(id)!
      while (c.idx < list.length && toDayNumber(list[c.idx].date) <= day) {
        c.current = list[c.idx]
        c.idx++
      }
      if (c.current) for (const m of METRICS) totals[m] += c.current[m]
    }
    if (day >= start) points.push({ date: fromDayNumber(day), ...totals })
  }
  return points
}

export function totalsFromSummaries(summaries: AccountSummary[]) {
  const totals = zero()
  const change = zero()
  let hasChange = false
  for (const s of summaries) {
    if (s.latest) for (const m of METRICS) totals[m] += s.latest[m]
    if (s.change) {
      hasChange = true
      for (const m of METRICS) change[m] += s.change.metric[m]
    }
  }
  return { totals, change: hasChange ? change : null }
}

export function percentChange(current: number, delta: number) {
  const previous = current - delta
  if (previous <= 0) return null
  return (delta / previous) * 100
}

export function likeRate(likes: number, views: number) {
  return views > 0 ? (likes / views) * 100 : null
}

export type MonthBucket = { month: string; income: number; expense: number; net: number }

export function monthlyMoney(transactions: Transaction[], months: number, today: string): MonthBucket[] {
  const [y, m] = today.split('-').map(Number)
  const buckets: MonthBucket[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    buckets.push({ month: d.toISOString().slice(0, 7), income: 0, expense: 0, net: 0 })
  }
  const index = new Map(buckets.map((b, i) => [b.month, i]))
  for (const t of transactions) {
    const i = index.get(t.date.slice(0, 7))
    if (i === undefined) continue
    if (t.kind === 'income') buckets[i].income += t.amountPence
    else buckets[i].expense += t.amountPence
  }
  for (const b of buckets) b.net = b.income - b.expense
  return buckets
}

export function moneyTotals(transactions: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.kind === 'income') income += t.amountPence
    else expense += t.amountPence
  }
  return { income, expense, net: income - expense }
}

export function categoryBreakdown(transactions: Transaction[], kind: 'income' | 'expense') {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.kind !== kind) continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amountPence)
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0)
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount, share: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount)
}
