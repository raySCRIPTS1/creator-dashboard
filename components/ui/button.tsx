import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  default:
    'bg-accent text-background shadow-[0_0_0_1px_hsl(var(--accent)/0.4),0_8px_24px_-8px_hsl(var(--accent)/0.6)] hover:bg-accent/90',
  outline: 'border bg-surface-2 text-foreground hover:border-muted/40 hover:bg-surface-2/70',
  ghost: 'text-muted hover:bg-foreground/5 hover:text-foreground',
  danger: 'bg-negative/10 text-negative border border-negative/30 hover:bg-negative/20',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9',
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})
