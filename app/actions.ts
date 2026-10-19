'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants'
import { db } from '@/lib/db'
import { accountSnapshots, creatorAccounts, transactions } from '@/lib/db/schema'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function refresh() {
  revalidatePath('/', 'layout')
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
  .refine((d) => !Number.isNaN(Date.parse(d)), 'Invalid date')
  .refine((d) => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    return d <= tomorrow
  }, 'Date can’t be in the future')

const count = (max: number) => z.coerce.number().int('Whole numbers only').min(0, 'Must be 0 or more').max(max, 'That number is too large')

async function ownsAccount(userId: string, accountId: number) {
  const [row] = await db
    .select({ id: creatorAccounts.id })
    .from(creatorAccounts)
    .where(and(eq(creatorAccounts.id, accountId), eq(creatorAccounts.userId, userId)))
  return Boolean(row)
}

const accountSchema = z.object({
  handle: z
    .string()
    .trim()
    .transform((h) => h.replace(/^@/, '').toLowerCase())
    .pipe(z.string().regex(/^[a-z0-9._]{2,24}$/, 'Handles are 2–24 letters, numbers, dots or underscores')),
})

export async function addAccount(input: { handle: string }): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = accountSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const handle = `@${parsed.data.handle}`
  const [existing] = await db
    .select({ id: creatorAccounts.id })
    .from(creatorAccounts)
    .where(and(eq(creatorAccounts.userId, userId), eq(creatorAccounts.handle, handle)))
  if (existing) return { ok: false, error: `${handle} is already in your workspace` }
  await db.insert(creatorAccounts).values({ userId, handle, platform: 'tiktok', source: 'manual' })
  refresh()
  return { ok: true }
}

export async function deleteAccount(accountId: number): Promise<ActionResult> {
  const userId = await getUserId()
  if (!(await ownsAccount(userId, accountId))) return { ok: false, error: 'Account not found' }
  await db.transaction(async (tx) => {
    await tx
      .delete(accountSnapshots)
      .where(and(eq(accountSnapshots.accountId, accountId), eq(accountSnapshots.userId, userId)))
    await tx
      .update(transactions)
      .set({ accountId: null })
      .where(and(eq(transactions.accountId, accountId), eq(transactions.userId, userId)))
    await tx
      .delete(creatorAccounts)
      .where(and(eq(creatorAccounts.id, accountId), eq(creatorAccounts.userId, userId)))
  })
  refresh()
  return { ok: true }
}

const snapshotSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  date: isoDate,
  followers: count(2_000_000_000),
  views: count(Number.MAX_SAFE_INTEGER),
  likes: count(Number.MAX_SAFE_INTEGER),
  videos: count(1_000_000),
})

export async function logSnapshot(input: z.input<typeof snapshotSchema>): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = snapshotSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = parsed.data
  if (!(await ownsAccount(userId, data.accountId))) return { ok: false, error: 'Account not found' }
  await db
    .insert(accountSnapshots)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: [accountSnapshots.accountId, accountSnapshots.date],
      set: {
        followers: data.followers,
        views: data.views,
        likes: data.likes,
        videos: data.videos,
        createdAt: sql`now()`,
      },
      setWhere: eq(accountSnapshots.userId, userId),
    })
  refresh()
  return { ok: true }
}

export async function deleteSnapshot(snapshotId: number): Promise<ActionResult> {
  const userId = await getUserId()
  await db
    .delete(accountSnapshots)
    .where(and(eq(accountSnapshots.id, snapshotId), eq(accountSnapshots.userId, userId)))
  refresh()
  return { ok: true }
}

const categoryKeys = [...Object.keys(INCOME_CATEGORIES), ...Object.keys(EXPENSE_CATEGORIES)] as [string, ...string[]]

const transactionSchema = z
  .object({
    description: z.string().trim().min(1, 'Add a description').max(120, 'Keep it under 120 characters'),
    amount: z
      .string()
      .trim()
      .regex(/^\d{1,7}(\.\d{1,2})?$/, 'Enter an amount like 49.99'),
    kind: z.enum(['income', 'expense']),
    category: z.enum(categoryKeys),
    accountId: z.coerce.number().int().nonnegative(),
    date: isoDate,
  })
  .refine((t) => (t.kind === 'income' ? t.category in INCOME_CATEGORIES : t.category in EXPENSE_CATEGORIES), {
    message: 'Category doesn’t match the transaction type',
  })

export async function addTransaction(input: z.input<typeof transactionSchema>): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = transactionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const t = parsed.data
  const [pounds, pence = ''] = t.amount.split('.')
  const amountPence = Number(pounds) * 100 + Number(pence.padEnd(2, '0'))
  if (amountPence <= 0) return { ok: false, error: 'Amount must be more than £0' }
  const accountId = t.accountId === 0 ? null : t.accountId
  if (accountId && !(await ownsAccount(userId, accountId))) return { ok: false, error: 'Account not found' }
  await db.insert(transactions).values({
    userId,
    description: t.description,
    amountPence,
    kind: t.kind,
    category: t.category,
    accountId,
    date: t.date,
  })
  refresh()
  return { ok: true }
}

export async function deleteTransaction(id: number): Promise<ActionResult> {
  const userId = await getUserId()
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  refresh()
  return { ok: true }
}

export async function deleteAllData(): Promise<ActionResult> {
  const userId = await getUserId()
  await db.transaction(async (tx) => {
    await tx.delete(accountSnapshots).where(eq(accountSnapshots.userId, userId))
    await tx.delete(transactions).where(eq(transactions.userId, userId))
    await tx.delete(creatorAccounts).where(eq(creatorAccounts.userId, userId))
  })
  refresh()
  return { ok: true }
}
