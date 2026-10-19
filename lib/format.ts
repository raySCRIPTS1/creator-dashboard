const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const gbpCompact = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en-GB')

export const formatPence = (pence: number) => gbp.format(pence / 100)
export const formatPenceCompact = (pence: number) =>
  Math.abs(pence) >= 1_000_000 ? gbpCompact.format(pence / 100) : gbp.format(pence / 100)
export const formatCompact = (value: number) => compact.format(value)
export const formatNumber = (value: number) => full.format(value)

export function formatPercent(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d))
}

export function formatMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, 1))
}
