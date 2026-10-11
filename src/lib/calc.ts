import { GBP_TO_EUR } from '../data/seed'
import type { Booking, Project, Resource, Variation } from '../data/types'

export const toEur = (v: number, p: Pick<Project, 'currency'>) => (p.currency === 'GBP' ? v * GBP_TO_EUR : v)

export interface CostPos {
  revenue: number
  forecast: number
  margin: number
  marginValue: number
  unpricedCost: number
  unpricedCount: number
  approved: number
  pending: number
  costToComplete: number
}

export function costPosition(p: Project, vars: Variation[], plantSaving = 0, extra = 0): CostPos {
  const mine = vars.filter((v) => v.projectId === p.id)
  const approved = mine.filter((v) => v.status === 'approved').reduce((s, v) => s + v.value, 0)
  const pending = mine.filter((v) => v.status === 'pending').reduce((s, v) => s + v.value, 0)
  const unpriced = mine.filter((v) => v.status === 'unpriced' || v.status === 'withQS')
  const varCost = mine.reduce((s, v) => s + v.cost, 0)
  const revenue = p.contract + approved + pending
  const forecast = p.forecastBase + varCost - plantSaving + extra
  const marginValue = revenue - forecast
  return {
    revenue,
    forecast,
    margin: (marginValue / revenue) * 100,
    marginValue,
    unpricedCost: unpriced.reduce((s, v) => s + v.cost, 0),
    unpricedCount: unpriced.length,
    approved,
    pending,
    costToComplete: forecast - p.costToDate,
  }
}

export interface Clash {
  resourceId: string
  day: number
  bookings: Booking[]
}

export function findClashes(bookings: Booking[], resources: Resource[]): Clash[] {
  const map = new Map<string, Booking[]>()
  for (const b of bookings) {
    const r = resources.find((x) => x.id === b.resourceId)
    if (!r || (r.kind === 'plant' && r.onHire === false)) continue
    const k = `${b.resourceId}|${b.day}`
    map.set(k, [...(map.get(k) ?? []), b])
  }
  const out: Clash[] = []
  for (const [k, list] of map) {
    const projects = new Set(list.map((b) => b.projectId))
    if (projects.size > 1) {
      const [resourceId, day] = k.split('|')
      out.push({ resourceId, day: Number(day), bookings: list })
    }
  }
  return out
}

export const headcount = (p: Project) => p.onSite.reduce((s, o) => s + o.count, 0)
