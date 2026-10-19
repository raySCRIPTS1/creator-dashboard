import { Download } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DangerZone } from '@/components/danger-zone'
import { PageHeader } from '@/components/page-header'
import { Reveal, Stagger } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const { name, email } = session.user

  return (
    <Stagger>
      <PageHeader eyebrow="Settings" title="Workspace settings" />
      <div className="flex max-w-2xl flex-col gap-4">
        <Reveal className="panel p-5 sm:p-6">
          <h2 className="font-medium">Profile</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Name</dt>
              <dd className="mt-1 text-sm">{name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Email</dt>
              <dd className="mt-1 text-sm">{email}</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-medium">Export transactions</h2>
            <p className="mt-1 text-sm text-muted">Download every transaction as a CSV for your accountant or tax return.</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/api/export" download>
              <Download className="size-4" aria-hidden />
              Download CSV
            </a>
          </Button>
        </Reveal>
        <Reveal className="panel flex flex-col gap-4 border-negative/25 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-medium text-negative">Danger zone</h2>
            <p className="mt-1 text-sm text-muted">Remove all accounts, stats and transactions from your workspace.</p>
          </div>
          <DangerZone />
        </Reveal>
      </div>
    </Stagger>
  )
}
