import { motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, Calendar, ChevronRight, Coins, Package, Wrench } from 'lucide-react'
import { siteCode } from '../data/seed'
import type { Project } from '../data/types'
import { headcount, toEur } from '../lib/calc'
import { greeting, money, timeAgo } from '../lib/format'
import { sitesFor } from '../shell/nav'
import { profileById, useDecisions, useNow, useStore } from '../store'
import { AnimatedNumber, Badge, Card, Dot, Progress, SectionTitle, Sparkline, Stat, ragColor } from '../ui'

export function LiveStamp() {
  const { data } = useStore()
  const now = useNow(10000)
  const last = Math.max(...data.feed.map((f) => f.at))
  const label = timeAgo(last, now)
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ok/12 px-3 py-1 text-[13px] font-semibold text-ok">
      <Dot rag="green" pulse size={7} />
      Updated {label === 'Just now' ? 'just now' : label.replace(' ago', '') + ' ago'}
    </span>
  )
}

export function SiteTile({ p, i = 0 }: { p: Project; i?: number }) {
  const { actions, derived, threshold } = useStore()
  const pos = derived.pos[p.id]
  const trend = [...p.marginHistory, pos.margin]
  const down = trend[trend.length - 1] < trend[0]
  const below = pos.margin < threshold
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 28 }}>
      <Card as="button" onClick={() => actions.openSite(p.id)} className="group block w-full overflow-hidden p-2.5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] p-4 text-white" style={{ background: `linear-gradient(150deg, ${p.tone[0]}, ${p.tone[1]})` }}>
          <div className="photo-grain absolute inset-0" />
          <div className="absolute -bottom-5 -right-1 select-none text-[84px] font-black leading-none tracking-tighter text-white/[0.05]">{siteCode[p.id]}</div>
          <div className="relative flex items-center justify-between">
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">{p.sector}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
              <Dot rag={p.rag} size={7} />
              {p.rag === 'green' ? 'On track' : p.rag === 'amber' ? 'Watch' : 'At risk'}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="truncate text-[21px] font-semibold leading-tight tracking-tight">{p.name}</div>
            <div className="mt-0.5 text-[13px] text-white/70">
              {p.area}. Week {p.weekNow} of {p.weekTotal}
            </div>
          </div>
          <span className="absolute right-3 top-12 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white text-black opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="px-2 pb-1.5 pt-3.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="truncate font-medium text-fg2">{p.statusLine}</span>
            <span className="tnum font-semibold">{p.pct}%</span>
          </div>
          <Progress value={p.pct} className="mt-2" color={ragColor(p.rag)} height={5} />
          <div className="mt-3.5 flex items-end justify-between">
            <div>
              <div className="text-[12px] text-fg3">Forecast margin</div>
              <div className={`tnum text-[18px] font-semibold ${below ? 'text-warn' : ''}`}>
                <AnimatedNumber value={pos.margin} format={(v) => `${v.toFixed(1)}%`} />
              </div>
            </div>
            <Sparkline data={trend} w={110} h={34} color={below ? 'var(--warn)' : down ? 'var(--fg2)' : 'var(--ok)'} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const decisionIcon = { ifsc: Calendar, manchester: Coins, newcastle: Wrench, clash: Package } as Record<string, typeof Calendar>

