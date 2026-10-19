import 'server-only'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accountSnapshots, creatorAccounts, transactions } from '@/lib/db/schema'

export async function getWorkspace(userId: string) {
  const [accounts, snapshots, txns] = await Promise.all([
    db
      .select()
      .from(creatorAccounts)
      .where(eq(creatorAccounts.userId, userId))
      .orderBy(asc(creatorAccounts.createdAt)),
    db
      .select()
      .from(accountSnapshots)
      .where(eq(accountSnapshots.userId, userId))
      .orderBy(asc(accountSnapshots.date)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.id)),
  ])
  return { accounts, snapshots, transactions: txns }
}

export type Workspace = Awaited<ReturnType<typeof getWorkspace>>

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
