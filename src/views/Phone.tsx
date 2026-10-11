import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, ChevronLeft, ClipboardList, Coins, HardHat, UserCheck, Wifi, Wrench, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { headcount } from '../lib/calc'
import { cx, hhmm, timeAgo } from '../lib/format'
import { profileById, useNow, useStore } from '../store'
import { PhotoTile } from '../ui'

type Screen = null | 'update' | 'variation' | 'snag' | 'signin' | 'toolbox'

interface Preset {
  update: { text: string; area: string; trade: string; caption: string }
  variation: { text: string; cost: number }
  snag: { location: string; text: string; trade: string }
  toolbox: string
}

const PRESETS: Record<string, Preset> = {
  gcd: {
    update: { text: 'L4 east wing ceiling grid complete to gridline 14. Apex boarding bulkheads tomorrow from 7. Kilbride clear to close up east side.', area: 'Level 4 east', trade: 'Ceilings', caption: 'Level 4 east wing, grid to gridline 14' },
    variation: { text: 'Client asked for 2 extra floor boxes in L4 breakout on the walk round', cost: 2400 },
    snag: { location: 'L3 meeting room 3.06', text: 'Door frame scuffed, make good and paint', trade: 'Decoration' },
    toolbox: 'Manual handling of ceiling boards',
  },
  manchester: {
    update: { text: 'L7 ceiling grid complete north core. Pennine on south side tomorrow. Fire stopping to riser walls 60% done on daywork.', area: 'Level 7', trade: 'Ceilings', caption: 'Level 7 ceiling grid, south side' },
    variation: { text: 'Building control want intumescent collars to 4 extra soil pipes, L8', cost: 1900 },
    snag: { location: 'L6 east', text: 'Bulkhead line wavy over desk bank 4', trade: 'Drylining' },
    toolbox: 'Fire stopping and penetrations',
  },
}

const TRADES = ['Ceilings', 'Drylining', 'M&E', 'Flooring', 'Joinery', 'Fire stopping']

function Big({ icon: Icon, label, sub, onClick, primary }: { icon: LucideIcon; label: string; sub: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'rounded-[20px] text-left transition active:scale-[0.97]',
        primary ? 'col-span-2 flex items-center gap-3 bg-accent p-4 text-white shadow-[0_10px_30px_-10px_rgba(var(--accent-rgb),0.8)]' : 'flex flex-col gap-3 bg-fill2 p-3.5 hover:brightness-125',
      )}
    >
      <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[14px]', primary ? 'bg-white/20' : 'bg-fill')}>
        <Icon size={21} />
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-semibold leading-tight">{label}</span>
        <span className={cx('mt-0.5 block text-[12px] leading-snug', primary ? 'text-white/75' : 'text-fg2')}>{sub}</span>
      </span>
    </button>
  )
}

function Pane({ title, onBack, children, action }: { title: string; onBack: () => void; children: ReactNode; action: ReactNode }) {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }} className="absolute inset-0 z-20 flex flex-col bg-[var(--bg)]">
      <div className="flex items-center justify-between px-3 pb-2 pt-12">
        <button onClick={onBack} className="flex items-center gap-0.5 text-[16px] font-medium text-accent">
          <ChevronLeft size={22} /> Back
        </button>
        <span className="text-[16px] font-semibold">{title}</span>
        <span className="w-14" />
      </div>
      <div className="scroll noscroll flex-1 space-y-3 px-4 pb-4">{children}</div>
      <div className="px-4 pb-8 pt-2">{action}</div>
    </motion.div>
  )
}

const phoneInput = 'w-full rounded-[14px] bg-fill2 px-3.5 py-3 text-[15px] outline-none focus:ring-2 focus:ring-accent/50'

function Chips({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cx('h-8 rounded-full px-3 text-[13px] font-semibold transition', value === o ? 'bg-fg text-[var(--bg)]' : 'bg-fill2 text-fg2')}>
          {o}
        </button>
      ))}
    </div>
  )
}

function PostButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-14 w-full rounded-[18px] bg-accent text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(var(--accent-rgb),0.8)] transition active:scale-[0.98]">
      {label}
    </button>
  )
}

function SiteApp() {
  const { ui, data, actions } = useStore()
  const now = useNow(10000)
  const me = profileById(ui.profile)!
  const pid = me.homeSite ?? 'gcd'
  const pre = PRESETS[pid] ?? PRESETS.gcd
  const p = data.projects.find((y) => y.id === pid)!
  const [screen, setScreen] = useState<Screen>(null)
  const [done, setDone] = useState<string | null>(null)
  const [u, setU] = useState({ text: pre.update.text, area: pre.update.area, trade: pre.update.trade, tone: 0 })
  const [vr, setVr] = useState({ text: pre.variation.text, cost: String(pre.variation.cost) })
  const [sn, setSn] = useState({ ...pre.snag })
  const [crew, setCrew] = useState<Record<string, number>>({})
  const [tb, setTb] = useState({ topic: pre.toolbox, n: 24 })
  const role = me.role.split(',')[0]
  const recent = data.feed.filter((f) => f.projectId === pid).slice(0, 6)

  const finish = (msg: string) => {
    setScreen(null)
    setDone(msg)
    setTimeout(() => setDone(null), 2200)
  }

  return (
    <div className="relative h-full overflow-hidden bg-[var(--bg)]">
      <div className="scroll noscroll h-full px-4 pb-8 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-fg3">Roccul Live</div>
            <div className="text-[26px] font-semibold leading-tight tracking-tight">{p.name}</div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-[14px] font-semibold">{me.initials}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-fill2 px-3 py-1.5 text-[12px] font-semibold">
            <span className="tnum">{headcount(p)}</span> on site
          </span>
          <span className="rounded-full bg-fill2 px-3 py-1.5 text-[12px] font-semibold">
            {p.weather.temp}° {p.weather.cond}
          </span>
          <span className="rounded-full bg-fill2 px-3 py-1.5 text-[12px] font-semibold">Wk {p.weekNow}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Big primary icon={Camera} label="Post update" sub="Photo and a line. Goes to the diary" onClick={() => setScreen('update')} />
          <Big icon={Coins} label="Log variation" sub="Before it's forgotten" onClick={() => setScreen('variation')} />
          <Big icon={Wrench} label="Raise snag" sub="Photo and trade" onClick={() => setScreen('snag')} />
          <Big icon={UserCheck} label="Sign in crew" sub="Who's here" onClick={() => setScreen('signin')} />
          <Big icon={HardHat} label="Toolbox talk" sub="Topic and names" onClick={() => setScreen('toolbox')} />
        </div>
        <div className="mt-6 text-[13px] font-semibold text-fg2">On this site today</div>
        <div className="mt-2 space-y-2">
          {recent.map((f) => (
            <div key={f.id} className="rounded-[16px] bg-fill p-3">
              <div className="flex justify-between text-[12px] text-fg3">
                <span className="font-semibold text-fg2">{f.actor}</span>
                <span className="tnum">{timeAgo(f.at, now)}</span>
              </div>
              <div className="mt-0.5 text-[14px] leading-snug">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {screen === 'update' && (
          <Pane
            title="Post update"
            onBack={() => setScreen(null)}
            action={
              <PostButton
                label="Post"
                onClick={() => {
                  actions.postDiary({ projectId: pid, author: me.name, role, text: u.text, area: u.area, trade: u.trade, photo: { caption: u.tone === 0 ? pre.update.caption : u.tone === 5 ? `${u.area}, partitions` : `${u.area}, ${u.trade.toLowerCase()}`, tone: u.tone } })
                  finish('Posted to the diary')
                }}
              />
            }
          >
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 5].map((t) => (
                <button key={t} onClick={() => setU({ ...u, tone: t })} className={cx('relative overflow-hidden rounded-[14px] ring-2 transition', u.tone === t ? 'ring-accent' : 'ring-transparent')}>
                  <PhotoTile photo={{ caption: '', tone: t }} showCaption={false} className="aspect-square rounded-[12px]" />
                  {u.tone === t && (
                    <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <textarea rows={4} value={u.text} onChange={(e) => setU({ ...u, text: e.target.value })} className={phoneInput} />
            <div className="text-[12px] font-semibold text-fg3">Area</div>
            <input value={u.area} onChange={(e) => setU({ ...u, area: e.target.value })} className={phoneInput} />
            <div className="text-[12px] font-semibold text-fg3">Trade</div>
            <Chips value={u.trade} options={TRADES} onChange={(trade) => setU({ ...u, trade })} />
          </Pane>
        )}
        {screen === 'variation' && (
          <Pane
            title="Log variation"
            onBack={() => setScreen(null)}
            action={
              <PostButton
                label="Log variation"
                onClick={() => {
                  actions.addVariation(pid, vr.text, Number(vr.cost) || 0, me.name, 'Logged from site with photo. Needs pricing.')
                  actions.toast({ title: `${me.name} logged a variation`, body: `${vr.text}. In Niamh's queue to price.`, tone: 'info', site: pid })
                  finish('Sent to QS to price')
                }}
              />
            }
          >
            <PhotoTile photo={{ caption: 'Photo attached', tone: 4 }} className="aspect-[16/9]" />
            <div className="text-[12px] font-semibold text-fg3">What's changed</div>
            <textarea rows={3} value={vr.text} onChange={(e) => setVr({ ...vr, text: e.target.value })} className={phoneInput} />
            <div className="text-[12px] font-semibold text-fg3">Rough cost ({p.currency === 'GBP' ? '£' : '€'})</div>
            <input inputMode="numeric" value={vr.cost} onChange={(e) => setVr({ ...vr, cost: e.target.value })} className={`${phoneInput} tnum`} />
            <div className="rounded-[14px] bg-fill p-3 text-[13px] text-fg2">Who asked: client, on the walk round. Logged {hhmm(Date.now())}.</div>
          </Pane>
        )}
        {screen === 'snag' && (
          <Pane
            title="Raise snag"
            onBack={() => setScreen(null)}
            action={
              <PostButton
                label="Raise snag"
                onClick={() => {
                  actions.raiseSnag(pid, sn.location, sn.text, sn.trade, me.name)
                  finish('Snag raised')
                }}
              />
            }
          >
            <PhotoTile photo={{ caption: 'Photo attached', tone: 3 }} className="aspect-[16/9]" />
            <input value={sn.location} onChange={(e) => setSn({ ...sn, location: e.target.value })} className={phoneInput} />
            <input value={sn.text} onChange={(e) => setSn({ ...sn, text: e.target.value })} className={phoneInput} />
            <Chips value={sn.trade} options={['Decoration', 'Drylining', 'Ceilings', 'Joinery', 'Electrical']} onChange={(trade) => setSn({ ...sn, trade })} />
          </Pane>
        )}
        {screen === 'signin' && (
          <Pane
            title="Sign in crew"
            onBack={() => setScreen(null)}
            action={
              <PostButton
                label="Sign in"
                onClick={() => {
                  const entries = Object.entries(crew).filter(([, n]) => n > 0)
                  entries.forEach(([c, n]) => actions.signIn(pid, c, n, me.name))
                  finish(entries.length ? `${entries.reduce((s, [, n]) => s + n, 0)} signed in` : 'Nobody new')
                  setCrew({})
                }}
              />
            }
          >
            {p.onSite.map((o) => (
              <div key={o.company} className="flex items-center gap-3 rounded-[16px] bg-fill p-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{o.company}</span>
                  <span className="block text-[12px] text-fg2">{o.count + (crew[o.company] ?? 0)} on site</span>
                </span>
                <button onClick={() => setCrew({ ...crew, [o.company]: Math.max(0, (crew[o.company] ?? 0) - 1) })} className="grid h-9 w-9 place-items-center rounded-full bg-fill2 text-[18px] font-semibold">
                  -
                </button>
                <span className="tnum w-5 text-center text-[16px] font-semibold">{crew[o.company] ?? 0}</span>
                <button onClick={() => setCrew({ ...crew, [o.company]: (crew[o.company] ?? 0) + 1 })} className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[18px] font-semibold text-white">
                  +
                </button>
              </div>
            ))}
          </Pane>
        )}
        {screen === 'toolbox' && (
          <Pane
            title="Toolbox talk"
            onBack={() => setScreen(null)}
            action={
              <PostButton
                label="Record talk"
                onClick={() => {
                  actions.logToolbox(pid, tb.topic, tb.n, me.name)
                  finish('Toolbox talk recorded')
                }}
              />
            }
          >
            <div className="text-[12px] font-semibold text-fg3">Topic</div>
            <Chips value={tb.topic} options={[pre.toolbox, 'Working at height', 'Housekeeping', 'Silica dust', 'Permits']} onChange={(topic) => setTb({ ...tb, topic })} />
            <div className="text-[12px] font-semibold text-fg3">Signed</div>
            <div className="flex items-center gap-4 rounded-[16px] bg-fill p-4">
              <button onClick={() => setTb({ ...tb, n: Math.max(1, tb.n - 1) })} className="grid h-10 w-10 place-items-center rounded-full bg-fill2 text-[20px]">
                -
              </button>
              <span className="tnum flex-1 text-center text-[34px] font-semibold">{tb.n}</span>
              <button onClick={() => setTb({ ...tb, n: tb.n + 1 })} className="grid h-10 w-10 place-items-center rounded-full bg-accent text-[20px] text-white">
                +
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-[14px] bg-fill p-3 text-[13px] text-fg2">
              <ClipboardList size={16} /> Sign sheet photo attached
            </div>
          </Pane>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-30 grid place-items-center bg-black/30 backdrop-blur-sm">
            <div className="glass-strong flex flex-col items-center rounded-[26px] px-8 py-7">
              <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="grid h-14 w-14 place-items-center rounded-full bg-ok text-white">
                <Check size={28} strokeWidth={3} />
              </motion.span>
              <div className="mt-3 text-[16px] font-semibold">{done}</div>
              <div className="mt-0.5 text-[13px] text-fg2">Live in the office now</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Phone() {
  const { ui } = useStore()
  const me = profileById(ui.profile)!
  const time = new Date().toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })
  return (
    <div className="flex flex-col items-center gap-8 pt-2 lg:flex-row lg:items-center lg:justify-center lg:gap-12">
      <div className="max-w-[300px] text-center lg:order-2 lg:text-left">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-fg3">{me.name}'s phone</div>
        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight">As simple as WhatsApp. Except the office can find it again.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg2">Five buttons. Everything posted here lands in the Live feed, the site diary and the Friday report as it happens.</p>
        <p className="mt-4 text-[13px] text-fg3">Tap Post update, then watch the Live panel.</p>
      </div>
      <div className="relative shrink-0 lg:order-1" style={{ width: 340, height: 700 }}>
        <div className="absolute inset-0 rounded-[58px] bg-[#1a1b1e] p-[11px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7),inset_0_0_0_1.5px_rgba(255,255,255,0.12)]">
          <div className="relative h-full overflow-hidden rounded-[47px]">
            <SiteApp />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-11 items-center justify-between px-7 text-[14px] font-semibold text-fg">
              <span className="tnum">{time}</span>
              <span className="flex items-center gap-1.5">
                <Wifi size={15} />
                <span className="h-[11px] w-[22px] rounded-[3px] border border-current p-[1px]">
                  <span className="block h-full w-[70%] rounded-[1px] bg-current" />
                </span>
              </span>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-[9px] z-40 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-fg/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
