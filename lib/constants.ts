export const INCOME_CATEGORIES = {
  brand_deal: 'Brand deal',
  creator_rewards: 'Creator Rewards',
  affiliate: 'Affiliate',
  gifts: 'LIVE gifts',
  subscriptions: 'Subscriptions',
  shop: 'TikTok Shop',
  other_income: 'Other income',
} as const

export const EXPENSE_CATEGORIES = {
  equipment: 'Equipment',
  software: 'Software',
  ads: 'Promotion',
  travel: 'Travel',
  props: 'Props & wardrobe',
  services: 'Freelancers',
  other_expense: 'Other expense',
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  other: 'Other',
}

export const categoryLabel = (key: string) => CATEGORY_LABELS[key] ?? key
