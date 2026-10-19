'use client'

import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { formatCompact, formatNumber, formatPence } from '@/lib/format'

export type NumberKind = 'number' | 'compact' | 'pence'

const formatters: Record<NumberKind, (v: number) => string> = {
  number: formatNumber,
  compact: (v) => (Math.abs(v) >= 10_000 ? formatCompact(v) : formatNumber(v)),
  pence: formatPence,
}

type Props = {
  value: number
  kind?: NumberKind
  className?: string
}

export function AnimatedNumber({ value, kind = 'number', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(0)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const format = formatters[kind]

  useEffect(() => {
    const node = ref.current
    if (!node || !inView) return
    if (reduce) {
      node.textContent = format(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(Math.round(v))
      },
    })
    previous.current = value
    return () => controls.stop()
  }, [value, inView, reduce, format])

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      {format(value)}
    </span>
  )
}