export function NeedsYou({ filter }: { filter?: string[] }) {
  const { actions, ui } = useStore()
  const list = useDecisions(filter)
  const open = (id: string, site: string) => {
    if (id === 'ifsc') actions.openSite('ifsc', 'today')
    else if (id === 'manchester') actions.go(ui.profile === 'niamh' ? 'commercial' : 'cost', { focus: 'manchester' })
    else if (id === 'newcastle') actions.openSite('newcastle', 'snags')
    else if (id === 'clash') actions.go('board')
    else actions.openSite(site)
  }
  if (!list.length)
    return (
      <Card className="flex items-center gap-4 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ok/15 text-ok">
          <Dot rag="green" />
        </span>
        <div>
          <div className="text-[15px] font-semibold">Nothing waiting on you</div>
          <div className="text-[13px] text-fg2">Every decision from this morning is made. The sites have what they need.</div>
        </div>
      </Card>
    )
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {list.map((d, i) => {
        const Icon = decisionIcon[d.id] ?? AlertTriangle
        return (
          <motion.div key={d.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card as="button" onClick={() => open(d.id, d.site)} className="group flex h-full w-full items-start gap-4 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]" style={{ background: d.tone === 'red' ? 'color-mix(in srgb, var(--bad) 16%, transparent)' : 'color-mix(in srgb, var(--warn) 16%, transparent)', color: d.tone === 'red' ? 'var(--bad)' : 'var(--warn)' }}>
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug">{d.title}</span>
                <span className="mt-1 block text-[13px] leading-snug text-fg2">{d.body}</span>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-accent">
                  {d.cta}
                  <ChevronRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export function Home() {
  const { data, ui, derived, x } = useStore()
  const me = profileById(ui.profile)!
  const ids = sitesFor(ui.profile!, data.projects.map((p) => p.id))
  const sites = data.projects.filter((p) => ids.includes(p.id))
  const people = sites.reduce((s, p) => s + headcount(p), 0)
  const rev = sites.reduce((s, p) => s + toEur(derived.pos[p.id].revenue, p), 0)
  const mv = sites.reduce((s, p) => s + toEur(derived.pos[p.id].marginValue, p), 0)
  const committedWeek = sites.reduce((s, p) => s + toEur(p.committedThisWeek, p), 0)
  const decisions = useDecisions(ui.profile === 'ciara' ? ids : undefined)
  const hasUK = sites.some((p) => p.currency === 'GBP')
  const pendingApprovals = data.approvals.filter((a) => a.state === 'waiting' && ids.includes(a.projectId)).length
  const cities = [...new Set(sites.map((p) => p.city))]
  return (
    <div className="space-y-8">
      <div className="pt-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-[32px] font-semibold tracking-tight sm:text-[38px]">
            {greeting()} {me.first}
          </h1>
          <LiveStamp />
        </div>
        <p className="mt-1.5 text-[15px] text-fg2">
          {new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })}. {sites.length} live sites across {cities.slice(0, -1).join(', ')}
          {cities.length > 1 ? ` and ${cities[cities.length - 1]}` : cities[0]}.
        </p>
      </div>

      <Card className="grid grid-cols-2 gap-x-6 gap-y-6 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
        <Stat label="Live sites" value={sites.length} sub={`${sites.filter((p) => p.rag === 'green').length} on track`} />
        <Stat label="On site today" value={<AnimatedNumber value={people} format={(v) => Math.round(v).toString()} />} sub="Signed in, all trades" />
        <Stat
          label="Forecast margin"
          value={<AnimatedNumber value={(mv / rev) * 100} format={(v) => `${v.toFixed(1)}%`} />}
          sub={hasUK ? 'GBP converted at today\'s rate' : 'Across your sites'}
        />
        <Stat label="Committed this week" value={money(committedWeek, 'EUR')} sub="Orders placed since Monday" />
        <Stat
          label={ui.profile === 'ciara' ? 'Waiting on you' : 'Needs your decision'}
          value={<span className={decisions.length + (ui.profile === 'ciara' ? pendingApprovals : 0) ? 'text-warn' : 'text-ok'}>{decisions.length + (ui.profile === 'ciara' ? pendingApprovals : 0)}</span>}
          sub={x.caught.plant + x.caught.variations + x.caught.clashes > 0 ? `${money(x.caught.plant + x.caught.variations + x.caught.clashes, 'EUR')} caught today` : 'From live site data'}
        />
      </Card>

      <section>
        <SectionTitle action={<span className="text-[13px] text-fg3 max-sm:hidden">Tap one to go straight to the fix</span>}>Needs you today</SectionTitle>
        <NeedsYou filter={ui.profile === 'ciara' ? ids : undefined} />
      </section>

      <section>
        <SectionTitle action={hasUK ? <Badge>GBP shown in sterling</Badge> : undefined}>{ui.profile === 'ciara' ? 'Your sites' : 'Every site'}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sites.map((p, i) => (
            <SiteTile key={p.id} p={p} i={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
