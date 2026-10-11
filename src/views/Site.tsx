import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  Circle,
  Cloud,
  CloudRain,
  FileText,
  HardHat,
  Package,
  Plus,
  Search,
  Send,
  Share2,
  Sun,
  Wind,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Loader } from '../ui/Loader'
import { siteCode } from '../data/seed'
import type { DiaryEntry, Doc, Project } from '../data/types'
import { headcount } from '../lib/calc'
import { cx, dayLabel, hhmm, money, timeAgo, weekDays } from '../lib/format'
import { profileById, useNow, useStore, type SiteTab } from '../store'
import { Avatar, Badge, Button, Card, Dot, Empty, Field, PhotoTile, Progress, SectionTitle, Segmented, Sheet, Stat, inputCls, ragColor, spring } from '../ui'
import { PriceSheet, VariationRow } from './shared'
import type { Variation } from '../data/types'

const TABS: { id: SiteTab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'diary', label: 'Diary' },
  { id: 'crews', label: 'Crews & Plant' },
  { id: 'cost', label: 'Cost' },
  { id: 'safety', label: 'Safety' },
  { id: 'snags', label: 'Snags' },
  { id: 'documents', label: 'Documents' },
]

function Hero({ p }: { p: Project }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] p-6 text-white sm:p-7" style={{ background: `linear-gradient(140deg, ${p.tone[0]}, ${p.tone[1]} 75%)` }}>
      <div className="photo-grain absolute inset-0" />
      <div className="absolute -bottom-8 right-2 select-none text-[150px] font-black leading-none tracking-tighter text-white/[0.06]">{siteCode[p.id]}</div>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-md">{p.scope}</span>
          <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-md">
            <Dot rag={p.rag} size={7} /> {p.statusLine}
          </span>
        </div>
        <h1 className="mt-4 text-[36px] font-semibold leading-none tracking-tight sm:text-[48px]">{p.name}</h1>
        <p className="mt-2 text-[15px] text-white/75">
          {p.area}. {p.size}. {p.client}. Architect {p.architect}. PM {p.pm}.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <div className="text-[12px] text-white/60">Programme</div>
            <div className="tnum text-[17px] font-semibold">
              Week {p.weekNow} of {p.weekTotal}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-white/60">Complete</div>
            <div className="tnum text-[17px] font-semibold">{p.pct}%</div>
          </div>
          <div>
            <div className="text-[12px] text-white/60">Contract</div>
            <div className="tnum text-[17px] font-semibold">{money(p.contract, p.currency)}</div>
          </div>
          <div>
            <div className="text-[12px] text-white/60">Site manager</div>
            <div className="text-[17px] font-semibold">{p.siteManager}</div>
          </div>
          <div className="min-w-[160px] flex-1">
            <div className="mb-2 text-right text-[12px] text-white/60">{p.handover}</div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${(p.weekNow / p.weekTotal) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IfscRecovery() {
  const { x, actions, data } = useStore()
  const p = data.projects.find((y) => y.id === 'ifsc')!
  if (x.ifscFix)
    return (
      <Card className="flex items-start gap-4 border-ok/30 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
          <CheckCircle2 size={22} />
        </span>
        <div>
          <div className="text-[16px] font-semibold">Recovery approved</div>
          <div className="mt-0.5 text-[14px] text-fg2">
            {x.ifscFix === 'saturday' ? 'Apex in Saturday with 6 men. Delay down to 2 days, Kilbride back on L2 zone A Monday.' : 'Second Apex gang from Monday. Back on programme by week 11. Kilbride notified.'} Now {p.daysBehind} days behind.
          </div>
        </div>
      </Card>
    )
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-start gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bad/15 text-bad">
          <AlertTriangle size={20} />
        </span>
        <div>
          <div className="text-[17px] font-semibold">Ceilings 6 days behind on L2</div>
          <div className="mt-1 text-[14px] leading-relaxed text-fg2">
            Apex Ceilings have 3 on site against 6 planned. Zone C grid not started. Kilbride M&E stood down 2 men from second fix yesterday. Left as is, practical completion moves to 6 Feb.
          </div>
        </div>
      </div>
      <div className="grid gap-3 border-t border-hairline p-4 sm:grid-cols-2">
        {[
          { id: 'saturday' as const, t: 'Saturday working', d: 'Apex 6 men this Saturday and next', c: '€4,800', r: 'Recovers 4 days' },
          { id: 'gang' as const, t: 'Second Apex gang', d: '6 more from Monday for 2 weeks', c: '€7,200', r: 'Back on programme' },
        ].map((o) => (
          <button key={o.id} onClick={() => actions.fixIfsc(o.id)} className="group rounded-[18px] bg-fill p-4 text-left transition hover:bg-fill2 active:scale-[0.99]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">{o.t}</span>
              <span className="tnum text-[15px] font-semibold">{o.c}</span>
            </div>
            <div className="mt-1 text-[13px] text-fg2">{o.d}</div>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="ok">{o.r}</Badge>
              <span className="text-[13px] font-semibold text-accent opacity-80 transition group-hover:opacity-100">Approve</span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

function Weather({ p }: { p: Project }) {
  const Icon = p.weather.cond.includes('rain') || p.weather.cond.includes('showers') ? CloudRain : p.weather.cond === 'Bright' ? Sun : p.weather.wind > 25 ? Wind : Cloud
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium text-fg2">Weather, {p.city}</div>
        <Icon size={20} className="text-fg2" />
      </div>
      <div className="mt-2 flex items-end gap-3">
        <span className="tnum text-[40px] font-semibold leading-none">{p.weather.temp}°</span>
        <span className="pb-1 text-[15px] font-medium">{p.weather.cond}</span>
      </div>
      <div className="mt-3 flex gap-4 text-[13px] text-fg2">
        <span className="flex items-center gap-1.5">
          <Wind size={14} /> {p.weather.wind} km/h
        </span>
        <span className="flex items-center gap-1.5">
          <CloudRain size={14} /> {p.weather.rain}%
        </span>
      </div>
      {p.weather.note && <div className="mt-3 rounded-[14px] bg-warn/12 px-3 py-2.5 text-[13px] font-medium leading-snug text-warn">{p.weather.note}</div>}
    </Card>
  )
}

function Today({ p }: { p: Project }) {
  const { data, actions } = useStore()
  const now = useNow()
  const lastPhoto = data.diary.filter((d) => d.projectId === p.id && d.photo).sort((a, b) => b.at - a.at)[0]
  const done = p.planned.filter((x) => x.done).length
  const rfis = data.rfis.filter((r) => r.projectId === p.id && r.status !== 'answered')
  const subs = p.onSite.filter((o) => !o.company.startsWith('Roccul'))
  return (
    <div className="space-y-4">
      {p.id === 'ifsc' && <IfscRecovery />}
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-fg2">Planned today</div>
                <div className="tnum mt-0.5 text-[17px] font-semibold">
                  {done} of {p.planned.length} done
                </div>
              </div>
              <div className="w-28">
                <Progress value={(done / p.planned.length) * 100} color="var(--ok)" />
              </div>
            </div>
            <div className="mt-3 space-y-0.5">
              {p.planned.map((x) => (
                <button key={x.id} onClick={() => actions.togglePlanned(p.id, x.id)} className="flex w-full items-center gap-3 rounded-[14px] px-2 py-2.5 text-left transition hover:bg-fill">
                  <motion.span animate={{ scale: x.done ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                    {x.done ? <CheckCircle2 size={21} className="text-ok" /> : <Circle size={21} className="text-fg3" />}
                  </motion.span>
                  <span className={cx('text-[14px]', x.done && 'text-fg2 line-through decoration-fg3')}>{x.text}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[13px] font-medium text-fg2">On site now</div>
                <div className="tnum mt-0.5 text-[34px] font-semibold leading-none">{headcount(p)}</div>
              </div>
              <span className="text-[13px] text-fg3">{subs.length} subcontractors signed in</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {p.onSite.map((o) => {
                const sub = data.subbies.find((s) => s.name.startsWith(o.company))
                return (
                  <div key={o.company} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-fill2 text-fg2">
                      {o.company.startsWith('Roccul') ? <Building2 size={15} /> : <HardHat size={15} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{o.company}</span>
                      <span className="block truncate text-[12px] text-fg2">{o.trade}</span>
                    </span>
                    {sub && sub.rams !== 'ok' && <Badge tone="warn">RAMS review</Badge>}
                    <span className="tnum w-8 text-right text-[15px] font-semibold">{o.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          {lastPhoto && (
            <Card className="p-2.5">
              <PhotoTile photo={lastPhoto.photo!} className="aspect-[4/3] w-full" />
              <div className="flex items-center justify-between px-2 pb-1 pt-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-fg2">Last photo in</div>
                  <div className="truncate text-[14px] font-semibold">{lastPhoto.author}</div>
                </div>
                <span className="tnum text-[13px] text-fg3">{timeAgo(lastPhoto.at, now)}</span>
              </div>
            </Card>
          )}
          <Weather p={p} />
          {rfis.length > 0 && (
            <Card className="p-5">
              <div className="text-[13px] font-medium text-fg2">Open RFIs</div>
              <div className="mt-2 space-y-2.5">
                {rfis.map((r) => (
                  <div key={r.id} className="flex items-start gap-3">
                    <span className="tnum mt-0.5 text-[12px] font-semibold text-fg3">{r.ref}</span>
                    <span className="min-w-0 flex-1 text-[14px] leading-snug">{r.title}</span>
                    {r.status === 'overdue' ? <Badge tone="bad">{r.daysAgo}d, overdue</Badge> : <Badge>{r.daysAgo}d</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      <Card className="p-5">
        <SectionTitle>Programme</SectionTitle>
        <div className="relative">
          <div className="absolute left-0 right-0 top-[9px] h-[2px] rounded-full bg-fill2" />
          <div className="absolute left-0 top-[9px] h-[2px] rounded-full" style={{ width: `${(p.weekNow / p.weekTotal) * 100}%`, background: ragColor(p.rag) }} />
          <div className="relative flex justify-between gap-2 overflow-x-auto noscroll">
            {p.milestones.map((m) => {
              const late = !m.done && m.week <= p.weekNow
              return (
                <div key={m.name} className="flex min-w-[88px] flex-1 flex-col items-center text-center">
                  <span className={cx('grid h-5 w-5 place-items-center rounded-full ring-4 ring-[var(--bg)]', m.done ? 'bg-ok' : late ? 'bg-bad' : 'bg-fill2')}>
                    {m.done && <CheckCircle2 size={12} className="text-white" />}
                  </span>
                  <span className="mt-2 text-[12px] font-semibold leading-tight">{m.name}</span>
                  <span className={cx('tnum mt-0.5 text-[11px]', late ? 'font-semibold text-bad' : 'text-fg3')}>Wk {m.week}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[4px] bg-accent/30 px-0.5 text-fg">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

function DiaryItem({ d, q, showSite }: { d: DiaryEntry; q: string; showSite?: boolean }) {
  const { data } = useStore()
  const p = data.projects.find((y) => y.id === d.projectId)!
  const initials = d.author.split(' ').map((w) => w[0]).join('')
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex gap-3">
      <Avatar initials={initials} size={38} />
      <div className="min-w-0 max-w-[620px] flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[14px] font-semibold">{d.author}</span>
          <span className="text-[12px] text-fg3">{d.role}</span>
          <span className="tnum text-[12px] text-fg3">{hhmm(d.at)}</span>
          {showSite && <Badge className="ml-auto">{p.name}</Badge>}
        </div>
        <div className="glass mt-1.5 rounded-[6px_20px_20px_20px] p-3">
          {d.photo && <PhotoTile photo={{ ...d.photo }} className="mb-2.5 aspect-[16/9] w-full max-w-[420px]" />}
          <p className="px-1 text-[14px] leading-relaxed">
            <Highlight text={d.text} q={q} />
          </p>
          {d.photo && q && d.photo.caption.toLowerCase().includes(q.toLowerCase()) && (
            <p className="mt-1 px-1 text-[12px] text-fg2">
              Photo: <Highlight text={d.photo.caption} q={q} />
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5 px-1">
            <span className="rounded-full bg-fill2 px-2 py-0.5 text-[11px] font-semibold text-fg2">{d.area}</span>
            <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">{d.trade}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Diary({ p }: { p: Project }) {
  const { data, ui, actions } = useStore()
  const me = profileById(ui.profile)!
  const [q, setQ] = useState(ui.diaryQuery)
  const [scope, setScope] = useState<'site' | 'all'>(ui.diaryQuery ? 'all' : 'site')
  const [trade, setTrade] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const term = q.trim().toLowerCase()
  const list = useMemo(
    () =>
      data.diary
        .filter((d) => (scope === 'all' ? true : d.projectId === p.id))
        .filter((d) => !trade || d.trade === trade)
        .filter((d) => !term || [d.text, d.area, d.trade, d.author, d.photo?.caption ?? ''].some((s) => s.toLowerCase().includes(term)))
        .sort((a, b) => b.at - a.at),
    [data.diary, scope, p.id, trade, term],
  )
  const trades = [...new Set(data.diary.filter((d) => d.projectId === p.id).map((d) => d.trade))].slice(0, 7)
  const groups = list.reduce<Record<string, DiaryEntry[]>>((a, d) => ((a[dayLabel(d.at)] ??= []).push(d), a), {})
  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-full bg-fill px-4 hair focus-within:ring-2 focus-within:ring-accent/50">
            <Search size={17} className="text-fg3" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                if (e.target.value && scope === 'site' && !q) setScope('all')
              }}
              placeholder="Search the diary, try ceiling grid"
              className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg3"
            />
            {q && (
              <button onClick={() => setQ('')} className="grid h-6 w-6 place-items-center rounded-full bg-fill2 text-fg2" aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>
          <Segmented
            value={scope}
            onChange={setScope}
            options={[
              { value: 'site', label: 'This site' },
              { value: 'all', label: 'All sites' },
            ]}
          />
        </div>
        <div className="noscroll mt-3 flex gap-1.5 overflow-x-auto px-1">
          <button onClick={() => setTrade(null)} className={cx('h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition', !trade ? 'bg-fg text-[var(--bg)]' : 'bg-fill2 text-fg2 hover:text-fg')}>
            All trades
          </button>
          {trades.map((t) => (
            <button key={t} onClick={() => setTrade(trade === t ? null : t)} className={cx('h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition', trade === t ? 'bg-fg text-[var(--bg)]' : 'bg-fill2 text-fg2 hover:text-fg')}>
              {t}
            </button>
          ))}
        </div>
      </Card>
      {ui.profile !== 'niamh' && (
        <div className="flex items-center gap-2">
          <Avatar initials={me.initials} size={38} />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && note.trim() && (actions.postDiary({ projectId: p.id, author: me.name, role: me.role.split(',')[0], text: note.trim(), area: 'Site wide', trade: 'Management' }, false), setNote(''))}
            placeholder={`Add a note to the ${p.name} diary`}
            className={`${inputCls} rounded-full`}
          />
          <Button
            variant="primary"
            icon={<Send size={15} />}
            disabled={!note.trim()}
            onClick={() => {
              actions.postDiary({ projectId: p.id, author: me.name, role: me.role.split(',')[0], text: note.trim(), area: 'Site wide', trade: 'Management' }, false)
              setNote('')
            }}
          >
            Post
          </Button>
        </div>
      )}
      {term && (
        <div className="px-1 text-[13px] text-fg2">
          {list.length} result{list.length === 1 ? '' : 's'} for "{q}" {scope === 'all' ? `across ${new Set(list.map((d) => d.projectId)).size} sites` : `at ${p.name}`}, every date
        </div>
      )}
      {list.length === 0 && <Empty icon={<Search size={20} />} title="Nothing matches" body="Try a trade, an area like Level 4, or a name." />}
      <div className="space-y-6">
        {Object.entries(groups).map(([day, items]) => (
          <div key={day}>
            <div className="sticky top-0 z-10 mb-3 flex justify-center">
              <span className="glass rounded-full px-3 py-1 text-[12px] font-semibold text-fg2">{day}</span>
            </div>
            <div className="space-y-4">
              {items.map((d) => (
                <DiaryItem key={d.id} d={d} q={term} showSite={scope === 'all'} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Crews({ p }: { p: Project }) {
  const { data, actions } = useStore()
  const days = weekDays()
  const mine = data.bookings.filter((b) => b.projectId === p.id)
  const res = [...new Set(mine.map((b) => b.resourceId))].map((id) => data.resources.find((r) => r.id === id)!)
  const plant = res.filter((r) => r.kind === 'plant')
  const crews = res.filter((r) => r.kind === 'crew')
  const offHired = data.resources.filter((r) => r.kind === 'plant' && !r.onHire)
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionTitle action={<Button size="sm" onClick={() => actions.go('board')}>Open the board</Button>}>This week</SectionTitle>
        <div className="scroll overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[180px_repeat(5,1fr)] gap-1.5 pb-2 text-[12px] font-semibold text-fg3">
              <span />
              {days.map((d) => (
                <span key={d.i} className={cx('text-center', d.isToday && 'text-accent')}>
                  {d.short} {d.date}
                </span>
              ))}
            </div>
            {[...crews, ...plant].map((r) => (
              <div key={r.id} className="grid grid-cols-[180px_repeat(5,1fr)] items-center gap-1.5 py-1">
                <span className="truncate text-[14px] font-semibold">{r.short}</span>
                {days.map((d) => {
                  const here = mine.some((b) => b.resourceId === r.id && b.day === d.i)
                  return <span key={d.i} className={cx('h-7 rounded-[8px]', here ? (r.kind === 'plant' ? 'bg-accent/40' : 'bg-ok/40') : 'bg-fill')} />
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle>Plant on hire</SectionTitle>
        {plant.length === 0 && <div className="text-[14px] text-fg2">No plant on hire here this week.</div>}
        <div className="space-y-2">
          {plant.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-[16px] bg-fill p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-fill2 text-fg2">
                <Package size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold">{r.name}</span>
                <span className="block text-[12px] text-fg2">
                  {r.supplier}. {money(r.rate!, r.currency)} a week
                </span>
              </span>
              {(r.idleDays ?? 0) >= 5 ? (
                <>
                  <Badge tone="warn">Idle {r.idleDays} days</Badge>
                  <Button size="sm" variant="primary" onClick={() => actions.offHire(r.id)}>
                    Off-hire
                  </Button>
                </>
              ) : (
                <Badge tone="ok">In use</Badge>
              )}
            </div>
          ))}
          {offHired.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-[16px] p-3.5 opacity-70">
              <CheckCircle2 size={18} className="text-ok" />
              <span className="text-[14px]">{r.short} off-hired. Collection booked with {r.supplier}.</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SiteCost({ p }: { p: Project }) {
  const { data, derived, threshold } = useStore()
  const [pricing, setPricing] = useState<Variation | null>(null)
  const pos = derived.pos[p.id]
  const vars = data.variations.filter((v) => v.projectId === p.id).sort((a, b) => ['unpriced', 'withQS', 'pending', 'approved'].indexOf(a.status) - ['unpriced', 'withQS', 'pending', 'approved'].indexOf(b.status))
  const max = Math.max(pos.forecast, p.budget, pos.revenue)
  return (
    <div className="space-y-4">
      <Card className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Contract" value={money(p.contract, p.currency)} />
        <Stat label="Budget" value={money(p.budget, p.currency)} />
        <Stat label="Committed" value={money(p.committed, p.currency)} />
        <Stat label="Cost to date" value={money(p.costToDate, p.currency)} />
        <Stat label="Forecast final" value={money(pos.forecast, p.currency)} />
        <Stat label="Margin" value={`${pos.margin.toFixed(1)}%`} tone={pos.margin < threshold ? 'warn' : 'ok'} sub={money(pos.marginValue, p.currency)} />
      </Card>
      <Card className="p-5">
        <div className="text-[13px] font-medium text-fg2">Where the money is</div>
        <div className="mt-4 space-y-3">
          {[
            { l: 'Cost to date', v: p.costToDate, c: 'var(--accent)' },
            { l: 'Committed', v: p.committed, c: 'color-mix(in srgb, var(--accent) 55%, transparent)' },
            { l: 'Forecast final cost', v: pos.forecast, c: pos.margin < threshold ? 'var(--warn)' : 'var(--fg2)' },
            { l: 'Revenue incl. variations', v: pos.revenue, c: 'var(--ok)' },
          ].map((r) => (
            <div key={r.l} className="grid grid-cols-[150px_1fr_80px] items-center gap-3 text-[13px]">
              <span className="text-fg2">{r.l}</span>
              <div className="h-3 rounded-full bg-fill">
                <motion.div className="h-full rounded-full" style={{ background: r.c }} initial={{ width: 0 }} animate={{ width: `${(r.v / max) * 100}%` }} transition={{ type: 'spring', stiffness: 100, damping: 22 }} />
              </div>
              <span className="tnum text-right font-semibold">{money(r.v, p.currency)}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-2">
        <div className="px-4 pb-1 pt-3">
          <SectionTitle className="mb-0">Variations</SectionTitle>
        </div>
        {vars.map((v) => (
          <VariationRow key={v.id} v={v} p={p} onPrice={setPricing} />
        ))}
      </Card>
      <PriceSheet v={pricing} onClose={() => setPricing(null)} />
    </div>
  )
}

function SiteSafety({ p }: { p: Project }) {
  const { data, actions } = useStore()
  const permits = data.permits.filter((x) => x.projectId === p.id)
  const subs = data.subbies.filter((s) => s.projects.includes(p.id))
  const talks = data.toolbox.filter((t) => t.projectId === p.id)
  const nms = data.nearMisses.filter((n) => n.projectId === p.id)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <SectionTitle action={<Badge tone="accent">{permits.filter((x) => x.status !== 'closed').length} live</Badge>}>Permits</SectionTitle>
        <div className="space-y-2">
          {permits.map((x) => (
            <div key={x.id} className="flex items-center gap-3 rounded-[14px] bg-fill p-3">
              <Dot rag={x.status === 'live' ? 'green' : x.status === 'expiring' ? 'amber' : 'green'} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">
                  {x.ref} {x.type}
                </span>
                <span className="block truncate text-[12px] text-fg2">
                  {x.area}. {x.issuedTo}. {x.expires}
                </span>
              </span>
              {x.status === 'closed' ? (
                <Badge>Closed</Badge>
              ) : x.status === 'expiring' ? (
                <Button size="sm" variant="ok" onClick={() => actions.extendPermit(x.id)}>
                  Extend
                </Button>
              ) : (
                <Button size="sm" onClick={() => actions.closePermit(x.id)}>
                  Close
                </Button>
              )}
            </div>
          ))}
          {permits.length === 0 && <div className="text-[14px] text-fg2">No permits needed today.</div>}
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle>Subcontractors</SectionTitle>
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-[14px] bg-fill p-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{s.name}</span>
                <span className="block truncate text-[12px] text-fg2">{s.trade}</span>
              </span>
              <Badge tone={s.rams === 'ok' ? 'ok' : 'warn'}>RAMS</Badge>
              <Badge tone={s.insurance === 'ok' ? 'ok' : s.insurance === 'expiring' ? 'warn' : 'bad'}>{s.blocked ? 'Blocked' : 'Insurance'}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle>Toolbox talks</SectionTitle>
        {talks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-2">
            <HardHat size={18} className="text-fg2" />
            <span className="min-w-0 flex-1 text-[14px]">{t.topic}</span>
            <span className="tnum text-[13px] text-fg2">{t.attendees} signed</span>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <SectionTitle>Near misses</SectionTitle>
        {nms.length === 0 && <div className="text-[14px] text-fg2">None logged in the last 30 days.</div>}
        {nms.map((n) => (
          <div key={n.id} className="py-2">
            <div className="text-[14px] font-medium">{n.text}</div>
            <div className="mt-0.5 text-[12px] text-fg2">{n.action}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function Snags({ p }: { p: Project }) {
  const { data, actions, x, ui } = useStore()
  const me = profileById(ui.profile)!
  const [filter, setFilter] = useState<'open' | 'closed'>('open')
  const [raise, setRaise] = useState(false)
  const [form, setForm] = useState({ location: '', text: '', trade: 'Decoration' })
  const all = data.snags.filter((s) => s.projectId === p.id)
  const open = all.filter((s) => s.status === 'open')
  const list = all.filter((s) => s.status === filter)
  const byTrade = Object.entries(open.reduce<Record<string, number>>((a, s) => ((a[s.trade] = (a[s.trade] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1])
  const maxT = Math.max(1, ...byTrade.map((t) => t[1]))
  return (
    <div className="space-y-4">
      {p.id === 'newcastle' && (
        <Card className="p-5">
          {x.snagBlitz ? (
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
                <CheckCircle2 size={22} />
              </span>
              <div>
                <div className="text-[16px] font-semibold">Snag blitz booked for Saturday</div>
                <div className="mt-0.5 text-[14px] text-fg2">Northern Partitions 4, Tyne Decorators 4, Irwell 2. Every open snag assigned with a photo. Forecast: all closed 4 days before handover.</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-warn/15 text-warn">
                <AlertTriangle size={20} />
              </span>
              <div className="min-w-[240px] flex-1">
                <div className="text-[16px] font-semibold">{open.length} open, handover in 2 weeks</div>
                <div className="mt-0.5 text-[14px] text-fg2">Closing about 3 a day. At that rate 14 are still open on handover day.</div>
              </div>
              <Button variant="primary" onClick={actions.snagBlitz}>
                Book Saturday snag blitz
              </Button>
            </div>
          )}
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card className="p-5">
          <div className="flex gap-8">
            <Stat label="Open" value={open.length} tone={open.length > 10 ? 'warn' : undefined} />
            <Stat label="Closed" value={all.length - open.length} tone="ok" />
          </div>
          <div className="mt-5 space-y-2.5">
            {byTrade.map(([t, n]) => (
              <div key={t} className="grid grid-cols-[96px_1fr_24px] items-center gap-2 text-[13px]">
                <span className="truncate text-fg2">{t}</span>
                <div className="h-2 rounded-full bg-fill">
                  <motion.div layout className="h-full rounded-full bg-warn" style={{ width: `${(n / maxT) * 100}%` }} />
                </div>
                <span className="tnum text-right font-semibold">{n}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
            <Segmented
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'open', label: `Open ${open.length}` },
                { value: 'closed', label: `Closed ${all.length - open.length}` },
              ]}
            />
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setRaise(true)}>
              Raise snag
            </Button>
          </div>
          <div className="scroll max-h-[440px]">
            <AnimatePresence initial={false}>
              {list.map((s) => (
                <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 hover:bg-fill">
                  <button
                    onClick={() => s.status === 'open' && actions.closeSnag(s.id)}
                    aria-label="Close snag"
                    className={cx('shrink-0 transition', s.status === 'open' ? 'text-fg3 hover:text-ok' : 'text-ok')}
                  >
                    {s.status === 'open' ? <Circle size={21} /> : <CheckCircle2 size={21} />}
                  </button>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{s.text}</span>
                    <span className="block truncate text-[12px] text-fg2">
                      {s.ref}. {s.location}. {s.assignee}
                    </span>
                  </span>
                  <Badge>{s.trade}</Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {list.length === 0 && <Empty icon={<CheckCircle2 size={20} />} title={filter === 'open' ? 'No open snags' : 'None closed yet'} />}
          </div>
        </Card>
      </div>
      <Sheet open={raise} onClose={() => setRaise(false)} title="Raise a snag" subtitle={p.name}>
        <div className="space-y-4">
          <PhotoTile photo={{ caption: 'Photo attached', tone: 3 }} className="aspect-[16/7] w-full" />
          <Field label="Location">
            <input className={inputCls} value={form.location} placeholder="L2 meeting room 2.03" onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="What's wrong">
            <input className={inputCls} value={form.text} placeholder="Door closer slamming" onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </Field>
          <Field label="Trade">
            <select className={inputCls} value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })}>
              {['Decoration', 'Joinery', 'Ceilings', 'Electrical', 'Flooring', 'Drylining', 'Ironmongery'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                actions.raiseSnag(p.id, form.location || 'L2 meeting room 2.03', form.text || 'Door closer slamming', form.trade, me.name)
                actions.toast({ title: 'Snag raised', body: `${form.text || 'Door closer slamming'}, assigned when the trade is picked.`, tone: 'ok' })
                setForm({ location: '', text: '', trade: 'Decoration' })
                setRaise(false)
                setFilter('open')
              }}
            >
              Raise snag
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function DocPreview({ d }: { d: Doc }) {
  const isDrawing = d.kind === 'Drawing'
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-[16px] bg-[#f6f5f1] text-[#1d1f22]">
      {isDrawing ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 283">
          <defs>
            <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#d9d6cf" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="283" fill="url(#g)" />
          <rect x="30" y="30" width="250" height="200" fill="none" stroke="#1d1f22" strokeWidth="2" />
          <path d="M30 110H150V30M150 110V230M210 30V160H280M150 160H210" fill="none" stroke="#1d1f22" strokeWidth="1.2" />
          <path d="M60 60h60M60 80h40M170 60h80M170 80h60" stroke="#3a8dff" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="300" y="200" width="88" height="72" fill="#fff" stroke="#1d1f22" />
          <text x="306" y="214" fontSize="8" fontWeight="700" fontFamily="-apple-system, Helvetica Neue, sans-serif">ROCCUL</text>
          <text x="306" y="228" fontSize="6" fontFamily="-apple-system, Helvetica Neue, sans-serif">{d.name.slice(0, 22)}</text>
          <text x="306" y="240" fontSize="6" fontFamily="-apple-system, Helvetica Neue, sans-serif">{d.rev}. Scale 1:100</text>
          <text x="306" y="252" fontSize="6" fontFamily="-apple-system, Helvetica Neue, sans-serif">{d.by}</text>
        </svg>
      ) : (
        <div className="absolute inset-0 p-6">
          <div className="text-[11px] font-extrabold tracking-[0.16em]">ROCCUL</div>
          <div className="mt-3 text-[16px] font-semibold">{d.name}</div>
          <div className="mt-1 text-[11px] text-[#6b6e73]">
            {d.kind}. {d.rev}. {d.by}
          </div>
          <div className="mt-5 space-y-2">
            {[92, 80, 86, 60, 88, 74, 40].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-[#e2e0da]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Documents({ p }: { p: Project }) {
  const { data, actions } = useStore()
  const [open, setOpen] = useState<Doc | null>(null)
  const docs = data.docs.filter((d) => d.projectId === p.id)
  return (
    <Card className="p-2">
      {docs.map((d) => (
        <button key={d.id} onClick={() => setOpen(d)} className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left transition hover:bg-fill">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-fill2 text-fg2">
            <FileText size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{d.name}</span>
            <span className="block truncate text-[12px] text-fg2">
              {d.by}. {d.daysAgo === 0 ? 'Updated today' : `${d.daysAgo} days ago`}
            </span>
          </span>
          <Badge>{d.kind}</Badge>
          <span className="tnum hidden w-14 text-right text-[12px] font-semibold text-fg3 sm:block">{d.rev}</span>
        </button>
      ))}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} subtitle={open ? `${open.kind}. ${open.rev}. ${open.by}` : ''} width={640}>
        {open && (
          <>
            <DocPreview d={open} />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                icon={<Share2 size={15} />}
                onClick={() => {
                  actions.toast({ title: 'Shared with client', body: `${open.name} sent to ${p.pm}.`, tone: 'ok' })
                  setOpen(null)
                }}
              >
                Share with client
              </Button>
              <Button variant="primary" onClick={() => setOpen(null)}>
                Done
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </Card>
  )
}

export function Site() {
  const { ui, data, actions } = useStore()
  const p = data.projects.find((y) => y.id === ui.siteId)!
  const lastDiary = data.diary.filter((d) => d.projectId === p.id).sort((a, b) => b.at - a.at)[0]
  const openSnags = data.snags.filter((s) => s.projectId === p.id && s.status === 'open').length
  const body = (() => {
    switch (ui.siteTab) {
      case 'today':
        return <Today p={p} />
      case 'diary':
        return <Diary p={p} />
      case 'crews':
        return <Crews p={p} />
      case 'cost':
        return <SiteCost p={p} />
      case 'safety':
        return <SiteSafety p={p} />
      case 'snags':
        return <Snags p={p} />
      case 'documents':
        return <Documents p={p} />
    }
  })()
  return (
    <div className="space-y-5 pt-1">
      <Hero p={p} />
      <div className="sticky top-0 z-20 -mx-1 flex items-center gap-3 px-1 py-1">
        <div className="glass noscroll flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => actions.setTab(t.id)}
              className={cx('relative h-9 shrink-0 rounded-full px-3.5 text-[14px] font-semibold transition-colors', ui.siteTab === t.id ? 'text-fg' : 'text-fg2 hover:text-fg')}
            >
              {ui.siteTab === t.id && <motion.span layoutId="site-tab" className="absolute inset-0 rounded-full bg-fill2" transition={spring} />}
              <span className="relative flex items-center gap-1.5">
                {t.label}
                {t.id === 'snags' && openSnags > 0 && <span className="tnum rounded-full bg-fill2 px-1.5 text-[11px] text-fg2">{openSnags}</span>}
                {t.id === 'diary' && lastDiary && Date.now() - lastDiary.at < 3600000 && <Camera size={13} className="text-accent" />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Loader k={`${p.id}-${ui.siteTab}-${ui.diaryQuery}`} skeleton={<TabSkeleton />}>
        {body}
      </Loader>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-4">
        <div className="shimmer h-56 rounded-[24px]" />
        <div className="shimmer h-40 rounded-[24px]" />
      </div>
      <div className="space-y-4">
        <div className="shimmer h-64 rounded-[24px]" />
        <div className="shimmer h-32 rounded-[24px]" />
      </div>
    </div>
  )
}
