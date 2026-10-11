import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { GBP_TO_EUR, livePool, makeSeed, MARGIN_THRESHOLD, profiles, type Seed } from './data/seed'
import type { DiaryEntry, FeedItem, Photo, ProfileId, Variation } from './data/types'
import { costPosition, findClashes } from './lib/calc'
import { money } from './lib/format'

export type View =
  | 'home'
  | 'site'
  | 'board'
  | 'cost'
  | 'safety'
  | 'reports'
  | 'impact'
  | 'approvals'
  | 'commercial'
  | 'phone'

export type SiteTab = 'today' | 'diary' | 'crews' | 'cost' | 'safety' | 'snags' | 'documents'

export interface Toast {
  id: string
  title: string
  body?: string
  tone?: 'ok' | 'info' | 'warn'
  site?: string
}

export interface Extras {
  plantSaving: Record<string, number>
  extraCost: Record<string, number>
  ifscFix: null | 'saturday' | 'gang'
  snagBlitz: boolean
  certRequested: Record<string, boolean>
  nominated: Record<string, boolean>
  caught: { plant: number; variations: number; clashes: number }
  reportSent: boolean
}

const freshExtras = (): Extras => ({
  plantSaving: {},
  extraCost: {},
  ifscFix: null,
  snagBlitz: false,
  certRequested: {},
  nominated: {},
  caught: { plant: 0, variations: 0, clashes: 0 },
  reportSent: false,
})

export interface UI {
  profile: ProfileId | null
  view: View
  siteId: string
  siteTab: SiteTab
  mode: 'then' | 'now'
  theme: 'dark' | 'light'
  demo: boolean
  walkOpen: boolean
  walkHidden: boolean
  cmdOpen: boolean
  settingsOpen: boolean
  liveOpen: boolean
  focus: string | null
  diaryQuery: string
  navKey: number
}

const freshUI = (): UI => ({
  profile: null,
  view: 'home',
  siteId: 'gcd',
  siteTab: 'today',
  mode: 'now',
  theme: 'dark',
  demo: true,
  walkOpen: false,
  walkHidden: false,
  cmdOpen: false,
  settingsOpen: false,
  liveOpen: false,
  focus: null,
  diaryQuery: '',
  navKey: 0,
})

const isUK = (id: string) => id === 'manchester' || id === 'newcastle'

let uid = 1000
export const nextId = (p = 'x') => `${p}${++uid}`

