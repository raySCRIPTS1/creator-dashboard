import { Link2, Lock } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function TikTokConnectCard() {
  return (
    <Reveal className="panel relative mt-4 overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-surface-2 text-accent">
          <Link2 className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">Automatic TikTok sync</p>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              Pending TikTok approval
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Auto-sync needs a TikTok developer app approved for the Display API. Once it&apos;s approved, connected accounts
            will log a snapshot every day automatically. Until then, manual logging records the same data.
          </p>
        </div>
        <button
          disabled
          className="inline-flex h-10 items-center gap-2 rounded-xl border bg-surface-2 px-4 text-sm font-medium text-muted"
        >
          <Lock className="size-4" aria-hidden />
          Connect TikTok
        </button>
      </div>
    </Reveal>
  )
}
