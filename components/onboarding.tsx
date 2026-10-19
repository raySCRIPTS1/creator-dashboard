import { Check } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

export function Onboarding({ hasAccount }: { hasAccount: boolean }) {
  const steps = [
    { title: 'Add your TikTok handle', body: 'Track one account or several, side by side.', done: hasAccount },
    { title: 'Log today’s stats', body: 'Copy followers, views, likes and video count from your profile.', done: false },
    { title: 'Come back and log again', body: 'Growth, trends and percentages are calculated from your real entries.', done: false },
  ]
  return (
    <Reveal className="panel relative overflow-hidden p-6 sm:p-8">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
      <div className="relative">
        <h2 className="text-lg font-semibold tracking-tight">Get set up in three steps</h2>
        <p className="mt-1 text-sm text-muted">
          Every number on this dashboard comes from what you log. Nothing is estimated or invented.
        </p>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className={cn('rounded-xl border bg-background/60 p-4', s.done && 'border-positive/30')}>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg text-xs font-semibold',
                  s.done ? 'bg-positive/15 text-positive' : 'bg-accent/15 text-accent',
                )}
              >
                {s.done ? <Check className="size-4" aria-label="Done" /> : i + 1}
              </span>
              <p className="mt-3 text-sm font-medium">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  )
}
