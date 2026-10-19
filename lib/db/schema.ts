import {
  bigint,
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const creatorAccounts = pgTable('creator_accounts', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  handle: text('handle').notNull(),
  platform: text('platform').notNull().default('tiktok'),
  source: text('source').notNull().default('manual'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const accountSnapshots = pgTable(
  'account_snapshots',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    accountId: integer('accountId').notNull(),
    date: date('date', { mode: 'string' }).notNull(),
    followers: integer('followers').notNull().default(0),
    views: bigint('views', { mode: 'number' }).notNull().default(0),
    likes: bigint('likes', { mode: 'number' }).notNull().default(0),
    videos: integer('videos').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('account_snapshots_account_date_idx').on(t.accountId, t.date)],
)

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  accountId: integer('accountId'),
  description: text('description').notNull(),
  category: text('category').notNull().default('other'),
  kind: text('kind').notNull(),
  amountPence: integer('amountPence').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type CreatorAccount = typeof creatorAccounts.$inferSelect
export type Snapshot = typeof accountSnapshots.$inferSelect
export type Transaction = typeof transactions.$inferSelect
