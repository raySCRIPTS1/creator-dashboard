'use client'

import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '@/lib/utils'

type Props<T extends string> = {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

export function Segmented<T extends string>({ options, value, onChange, label, className }: Props<T>) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-xl border bg-background p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {active && (
              <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-surface-2 shadow-sm ring-1 ring-border" />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
