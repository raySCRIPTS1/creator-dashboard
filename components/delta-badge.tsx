import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { NumberKind } from '@/components/animated-number'
import { formatCompact, formatNumber, formatPence, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

const fmt: Record<NumberKind, (v: number) => string> = {
  number: formatNumber,
  compact: (v) => (Math.abs(v) >= 10_000 ? formatCompact(v) : formatNumber(v)),
  pence: formatPence,
}

export function DeltaBadge({ value, kind = 'compact', percent }: { value: number; kind?: NumberKind; percent?: number | null }) {
  const tone = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
  const Icon = tone === 'positive' ? ArrowUpRight : tone === 'negative' ? ArrowDownRight : Minus
  return (
    <span
      className={cn(
        'tabular inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
        tone === 'positive' && 'bg-positive/10 text-positive',
        tone === 'negative' && 'bg-negative/10 text-negative',
        tone === 'neutral' && 'bg-foreground/5 text-muted',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {value > 0 ? '+' : value < 0 ? '−' : ''}
      {fmt[kind](Math.abs(value))}
      {percent !== undefined && percent !== null && <span className="opacity-80">({formatPercent(percent)})</span>}
    </span>
  )
}
