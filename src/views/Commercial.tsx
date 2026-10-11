import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import type { Variation } from '../data/types'
import { toEur } from '../lib/calc'
import { cx, greeting, money } from '../lib/format'
import { useStore } from '../store'
import { AnimatedNumber, Badge, Button, Card, SectionTitle, Stat } from '../ui'
import { LiveStamp } from './Home'
import { PriceSheet, VariationRow } from './shared'

export function Commercial() {
  const { data, derived, actions } = useStore()
  const [pricing, setPricing] = useState<Variation | null>(null)
  const P = (id: string) => data.projects.find((p) => p.id === id)!
  const queue = data.variations.filter((v) => v.status === 'unpriced' || v.status === 'withQS').sort((a, b) => b.daysAgo - a.daysAgo)
  const withClient = data.variations.filter((v) => v.status === 'pending')
  const unpricedEur = queue.reduce((s, v) => s + toEur(v.cost, P(v.projectId)), 0)
  const pendingEur = withClient.reduce((s, v) => s + toEur(v.value, P(v.projectId)), 0)
  const certified = data.valuations.reduce((s, v) => s + toEur(v.certified, P(v.projectId)), 0)
  const ctc = data.projects.reduce((s, p) => s + toEur(derived.pos[p.id].costToComplete, p), 0)
  const maxCtc = Math.max(...data.projects.map((p) => toEur(derived.pos[p.id].costToComplete, p)))
  return (
    <div className="space-y-7 pt-2">
      <div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-[32px] font-semibold tracking-tight sm:text-[38px]">{greeting()} Niamh</h1>
          <LiveStamp />
        </div>
        <p className="mt-1.5 text-[15px] text-fg2">Variations land here the day they're logged on site, with photos. Price them before they go cold.</p>
      </div>

      <Card className="grid grid-cols-2 gap-6 p-5 sm:p-6 lg:grid-cols-4">
        <Stat label="To price" value={queue.length} tone={queue.length ? 'warn' : 'ok'} sub={`${money(unpricedEur)} of cost with no price`} />
        <Stat label="With clients" value={<AnimatedNumber value={pendingEur} format={(v) => money(v)} />} sub={`${withClient.length} priced, awaiting sign off`} />
        <Stat label="Certified to date" value={money(certified)} sub="All sites, GBP converted" />
        <Stat label="Cost to complete" value={<AnimatedNumber value={ctc} format={(v) => money(v)} />} sub="Forecast less cost to date" />
      </Card>

      <section>
        <SectionTitle action={queue.length ? <Badge tone="warn">{queue.length} waiting</Badge> : <Badge tone="ok">Queue clear</Badge>}>Variations to price</SectionTitle>
        <Card className="p-2">
          {queue.length === 0 && (
            <div className="flex items-center gap-3 p-4 text-[14px] text-fg2">
              <Check size={18} className="text-ok" /> Every variation on every site has a price.
            </div>
          )}
          {queue.map((v) => (
            <div key={v.id}>
              <div className="px-4 pt-3 text-[12px] font-semibold text-fg3">
                {P(v.projectId).name}. Logged by {v.raisedBy}, {v.daysAgo === 0 ? 'today' : `${v.daysAgo} days ago`}
              </div>
              <VariationRow v={v} p={P(v.projectId)} onPrice={setPricing} />
            </div>
          ))}
        </Card>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section>
          <SectionTitle>Valuations</SectionTitle>
          <Card className="overflow-hidden p-0">
            <div className="scroll overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[1.3fr_0.5fr_1fr_1fr_0.7fr_1.1fr] gap-3 border-b border-hairline px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-fg3">
                  <span>Site</span>
                  <span>No.</span>
                  <span className="text-right">Applied</span>
                  <span className="text-right">Certified</span>
                  <span>Due</span>
                  <span />
                </div>
                {data.valuations.map((v) => {
                  const p = P(v.projectId)
                  return (
                    <div key={v.projectId} className="grid grid-cols-[1.3fr_0.5fr_1fr_1fr_0.7fr_1.1fr] items-center gap-3 border-b border-hairline px-5 py-3 last:border-0">
                      <span className="truncate text-[14px] font-semibold">{p.name}</span>
                      <span className="tnum text-[14px] text-fg2">{v.number}</span>
                      <span className="tnum text-right text-[14px]">{money(v.applied, p.currency)}</span>
                      <span className="tnum text-right text-[14px]">{money(v.certified, p.currency)}</span>
                      <span className="text-[13px] text-fg2">{v.due}</span>
                      <span className="flex justify-end">
                        {v.status === 'draft' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              actions.submitValuation(v.projectId)
                              actions.toast({ title: `Valuation ${v.number + 1} submitted`, body: `${p.name} application sent to ${p.pm}.`, tone: 'ok' })
                            }}
                          >
                            Submit
                          </Button>
                        ) : (
                          <Badge tone={v.status === 'certified' ? 'ok' : 'accent'}>{v.status === 'certified' ? 'Certified' : 'Submitted'}</Badge>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </section>
        <section>
          <SectionTitle>Cost to complete</SectionTitle>
          <Card className="space-y-3.5 p-5">
            {data.projects.map((p) => {
              const v = derived.pos[p.id].costToComplete
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-semibold">{p.name}</span>
                    <span className="tnum text-fg2">{money(v, p.currency)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-fill">
                    <motion.div className={cx('h-full rounded-full', derived.pos[p.id].margin < 8 ? 'bg-warn' : 'bg-accent')} animate={{ width: `${(toEur(v, p) / maxCtc) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </Card>
        </section>
      </div>
      <PriceSheet v={pricing} onClose={() => setPricing(null)} />
    </div>
  )
}
