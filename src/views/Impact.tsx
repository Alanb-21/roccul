import { motion } from 'framer-motion'
import { Building2, Calculator, HardHat, Shield, Smartphone, Users } from 'lucide-react'
import { money } from '../lib/format'
import { useStore } from '../store'
import { AnimatedNumber, Card, SectionTitle } from '../ui'

const ROLES = [
  { role: 'Site managers', n: 6, each: 4.5, what: 'Daily diary, photos, sign-in sheets and the Friday write-up' },
  { role: 'Contracts managers', n: 2, each: 5, what: 'Chasing sites for updates, plant and crew phone calls' },
  { role: 'QS and commercial', n: 1, each: 6, what: 'Rebuilding the cost report, chasing variation detail' },
  { role: 'Health and safety', n: 1, each: 4, what: 'Permit, RAMS and insurance checks by email' },
  { role: 'Director', n: 1, each: 5, what: 'Pulling the picture together from calls and WhatsApp' },
]

export function Impact() {
  const { x } = useStore()
  const total = ROLES.reduce((s, r) => s + r.n * r.each, 0)
  const max = Math.max(...ROLES.map((r) => r.n * r.each))
  const caughtNow = x.caught.plant + x.caught.variations + x.caught.clashes
  const year = [
    { l: 'Idle plant off-hired sooner', v: 21000, live: x.caught.plant, why: 'About 1 machine a month sitting idle for 2 to 3 weeks' },
    { l: 'Variations priced, not lost', v: 85000, live: x.caught.variations, why: 'Roughly 1% of turnover in work done with no price' },
    { l: 'Clashes and standing time', v: 14000, live: x.caught.clashes, why: 'Crews waiting on a lift or another trade' },
  ]
  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight">Impact</h1>
        <p className="mt-1 text-[15px] text-fg2">Estimates for a contractor of Roccul's size running 6 live sites. To be checked against Roccul's own numbers.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="text-[15px] font-semibold text-fg2">"Where are we on every job?"</div>
        <div className="mt-6 space-y-5">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold">Before</span>
              <span className="tnum text-[28px] font-semibold tracking-tight">1 to 2 days</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-fill">
              <motion.div className="h-full rounded-full bg-fg3" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            <div className="mt-1.5 text-[13px] text-fg2">Calls, WhatsApp, a spreadsheet. And the answer is already a week old.</div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold">Now</span>
              <span className="tnum text-[28px] font-semibold tracking-tight text-ok">10 seconds</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-fill">
              <motion.div className="h-full rounded-full bg-ok" initial={{ width: 0 }} animate={{ width: '1.5%' }} transition={{ delay: 0.5, duration: 0.6 }} style={{ minWidth: 12 }} />
            </div>
            <div className="mt-1.5 text-[13px] text-fg2">Open Roccul Live. It's on the first screen, and it's live.</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <SectionTitle action={<span className="tnum text-[15px] font-semibold text-ok">{total} hrs a week</span>}>Hours back each week</SectionTitle>
          <div className="space-y-4">
            {ROLES.map((r, i) => (
              <div key={r.role}>
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="font-semibold">
                    {r.role} {r.n > 1 && <span className="font-normal text-fg3">x {r.n}</span>}
                  </span>
                  <span className="tnum font-semibold">{r.n * r.each} hrs</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-fill">
                  <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${((r.n * r.each) / max) * 100}%` }} transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 90, damping: 20 }} />
                </div>
                <div className="mt-1 text-[12px] text-fg2">{r.what}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[16px] bg-fill p-4 text-[14px] text-fg2">
            <b className="tnum text-fg">{(total * 46).toLocaleString('en-IE')} hours a year</b> over 46 working weeks. That's more than one full-time person's year, back in the business.
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Cost caught early</SectionTitle>
          <div className="space-y-4">
            {year.map((y) => (
              <div key={y.l} className="rounded-[18px] bg-fill p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold">{y.l}</span>
                  <span className="tnum text-[18px] font-semibold">{money(y.v)}</span>
                </div>
                <div className="mt-1 text-[12px] text-fg2">{y.why}. A year, estimated.</div>
                {y.live > 0 && <div className="tnum mt-2 text-[12px] font-semibold text-ok">{money(y.live)} caught on this call</div>}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="text-[14px] text-fg2">A typical year</span>
            <span className="tnum text-[26px] font-semibold tracking-tight">{money(year.reduce((s, y) => s + y.v, 0))}</span>
          </div>
          {caughtNow > 0 && (
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-[14px] text-fg2">Caught in the last few minutes</span>
              <span className="tnum text-[18px] font-semibold text-ok">
                <AnimatedNumber value={caughtNow} format={(v) => money(v)} />
              </span>
            </div>
          )}
        </Card>
      </div>

      <section>
        <SectionTitle>Everyone else gets it too</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { i: Smartphone, t: 'Site managers', d: 'Post once from the phone. No Friday write-up, no chasing photos.' },
            { i: Users, t: 'Contracts managers', d: 'Move crews and plant on one board. Clashes show before they cost.' },
            { i: Calculator, t: 'QS and commercial', d: 'Variations land the day they happen, with photos. Price them before they go cold.' },
            { i: Shield, t: 'Health and safety', d: 'Expired insurance blocks sign-in on its own. Permits visible on every site.' },
            { i: Building2, t: 'Managing Director', d: 'The Friday report arrives without anyone writing it.' },
            { i: HardHat, t: 'The client', d: 'A clean progress report with real photos, every week, no cost showing.' },
          ].map((c) => (
            <Card key={c.t} className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-accent/15 text-accent">
                <c.i size={19} />
              </span>
              <div className="mt-3 text-[15px] font-semibold">{c.t}</div>
              <div className="mt-1 text-[13px] leading-snug text-fg2">{c.d}</div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
