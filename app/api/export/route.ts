import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { categoryLabel } from '@/lib/constants'
import { getWorkspace } from '@/lib/queries'

function csvCell(value: string | number) {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const type = new URL(request.url).searchParams.get('type') === 'stats' ? 'stats' : 'money'
  const ws = await getWorkspace(session.user.id)
  const handles = new Map(ws.accounts.map((a) => [a.id, a.handle]))

  const rows: (string | number)[][] =
    type === 'money'
      ? [
          ['Date', 'Description', 'Type', 'Category', 'Amount (GBP)', 'Account'],
          ...ws.transactions.map((t) => [
            t.date,
            t.description,
            t.kind,
            categoryLabel(t.category),
            (t.kind === 'expense' ? -t.amountPence : t.amountPence) / 100,
            t.accountId ? (handles.get(t.accountId) ?? 'Deleted account') : 'General',
          ]),
        ]
      : [
          ['Date', 'Account', 'Followers', 'Total views', 'Total likes', 'Videos'],
          ...ws.snapshots.map((s) => [s.date, handles.get(s.accountId) ?? 'Deleted account', s.followers, s.views, s.likes, s.videos]),
        ]

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="creatorpulse-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
