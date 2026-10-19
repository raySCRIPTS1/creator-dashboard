import { Reveal } from '@/components/reveal'

type Props = { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}
        <h1 className="text-balance text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </Reveal>
  )
}