function useStoreValue() {
  const [data, setData] = useState<Seed>(makeSeed)
  const [x, setX] = useState<Extras>(freshExtras)
  const [ui, setUI] = useState<UI>(freshUI)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [threshold, setThreshold] = useState(MARGIN_THRESHOLD)

  const actions = useMemo(() => {
    const toast = (t: Omit<Toast, 'id'>) => {
      const id = nextId('t')
      setToasts((l) => [...l.slice(-2), { ...t, id }])
      window.setTimeout(() => setToasts((l) => l.filter((y) => y.id !== id)), 4200)
    }
    const feed = (f: Omit<FeedItem, 'id' | 'at'>) =>
      setData((d) => ({ ...d, feed: [{ ...f, id: nextId('f'), at: Date.now(), fresh: true }, ...d.feed].slice(0, 60) }))
    const patchUI = (p: Partial<UI>) => setUI((u) => ({ ...u, ...p }))
    const go = (view: View, p: Partial<UI> = {}) =>
      setUI((u) => ({ ...u, view, focus: null, liveOpen: false, ...p, navKey: u.navKey + 1 }))

    const setVar = (id: string, fn: (v: Variation) => Variation) =>
      setData((d) => ({ ...d, variations: d.variations.map((v) => (v.id === id ? fn(v) : v)) }))

    return {
      toast,
      feed,
      patchUI,
      go,
      openSite: (siteId: string, siteTab: SiteTab = 'today', extra: Partial<UI> = {}) =>
        go('site', { siteId, siteTab, ...extra }),
      setTab: (siteTab: SiteTab) => setUI((u) => ({ ...u, siteTab, navKey: u.navKey + 1 })),
      setProfile: (profile: ProfileId | null) =>
        setUI((u) => ({
          ...u,
          profile,
          view: profile === 'mark' || profile === 'owen' ? 'phone' : profile === 'niamh' ? 'commercial' : profile === 'declan' ? 'safety' : 'home',
          mode: 'now',
          focus: null,
          navKey: u.navKey + 1,
        })),
      setMode: (mode: 'then' | 'now') => setUI((u) => ({ ...u, mode, navKey: u.navKey + 1 })),
      toggleTheme: () => setUI((u) => ({ ...u, theme: u.theme === 'dark' ? 'light' : 'dark' })),
      setThreshold,
      reset: () => {
        setData(makeSeed())
        setX(freshExtras())
        setThreshold(MARGIN_THRESHOLD)
        setUI((u) => ({ ...freshUI(), theme: u.theme, profile: 'john', walkHidden: u.walkHidden, navKey: u.navKey + 1 }))
        toast({ title: 'Demo reset', body: 'All sites back to this morning.', tone: 'info' })
      },

      priceVariation: (v: Variation, value: number, who = 'Niamh Kelly') => {
        setVar(v.id, (y) => ({ ...y, status: 'pending', value, note: `Priced by ${who}, issued to client for sign off` }))
        setX((e) => ({ ...e, caught: { ...e.caught, variations: e.caught.variations + (isUK(v.projectId) ? value * GBP_TO_EUR : value) } }))
        feed({ projectId: v.projectId, kind: 'variation', actor: who, text: `Priced ${v.ref} at ${money(value, isUK(v.projectId) ? 'GBP' : 'EUR', { exact: true })} and issued to client` })
      },
      sendToQS: (v: Variation) => {
        setVar(v.id, (y) => ({ ...y, status: 'withQS' }))
        toast({ title: 'Sent to Niamh Kelly', body: `${v.ref} is in her pricing queue now.`, tone: 'info' })
      },
      addVariation: (projectId: string, title: string, cost: number, by: string, note: string) => {
        setData((d) => {
          const refs = d.variations.filter((v) => v.projectId === projectId).map((v) => Number(v.ref.slice(2)))
          const ref = `V-${String(Math.max(0, ...refs) + 1).padStart(3, '0')}`
          const v: Variation = { id: `${projectId}-${ref}`, ref, projectId, title, status: 'unpriced', cost, value: Math.round(cost * 1.38 / 50) * 50, raisedBy: by, daysAgo: 0, instruction: 'Site instruction, logged on Roccul Live', note }
          return { ...d, variations: [...d.variations, v] }
        })
        feed({ projectId, kind: 'variation', actor: by, text: `Logged variation: ${title}` })
      },
      setVar,

      moveBooking: (id: string, projectId: string, day: number) =>
        setData((d) => ({ ...d, bookings: d.bookings.map((b) => (b.id === id ? { ...b, projectId, day } : b)) })),
      offHire: (resourceId: string) => {
        setData((d) => {
          const r = d.resources.find((y) => y.id === resourceId)
          if (!r) return d
          const pid = d.bookings.find((b) => b.resourceId === resourceId)?.projectId ?? 'newcastle'
          const p = d.projects.find((y) => y.id === pid)!
          const weeksLeft = p.weekTotal - p.weekNow
          const saving = (r.rate ?? 0) * weeksLeft
          setX((e) => ({
            ...e,
            plantSaving: { ...e.plantSaving, [pid]: (e.plantSaving[pid] ?? 0) + saving },
            caught: { ...e.caught, plant: e.caught.plant + (r.currency === 'GBP' ? saving * GBP_TO_EUR : saving) },
          }))
          return {
            ...d,
            resources: d.resources.map((y) => (y.id === resourceId ? { ...y, onHire: false } : y)),
            bookings: d.bookings.filter((b) => b.resourceId !== resourceId),
            feed: [
              { id: nextId('f'), projectId: pid, kind: 'plant', actor: 'Roccul Live', text: `${r.short} off-hired with ${r.supplier}. Collection booked.`, at: Date.now(), fresh: true },
              ...d.feed,
            ],
          }
        })
      },
      clashFixed: (value: number) => setX((e) => ({ ...e, caught: { ...e.caught, clashes: e.caught.clashes + value } })),

      fixIfsc: (choice: 'saturday' | 'gang') => {
        const cost = choice === 'saturday' ? 4800 : 7200
        setX((e) => ({ ...e, ifscFix: choice, extraCost: { ...e.extraCost, ifsc: (e.extraCost.ifsc ?? 0) + cost } }))
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) =>
            p.id === 'ifsc'
              ? { ...p, rag: 'amber', daysBehind: choice === 'saturday' ? 2 : 0, statusLine: choice === 'saturday' ? 'Recovering, 2 days behind' : 'Recovery plan in place' }
              : p,
          ),
          approvals: d.approvals.map((a) => (a.id === 'a2' ? { ...a, state: 'approved' } : a)),
        }))
        feed({
          projectId: 'ifsc',
          kind: 'cost',
          actor: 'John McCormack',
          text: choice === 'saturday' ? 'Approved Saturday working for Apex Ceilings, €4,800' : 'Approved second Apex ceiling gang from Monday, €7,200',
        })
        toast({ title: 'IFSC recovery approved', body: choice === 'saturday' ? 'Apex in Saturday. Delay down to 2 days.' : 'Second gang Monday. Back on programme.', tone: 'ok', site: 'ifsc' })
      },
      snagBlitz: () => {
        setX((e) => ({ ...e, snagBlitz: true }))
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === 'newcastle' ? { ...p, statusLine: 'Snag blitz booked Saturday' } : p)),
        }))
        feed({ projectId: 'newcastle', kind: 'snag', actor: 'John McCormack', text: 'Snag blitz booked Saturday: Northern Partitions, Tyne Decorators, Irwell' })
        toast({ title: 'Snag blitz booked', body: 'Saturday at Quayside. Subbies notified, snags assigned.', tone: 'ok', site: 'newcastle' })
      },
      closeSnag: (id: string) => setData((d) => ({ ...d, snags: d.snags.map((s) => (s.id === id ? { ...s, status: 'closed' } : s)) })),
      raiseSnag: (projectId: string, location: string, text: string, trade: string, by: string) => {
        setData((d) => {
          const n = Math.max(...d.snags.map((s) => Number(s.ref.slice(3)))) + 1
          return { ...d, snags: [{ id: nextId('sn'), projectId, ref: `SN-${n}`, location, text, trade, assignee: 'To assign', status: 'open', daysAgo: 0 }, ...d.snags] }
        })
        feed({ projectId, kind: 'snag', actor: by, text: `Raised snag: ${text}, ${location}` })
      },
      togglePlanned: (projectId: string, pid: string) =>
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === projectId ? { ...p, planned: p.planned.map((x) => (x.id === pid ? { ...x, done: !x.done } : x)) } : p)),
        })),
      postDiary: (e: Omit<DiaryEntry, 'id' | 'at'>, notify = true) => {
        setData((d) => ({ ...d, diary: [{ ...e, id: nextId('d'), at: Date.now() }, ...d.diary] }))
        feed({ projectId: e.projectId, kind: e.photo ? 'photo' : 'inspection', actor: e.author, text: e.photo ? `Posted a photo: ${e.photo.caption}` : e.text, photo: e.photo })
        if (notify) toast({ title: `${e.author} posted an update`, body: e.text, tone: 'info', site: e.projectId })
      },
      signIn: (projectId: string, company: string, count: number, by: string) => {
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === projectId ? { ...p, onSite: p.onSite.map((o) => (o.company === company ? { ...o, count: o.count + count } : o)) } : p)),
        }))
        feed({ projectId, kind: 'signin', actor: by, text: `${company} signed in ${count} operative${count > 1 ? 's' : ''}` })
      },
      logToolbox: (projectId: string, topic: string, attendees: number, by: string) => {
        setData((d) => ({ ...d, toolbox: [{ id: nextId('tb'), projectId, topic, attendees, by, daysAgo: 0 }, ...d.toolbox] }))
        feed({ projectId, kind: 'toolbox', actor: by, text: `Toolbox talk done: ${topic.toLowerCase()}, ${attendees} signed` })
      },
      nominate: (id: string) => {
        setX((e) => ({ ...e, nominated: { ...e.nominated, [id]: true } }))
        setData((d) => ({ ...d, nominees: d.nominees.map((n) => (n.id === id ? { ...n, votes: n.votes + 1 } : n)) }))
      },
      logNearMiss: (projectId: string, text: string) => {
        setData((d) => ({ ...d, nearMisses: [{ id: nextId('nm'), projectId, text, daysAgo: 0, action: 'Assigned to site manager for close out', closed: false }, ...d.nearMisses] }))
        feed({ projectId, kind: 'safety', actor: 'Declan Ward', text: `Near miss logged: ${text}` })
      },
      closeNearMiss: (id: string) => setData((d) => ({ ...d, nearMisses: d.nearMisses.map((n) => (n.id === id ? { ...n, closed: true } : n)) })),
      requestCert: (id: string) => setX((e) => ({ ...e, certRequested: { ...e.certRequested, [id]: true } })),
      unblock: (id: string) => setData((d) => ({ ...d, subbies: d.subbies.map((s) => (s.id === id ? { ...s, insurance: 'ok', insuranceNote: 'Renewed certificate on file', blocked: false } : s)) })),
      approveRams: (id: string) => setData((d) => ({ ...d, subbies: d.subbies.map((s) => (s.id === id ? { ...s, rams: 'ok', ramsNote: 'Approved today by Declan Ward' } : s)) })),
      closePermit: (id: string) => setData((d) => ({ ...d, permits: d.permits.map((p) => (p.id === id ? { ...p, status: 'closed', expires: 'Closed just now' } : p)) })),
      extendPermit: (id: string) => setData((d) => ({ ...d, permits: d.permits.map((p) => (p.id === id ? { ...p, status: 'live', expires: 'Today 18:00 (extended)' } : p)) })),
      decide: (id: string, state: 'approved' | 'rejected') => setData((d) => ({ ...d, approvals: d.approvals.map((a) => (a.id === id ? { ...a, state } : a)) })),
      submitValuation: (projectId: string) =>
        setData((d) => ({ ...d, valuations: d.valuations.map((v) => (v.projectId === projectId ? { ...v, status: 'submitted' } : v)) })),
      reportSent: () => setX((e) => ({ ...e, reportSent: true })),
      liveEvent: (photo?: Photo) => {
        const item = livePool[Math.floor(Math.random() * livePool.length)]
        setData((d) => {
          const projects = item.kind === 'signin' ? d.projects.map((p) => (p.id === item.projectId ? { ...p, onSite: p.onSite.map((o, i) => (i === 1 ? { ...o, count: o.count + 2 } : o)) } : p)) : d.projects
          return { ...d, projects, feed: [{ ...item, photo: item.photo ?? photo, id: nextId('f'), at: Date.now(), fresh: true }, ...d.feed].slice(0, 60) }
        })
        return item
      },
    }
  }, [])

  // Derived
  const derived = useMemo(() => {
    const pos = Object.fromEntries(
      data.projects.map((p) => [p.id, costPosition(p, data.variations, x.plantSaving[p.id] ?? 0, x.extraCost[p.id] ?? 0)]),
    )
    const clashes = findClashes(data.bookings, data.resources)
    const newcastleOpen = data.snags.filter((s) => s.projectId === 'newcastle' && s.status === 'open').length
    const manUnpriced = data.variations.filter((v) => v.projectId === 'manchester' && (v.status === 'unpriced' || v.status === 'withQS'))
    const idle = data.resources.filter((r) => r.kind === 'plant' && r.onHire && (r.idleDays ?? 0) >= 5)
    return { pos, clashes, newcastleOpen, manUnpriced, idle }
  }, [data, x])

  return { data, x, ui, toasts, threshold, actions, derived, setToasts }
}

