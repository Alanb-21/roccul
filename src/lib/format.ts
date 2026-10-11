import type { Currency } from '../data/types'

const sym = (c: Currency) => (c === 'GBP' ? '£' : '€')

/** Compact money: €3.8m, £412k, €4,800 */
export function money(v: number, c: Currency = 'EUR', opts: { exact?: boolean; dp?: number } = {}) {
  const s = sym(c)
  const neg = v < 0 ? '-' : ''
  const a = Math.abs(v)
  if (opts.exact || a < 10_000) return `${neg}${s}${Math.round(a).toLocaleString('en-IE')}`
  if (a >= 1_000_000) return `${neg}${s}${(a / 1_000_000).toFixed(opts.dp ?? 2).replace(/\.?0+$/, '')}m`
  return `${neg}${s}${(a / 1000).toFixed(opts.dp ?? (a < 100_000 ? 1 : 0)).replace(/\.0$/, '')}k`
}

export const pct = (v: number, dp = 1) => `${v.toFixed(dp)}%`

export function timeAgo(t: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - t) / 60000))
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24 && new Date(t).toDateString() === new Date(now).toDateString()) return `${h} hr ago`
  return clock(t, now)
}

export function clock(t: number, now = Date.now()) {
  const d = new Date(t)
  const hm = d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const today = new Date(now)
  if (d.toDateString() === today.toDateString()) return `Today ${hm}`
  const y = new Date(now - 86400000)
  if (d.toDateString() === y.toDateString()) return `Yesterday ${hm}`
  return `${d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}, ${hm}`
}

export function dayLabel(t: number, now = Date.now()) {
  const d = new Date(t)
  if (d.toDateString() === new Date(now).toDateString()) return 'Today'
  if (d.toDateString() === new Date(now - 86400000).toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function hhmm(t: number) {
  return new Date(t).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Monday to Friday of the working week being planned. Weekends roll on to next week. */
export function weekDays(now = new Date()) {
  const d = new Date(now)
  const dow = d.getDay()
  const offset = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow
  d.setDate(d.getDate() + offset)
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return {
      i,
      short: x.toLocaleDateString('en-IE', { weekday: 'short' }),
      long: x.toLocaleDateString('en-IE', { weekday: 'long' }),
      date: x.getDate(),
      month: x.toLocaleDateString('en-IE', { month: 'short' }),
      isToday: x.toDateString() === now.toDateString(),
    }
  })
}

export function greeting(now = new Date()) {
  const h = now.getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
