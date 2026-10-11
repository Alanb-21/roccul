export type Currency = 'EUR' | 'GBP'
export type Rag = 'green' | 'amber' | 'red'

export type ProfileId = 'john' | 'ciara' | 'mark' | 'owen' | 'niamh' | 'declan'

export interface Profile {
  id: ProfileId
  name: string
  first: string
  initials: string
  role: string
  sites?: string[]
  homeSite?: string
}

export interface Milestone {
  name: string
  week: number
  done: boolean
}

export interface OnSite {
  company: string
  trade: string
  count: number
}

export interface Planned {
  id: string
  text: string
  done: boolean
}

export interface Project {
  id: string
  name: string
  area: string
  city: string
  country: 'IE' | 'UK'
  currency: Currency
  sector: string
  scope: string
  size: string
  client: string
  architect: string
  pm: string
  siteManager: string
  contractsManager: string
  contract: number
  budget: number
  committed: number
  costToDate: number
  forecastBase: number
  committedThisWeek: number
  weekNow: number
  weekTotal: number
  pct: number
  rag: Rag
  statusLine: string
  daysBehind: number
  marginHistory: number[]
  milestones: Milestone[]
  weather: { temp: number; cond: string; wind: number; rain: number; note?: string }
  onSite: OnSite[]
  planned: Planned[]
  tone: [string, string]
  handover: string
}

export type VarStatus = 'approved' | 'pending' | 'unpriced' | 'withQS'

export interface Variation {
  id: string
  ref: string
  projectId: string
  title: string
  raisedBy: string
  daysAgo: number
  status: VarStatus
  cost: number
  value: number
  note: string
  instruction: string
}

export interface Photo {
  caption: string
  tone: number
}

export interface DiaryEntry {
  id: string
  projectId: string
  author: string
  role: string
  at: number
  text: string
  area: string
  trade: string
  photo?: Photo
  photos?: number
}

export interface Rfi {
  id: string
  projectId: string
  ref: string
  title: string
  to: string
  daysAgo: number
  status: 'open' | 'answered' | 'overdue'
}

export interface Snag {
  id: string
  projectId: string
  ref: string
  location: string
  text: string
  trade: string
  assignee: string
  status: 'open' | 'closed'
  daysAgo: number
}

export interface Permit {
  id: string
  projectId: string
  ref: string
  type: string
  area: string
  issuedTo: string
  expires: string
  status: 'live' | 'expiring' | 'closed'
}

export interface Subbie {
  id: string
  name: string
  trade: string
  projects: string[]
  rams: 'ok' | 'review' | 'expiring'
  ramsNote: string
  insurance: 'ok' | 'expiring' | 'expired'
  insuranceNote: string
  blocked: boolean
  onSiteToday: number
}

export interface Toolbox {
  id: string
  projectId: string
  topic: string
  by: string
  daysAgo: number
  attendees: number
}

export interface NearMiss {
  id: string
  projectId: string
  text: string
  daysAgo: number
  action: string
  closed: boolean
}

export interface Nominee {
  id: string
  name: string
  role: string
  projectId: string
  reason: string
  votes: number
}

export interface Resource {
  id: string
  kind: 'crew' | 'plant'
  name: string
  short: string
  detail: string
  size?: number
  rate?: number
  currency?: Currency
  idleDays?: number
  onHire?: boolean
  supplier?: string
}

export interface Booking {
  id: string
  resourceId: string
  projectId: string
  day: number
}

export interface Doc {
  id: string
  projectId: string
  name: string
  kind: 'Drawing' | 'RAMS' | 'Programme' | 'Spec' | 'Certificate' | 'Minutes' | 'O&M'
  rev: string
  daysAgo: number
  by: string
}

export interface Valuation {
  projectId: string
  number: number
  applied: number
  certified: number
  retention: number
  due: string
  status: 'draft' | 'submitted' | 'certified'
}

export type FeedKind =
  | 'signin'
  | 'photo'
  | 'permit'
  | 'delivery'
  | 'toolbox'
  | 'snag'
  | 'rfi'
  | 'variation'
  | 'inspection'
  | 'plant'
  | 'cost'
  | 'safety'

export interface FeedItem {
  id: string
  projectId: string
  kind: FeedKind
  actor: string
  text: string
  at: number
  photo?: Photo
  fresh?: boolean
}

export interface Approval {
  id: string
  projectId: string
  kind: 'Variation' | 'RAMS' | 'Overtime' | 'Plant hire' | 'Purchase order'
  title: string
  from: string
  amount?: number
  daysAgo: number
  state: 'waiting' | 'approved' | 'rejected'
}
