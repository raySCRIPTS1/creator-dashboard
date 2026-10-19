import type { LucideIcon } from 'lucide-react'
import { AnimatedNumber, type NumberKind } from '@/components/animated-number'
import { DeltaBadge } from '@/components/delta-badge'
import { Reveal } from '@/components/reveal'

type Props = {
  label: string
  value: number
  kind?: NumberKind
  icon: LucideIcon
  delta?: number | null
  deltaKind?: NumberKind
  percent?: number | null
  footnote?: string
}

export function StatCard({ label, value, kind = 'compact', icon: Icon, delta, deltaKind, percent, footnote }: Props) {
  return (
    <Reveal className="panel group relative overflow-hidden p-5 transition-colors hover:border-muted/30">
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/10" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="size-4 text-muted" aria-hidden />
      </div>
      <AnimatedNumber value={value} kind={kind} className="tabular mt-3 block text-3xl font-semibold tracking-tight" />
      <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2 text-xs text-muted">
        {delta !== undefined && delta !== null ? (
          <DeltaBadge value={delta} kind={deltaKind ?? kind} percent={percent} />
        ) : null}
        {footnote && <span>{footnote}</span>}
      </div>
    </Reveal>
  )
}
