'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthBucket } from '@/lib/analytics'
import { formatMonth, formatPence } from '@/lib/format'

const shortGbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function MoneyChart({ data }: { data: MonthBucket[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 6" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
            tickFormatter={formatMonth}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
            tickFormatter={(v) => shortGbp.format(v / 100)}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--foreground) / 0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const b = payload[0].payload as MonthBucket
              return (
                <div className="tabular min-w-40 rounded-xl border bg-surface-2 px-3 py-2 text-xs shadow-xl">
                  <p className="mb-1.5 text-muted">{formatMonth(b.month)}</p>
                  <Row color="bg-positive" label="Income" value={formatPence(b.income)} />
                  <Row color="bg-negative" label="Expenses" value={formatPence(b.expense)} />
                  <div className="mt-1.5 border-t pt-1.5">
                    <Row label="Net" value={formatPence(b.net)} bold />
                  </div>
                </div>
              )
            }}
          />
          <Bar dataKey="income" fill="hsl(var(--positive))" radius={[6, 6, 2, 2]} maxBarSize={28} animationDuration={800} />
          <Bar dataKey="expense" fill="hsl(var(--negative))" radius={[6, 6, 2, 2]} maxBarSize={28} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Row({ color, label, value, bold }: { color?: string; label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted">
        {color && <span className={`size-2 rounded-full ${color}`} />}
        {label}
      </span>
      <span className={bold ? 'font-semibold' : ''}>{value}</span>
    </div>
  )
}
