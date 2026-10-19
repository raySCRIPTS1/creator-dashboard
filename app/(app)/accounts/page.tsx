import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountCards } from '@/components/account-cards'
import { PageHeader } from '@/components/page-header'
import { QuickActions } from '@/components/quick-actions'
import { Reveal, Stagger } from '@/components/reveal'
import { TikTokConnectCard } from '@/components/tiktok-connect-card'
import { summarizeAccounts } from '@/lib/analytics'
import { getWorkspace, todayISO } from '@/lib/queries'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Accounts' }

export default async function AccountsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  const today = todayISO()
  const { accounts, snapshots } = await getWorkspace(session.user.id)
  const summaries = summarizeAccounts(accounts, snapshots, 30)

  return (
    <Stagger>
      <PageHeader
        eyebrow="Accounts"
        title="Your TikTok accounts"
        description="Changes compare your latest entry with the closest entry from 30 days earlier, or your first entry if you started more recently."
        actions={<QuickActions accounts={summaries} today={today} show={['account', 'stats']} />}
      />
      <Reveal>
        <AccountCards accounts={summaries} snapshots={snapshots} today={today} />
      </Reveal>
      <TikTokConnectCard />
    </Stagger>
  )
}
