'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LineChart as LineIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DeltaBadge } from '@/components/delta-badge'
import { Segmented } from '@/components/segmented'
import { combinedSeries, percentChange, type Metric } from '@/lib/analytics'
import type { Snapshot } from '@/lib/db/schema'
import { formatCompact, formatDate, formatNumber } from '@/lib/format'

const metricOptions: { value: Metric; label: string }[] = [
  { value: 'followers', label: 'Followers' },
  { value: 'views', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'videos', label: 'Videos' },
]

type Range = '7' | '30' | '90' | 'all'
const rangeOptions: { value: Range; label: string }[] = [
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '90', label: '90D' },
  { value: 'all', label: 'All' },
]

export function GrowthChart({ snapshots, today }: { snapshots: Snapshot[]; today: string }) {
  const [metric, setMetric] = useState<Metric>('followers')
  const [range, setRange] = useState<Range>('30')

  const data = useMemo(
    () => combinedSeries(snapshots, range === 'all' ? null : Number(range), today),
    [snapshots, range, today],
  )

  const first = data[0]?.[metric] ?? 0
  const last = data.at(-1)?.[metric] ?? 0
  const delta = last - first

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="growth-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 id="growth-heading" className="text-sm font-medium text-muted">
            Combined growth
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <p className="tabular text-2xl font-semibold tracking-tight">{formatNumber(last)}</p>
            {data.length > 1 && <DeltaBadge value={delta} percent={percentChange(last, delta)} />}
          </div>
          {data.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              {formatDate(data[0].date, { day: 'numeric', month: 'short' })} –{' '}
              {formatDate(data.at(-1)!.date, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented label="Metric" options={metricOptions} value={metric} onChange={setMetric} />
          <Segmented label="Date range" options={rangeOptions} value={range} onChange={setRange} />
        </div>
      </div>

      <div className="mt-6 h-72">
        {data.length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
            <LineIcon className="size-6 text-muted" aria-hidden />
            <p className="max-w-xs text-sm text-muted">
              Log stats on at least two different days to see your growth curve.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${metric}-${range}`}
              className="h-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 6" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={40}
                    tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
                    tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    domain={['auto', 'auto']}
                    tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
                    tickFormatter={(v) => formatCompact(v)}
                  />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--accent))', strokeOpacity: 0.4 }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border bg-surface-2 px-3 py-2 text-xs shadow-xl">
                          <p className="text-muted">{formatDate(payload[0].payload.date)}</p>
                          <p className="tabular mt-0.5 text-sm font-semibold">
                            {formatNumber(Number(payload[0].value))}{' '}
                            <span className="font-normal text-muted">{metric}</span>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    fill="url(#growthFill)"
                    animationDuration={900}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
