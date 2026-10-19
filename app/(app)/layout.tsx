import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { getSession } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  return <AppShell user={{ name: session.user.name, email: session.user.email }}>{children}</AppShell>
}
