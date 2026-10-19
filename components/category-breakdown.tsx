'use client'

import { motion } from 'framer-motion'
import { categoryLabel } from '@/lib/constants'
import { formatPence } from '@/lib/format'
import { cn } from '@/lib/utils'

type Row = { category: string; amount: number; share: number }

export function CategoryBreakdown({ title, rows, tone }: { title: string; rows: Row[]; tone: 'positive' | 'negative' }) {
  return (
    <div className="panel p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-medium text-muted">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Nothing recorded yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r, i) => (
            <li key={r.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span>{categoryLabel(r.category)}</span>
                <span className="tabular text-muted">
                  {formatPence(r.amount)} <span className="text-xs">· {Math.round(r.share * 100)}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <motion.div
                  className={cn('h-full rounded-full', tone === 'positive' ? 'bg-positive' : 'bg-negative')}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(r.share * 100, 2)}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
