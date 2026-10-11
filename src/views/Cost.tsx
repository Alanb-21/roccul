import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { GBP_TO_EUR } from '../data/seed'
import type { Variation } from '../data/types'
import { toEur } from '../lib/calc'
import { cx, money } from '../lib/format'
import { sitesFor } from '../shell/nav'
import { useStore } from '../store'
import { AnimatedNumber, Badge, Card, Dot, SectionTitle, Sparkline, Stat } from '../ui'
import { PriceSheet, VariationRow } from './shared'

const extraCauses: Record<string, string[]> = {
  manchester: ['Northern Partitions extra labour on L6 bulkhead rework, £14,200 over package', 'Prelims running one week long, £6,800'],
  ifsc: ['Kilbride M&E standing time waiting on ceilings, €3,900', 'Programme recovery cost if approved'],
  newcastle: ['Idle Genie lift still on hire'],
}

export function Cost() {
  const { data, derived, ui, threshold, actions } = useStore()
  const ids = sitesFor(ui.profile!, data.projects.map((p) => p.id))
  const sites = data.projects.filter((p) => ids.includes(p.id))
  const [open, setOpen] = useState<string | null>(ui.focus)
  const [pricing, setPricing] = useState<Variation | null>(null)
  const focusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ui.focus) setTimeout(() => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 650)
  }, [ui.focus])

  const sum = (f: (id: string) => number) => sites.reduce((s, p) => s + toEur(f(p.id), p), 0)
  const P = (id: string) => data.projects.find((p) => p.id === id)!
  const revenue = sum((id) => derived.pos[id].revenue)
  const committed = sum((id) => P(id).committed)
  const toDate = sum((id) => P(id).costToDate)
  const forecast = sum((id) => derived.pos[id].forecast)
  const margin = ((revenue - forecast) / revenue) * 100
  const warnings = sites.filter((p) => derived.pos[p.id].margin < threshold)

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight">Cost</h1>
        <p className="mt-1 text-[15px] text-fg2">Live from orders, timesheets and variations logged on site. Not last month's cost report.</p>
      </div>

      <Card className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
        <Stat label="Contract value" value={<AnimatedNumber value={revenue} format={(v) => money(v)} />} />
        <Stat label="Committed" value={money(committed)} />
        <Stat label="Cost to date" value={money(toDate)} />
        <Stat label="Forecast final cost" value={<AnimatedNumber value={forecast} format={(v) => money(v)} />} />
        <Stat label="Forecast margin" value={<AnimatedNumber value={margin} format={(v) => `${v.toFixed(1)}%`} />} tone={margin < threshold ? 'warn' : 'ok'} sub={`GBP at today's rate (€${GBP_TO_EUR})`} />
      </Card>

      <section>
        <SectionTitle
          action={
            <label className="flex items-center gap-3 text-[13px] text-fg2">
              Warn me below <b className="tnum w-10 text-fg">{threshold.toFixed(1)}%</b>
              <input type="range" min={5} max={12} step={0.5} value={threshold} onChange={(e) => actions.setThreshold(Number(e.target.value))} className="w-28" aria-label="Margin threshold" />
            </label>
          }
        >
          Early warning
        </SectionTitle>
        <AnimatePresence mode="popLayout">
          {warnings.length === 0 ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ok/15 text-ok">
                  <CheckCircle2 size={22} />
                </span>
                <div>
                  <div className="text-[15px] font-semibold">Every job above {threshold.toFixed(1)}%</div>
                  <div className="text-[13px] text-fg2">Nothing forecasting under your line right now.</div>
                </div>
              </Card>
            </motion.div>
          ) : (
            warnings.map((p) => {
              const pos = derived.pos[p.id]
              const un = data.variations.filter((v) => v.projectId === p.id && (v.status === 'unpriced' || v.status === 'withQS'))
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="mb-3">
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-warn/15 text-warn">
                        <AlertTriangle size={20} />
                      </span>
                      <div className="min-w-[220px] flex-1">
                        <div className="text-[16px] font-semibold">
                          {p.name} forecasting {pos.margin.toFixed(1)}%, under your {threshold.toFixed(1)}% line
                        </div>
                        <ul className="mt-2 space-y-1.5 text-[14px] text-fg2">
                          {un.map((v) => (
                            <li key={v.id} className="flex gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
                              <span>
                                {v.ref} {v.title}: {money(v.cost, p.currency, { exact: true })} spent, no price{v.status === 'withQS' ? ', with Niamh now' : ''}
                              </span>
                            </li>
                          ))}
                          {(extraCauses[p.id] ?? []).map((c) => (
                            <li key={c} className="flex gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-fg3" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Sparkline data={[...p.marginHistory, pos.margin]} w={140} h={48} color="var(--warn)" threshold={threshold} />
                    </div>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </section>

      <section>
        <SectionTitle action={<span className="text-[12px] text-fg3">Tap a site for its variations</span>}>By site</SectionTitle>
        <Card className="overflow-hidden p-0">
          <div className="scroll overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.9fr_repeat(5,0.9fr)_1.3fr_20px] gap-3 border-b border-hairline px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-fg3">
                <span>Site</span>
                <span className="text-right">Contract</span>
                <span className="text-right">Budget</span>
                <span className="text-right">Committed</span>
                <span className="text-right">To date</span>
                <span className="text-right">Forecast</span>
                <span className="text-right">Margin</span>
                <span />
              </div>
              {sites.map((p) => {
                const pos = derived.pos[p.id]
                const isOpen = open === p.id
                const vars = data.variations.filter((v) => v.projectId === p.id).sort((a, b) => ['unpriced', 'withQS', 'pending', 'approved'].indexOf(a.status) - ['unpriced', 'withQS', 'pending', 'approved'].indexOf(b.status))
                const below = pos.margin < threshold
                return (
                  <div key={p.id} ref={ui.focus === p.id ? focusRef : undefined} className="border-b border-hairline last:border-0">
                    <button onClick={() => setOpen(isOpen ? null : p.id)} className={cx('grid w-full grid-cols-[1.9fr_repeat(5,0.9fr)_1.3fr_20px] items-center gap-3 px-5 py-3.5 text-left transition hover:bg-fill', isOpen && 'bg-fill')}>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Dot rag={below ? 'amber' : 'green'} />
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                          <span className="block truncate text-[12px] text-fg2">
                            {p.area}
                            {pos.unpricedCount > 0 && <span className="text-bad">. {pos.unpricedCount} unpriced</span>}
                          </span>
                        </span>
                      </span>
                      <span className="tnum text-right text-[14px]">{money(p.contract, p.currency)}</span>
                      <span className="tnum text-right text-[14px]">{money(p.budget, p.currency)}</span>
                      <span className="tnum text-right text-[14px]">{money(p.committed, p.currency)}</span>
                      <span className="tnum text-right text-[14px]">{money(p.costToDate, p.currency)}</span>
                      <span className="tnum text-right text-[14px] font-semibold">
                        <AnimatedNumber value={pos.forecast} format={(v) => money(v, p.currency)} />
                      </span>
                      <span className="flex items-center justify-end gap-3">
                        <Sparkline data={[...p.marginHistory, pos.margin]} w={56} h={22} color={below ? 'var(--warn)' : 'var(--ok)'} />
                        <span className={cx('tnum w-12 text-right text-[15px] font-semibold', below ? 'text-warn' : 'text-ok')}>
                          <AnimatedNumber value={pos.margin} format={(v) => `${v.toFixed(1)}%`} />
                        </span>
                      </span>
                      <ChevronDown size={18} className={cx('text-fg3 transition', isOpen && 'rotate-180')} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 34 }} className="overflow-hidden">
                          <div className="px-3 pb-3">
                            <div className="flex flex-wrap gap-2 px-4 pb-1 pt-1">
                              <Badge tone="ok">Approved {money(pos.approved, p.currency)}</Badge>
                              <Badge tone="accent">With client {money(pos.pending, p.currency)}</Badge>
                              {pos.unpricedCount > 0 && <Badge tone="bad">Unpriced cost {money(pos.unpricedCost, p.currency)}</Badge>}
                              <Badge>Cost to complete {money(pos.costToComplete, p.currency)}</Badge>
                            </div>
                            {vars.map((v) => (
                              <VariationRow key={v.id} v={v} p={p} onPrice={setPricing} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </section>
      <PriceSheet v={pricing} onClose={() => setPricing(null)} />
    </div>
  )
}
