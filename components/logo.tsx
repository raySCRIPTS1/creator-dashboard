import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-background shadow-[0_0_24px_-4px_hsl(var(--accent)/0.8)]">
        <Activity className="size-[18px]" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Creator<span className="text-accent">Pulse</span>
      </span>
    </div>
  )
}