export type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const s = useStoreValue()
  const { ui, actions } = s
  const ref = useRef(s)
  ref.current = s

  useEffect(() => {
    document.documentElement.dataset.theme = ui.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ui.theme === 'dark' ? '#0B0C0E' : '#EEF0F3')
  }, [ui.theme])

  // Demo mode: a believable event every 20 to 30 seconds
  useEffect(() => {
    if (!ui.demo || !ui.profile || ui.mode === 'then') return
    let t: number
    const tick = () => {
      t = window.setTimeout(() => {
        const item = actions.liveEvent()
        const p = ref.current.data.projects.find((y) => y.id === item.projectId)
        actions.toast({ title: p?.name ?? 'Site', body: item.text, tone: 'info', site: item.projectId })
        tick()
      }, 20000 + Math.random() * 10000)
    }
    tick()
    return () => window.clearTimeout(t)
  }, [ui.demo, ui.profile, ui.mode, actions])

  return <Ctx.Provider value={s}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('No store')
  return s
}

export function useNow(ms = 15000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(i)
  }, [ms])
  return now
}

export const profileById = (id: ProfileId | null) => profiles.find((p) => p.id === id)

/** Decisions waiting on the director, worked out from live state. */
export function useDecisions(siteFilter?: string[]) {
  const { data, x, derived } = useStore()
  const out: { id: string; site: string; title: string; body: string; tone: 'red' | 'amber'; cta: string }[] = []
  const ifsc = data.projects.find((p) => p.id === 'ifsc')!
  if (!x.ifscFix)
    out.push({ id: 'ifsc', site: 'ifsc', tone: 'red', title: 'IFSC ceilings 6 days behind', body: `Apex have ${ifsc.onSite.find((o) => o.company === 'Apex Ceilings')?.count ?? 3} on site, 6 planned. Kilbride M&E second fix is stood down waiting.`, cta: 'Pick a recovery' })
  if (derived.manUnpriced.length)
    out.push({ id: 'manchester', site: 'manchester', tone: 'amber', title: `Manchester: ${derived.manUnpriced.length} unpriced variation${derived.manUnpriced.length > 1 ? 's' : ''}`, body: `${money(derived.manUnpriced.reduce((s, v) => s + v.cost, 0), 'GBP')} of work on site with no price. Margin down to ${derived.pos.manchester.margin.toFixed(1)}%.`, cta: 'Price them' })
  if (!x.snagBlitz)
    out.push({ id: 'newcastle', site: 'newcastle', tone: 'amber', title: `Newcastle: ${derived.newcastleOpen} snags open`, body: 'Handover in 2 weeks. At this rate 14 will still be open on the day.', cta: 'Plan the close out' })
  if (derived.clashes.length) {
    const c = derived.clashes[0]
    const r = data.resources.find((y) => y.id === c.resourceId)!
    out.push({ id: 'clash', site: c.bookings[1]?.projectId ?? 'ifsc', tone: 'red', title: `${r.name.split(',')[0]} double-booked ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][c.day]}`, body: 'Booked at Grand Canal Dock and IFSC on the same day.', cta: 'Fix on the board' })
  }
  return siteFilter ? out.filter((d) => siteFilter.includes(d.site) || (d.id === 'clash' && siteFilter.includes('gcd'))) : out
}
