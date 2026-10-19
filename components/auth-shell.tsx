import { BarChart3, ShieldCheck, Wallet } from 'lucide-react'
import { Logo } from '@/components/logo'

const points = [
  { icon: BarChart3, title: 'Growth you can trust', body: 'Log your stats and see real day-by-day change. No made-up numbers.' },
  { icon: Wallet, title: 'Every pound accounted for', body: 'Brand deals, rewards and expenses, tracked to the penny.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Your workspace is tied to your account and synced securely.' },
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden border-r bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-accent/20 blur-3xl" />
        <Logo className="relative" />
        <div className="relative max-w-md">
          <h2 className="text-balance text-4xl font-semibold leading-tight tracking-tight">
            Know exactly how your channel and your money are growing.
          </h2>
          <ul className="mt-10 flex flex-col gap-6">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-surface-2 text-accent">
                  <p.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted">Not affiliated with TikTok or ByteDance.</p>
      </section>
      <section className="flex flex-col items-center justify-center gap-10 px-6 py-12">
        <Logo className="lg:hidden" />
        {children}
      </section>
    </main>
  )
}
