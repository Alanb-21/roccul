import { CalendarRange, Calculator, Coins, FileText, Gauge, Home, Inbox, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react'
import type { ProfileId } from '../data/types'
import type { View } from '../store'

export interface NavItem {
  view: View
  label: string
  icon: LucideIcon
}

const N = {
  home: { view: 'home', label: 'Home', icon: Home },
  board: { view: 'board', label: 'Crews & Plant', icon: CalendarRange },
  cost: { view: 'cost', label: 'Cost', icon: Coins },
  safety: { view: 'safety', label: 'Safety', icon: ShieldCheck },
  reports: { view: 'reports', label: 'Reports', icon: FileText },
  impact: { view: 'impact', label: 'Impact', icon: Gauge },
  approvals: { view: 'approvals', label: 'Approvals', icon: Inbox },
  commercial: { view: 'commercial', label: 'Commercial', icon: Calculator },
  phone: { view: 'phone', label: 'Site app', icon: Smartphone },
} satisfies Record<string, NavItem>

export const navFor = (p: ProfileId): NavItem[] => {
  switch (p) {
    case 'john':
      return [N.home, N.board, N.cost, N.safety, N.reports, N.impact]
    case 'ciara':
      return [N.home, N.board, N.approvals, N.cost, N.safety]
    case 'mark':
    case 'owen':
      return [N.phone]
    case 'niamh':
      return [N.commercial, N.cost, N.reports]
    case 'declan':
      return [N.safety, N.home]
  }
}

export const sitesFor = (p: ProfileId, all: string[]) => {
  if (p === 'ciara') return ['gcd', 'ifsc', 'sandyford', 'cherrywood']
  if (p === 'mark') return ['gcd']
  if (p === 'owen') return ['manchester']
  return all
}
