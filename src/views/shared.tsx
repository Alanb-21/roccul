import { motion } from 'framer-motion'
import { ArrowRight, Check, Send } from 'lucide-react'
import { useState } from 'react'
import type { Project, Variation } from '../data/types'
import { costPosition } from '../lib/calc'
import { money } from '../lib/format'
import { useStore } from '../store'
import { AnimatedNumber, Badge, Button, Field, Sheet, inputCls } from '../ui'

export function VarBadge({ v }: { v: Variation }) {
  if (v.status === 'approved') return <Badge tone="ok">Approved</Badge>
  if (v.status === 'pending') return <Badge tone="accent">Priced, with client</Badge>
  if (v.status === 'withQS') return <Badge tone="warn">With QS</Badge>
  return <Badge tone="bad">Unpriced</Badge>
}

export function VariationRow({ v, p, onPrice, compact }: { v: Variation; p: Project; onPrice?: (v: Variation) => void; compact?: boolean }) {
  const { actions, ui } = useStore()
  const unpriced = v.status === 'unpriced' || v.status === 'withQS'
  return (
    <motion.div layout className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] px-4 py-3.5 transition hover:bg-fill">
      <div className="min-w-0 flex-1 basis-[260px]">
        <div className="flex items-center gap-2">
          <span className="tnum text-[13px] font-semibold text-fg3">{v.ref}</span>
          <span className="truncate text-[15px] font-semibold">{v.title}</span>
        </div>
        {!compact && (
          <div className="mt-0.5 truncate text-[13px] text-fg2">
            {v.instruction}. {v.note || `Raised by ${v.raisedBy}`}
          </div>
        )}
      </div>
      <div className="tnum w-[92px] text-right">
        <div className="text-[15px] font-semibold">{unpriced ? money(v.cost, p.currency) : money(v.value, p.currency)}</div>
        <div className="text-[11px] text-fg3">{unpriced ? 'cost, no price' : 'value'}</div>
      </div>
      <div className="flex w-[200px] items-center justify-end gap-2">
        {unpriced && onPrice ? (
          <>
            {v.status === 'unpriced' && ui.profile !== 'niamh' && (
              <Button size="sm" variant="ghost" onClick={() => actions.sendToQS(v)}>
                Ask QS
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={() => onPrice(v)}>
              Price now
            </Button>
          </>
        ) : (
          <VarBadge v={v} />
        )}
      </div>
    </motion.div>
  )
}

export function PriceSheet({ v, onClose }: { v: Variation | null; onClose: () => void }) {
  const { data, derived, actions, x } = useStore()
  const [price, setPrice] = useState('')
  const [step, setStep] = useState<'price' | 'done'>('price')
  const p = v ? data.projects.find((y) => y.id === v.projectId)! : null
  const close = () => {
    onClose()
    setTimeout(() => {
      setStep('price')
      setPrice('')
    }, 300)
  }
  if (!v || !p)
    return (
      <Sheet open={false} onClose={close} title="">
        {null}
      </Sheet>
    )
  const value = Number((price || String(v.value)).replace(/[^0-9.]/g, '')) || 0
  const before = derived.pos[p.id]
  const after = costPosition(p, data.variations.map((y) => (y.id === v.id ? { ...y, status: 'pending', value } : y)), x.plantSaving[p.id] ?? 0, x.extraCost[p.id] ?? 0)
  const markup = ((value - v.cost) / v.cost) * 100
  const who = 'Niamh Kelly'
  return (
    <Sheet open={!!v} onClose={close} title={step === 'done' ? 'Priced and issued' : `Price ${v.ref}`} subtitle={`${p.name}. ${v.title}`}>
      {step === 'price' ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-fill p-4">
              <div className="text-[12px] text-fg2">Cost on site so far</div>
              <div className="tnum mt-1 text-[22px] font-semibold">{money(v.cost, p.currency, { exact: true })}</div>
              <div className="mt-1 text-[12px] text-fg3">From daywork sheets and orders</div>
            </div>
            <div className="rounded-[18px] bg-fill p-4">
              <div className="text-[12px] text-fg2">Instruction</div>
              <div className="mt-1 text-[14px] font-semibold leading-snug">{v.instruction}</div>
              <div className="mt-1 text-[12px] text-fg3">Raised by {v.raisedBy}</div>
            </div>
          </div>
          <Field label={`Price to client (${p.currency === 'GBP' ? '£' : '€'}). Build-up from Niamh's rates, edit if needed`}>
            <input value={price} placeholder={v.value.toLocaleString('en-IE')} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" className={`${inputCls} tnum text-[20px] font-semibold`} autoFocus />
          </Field>
          <div className="rounded-[18px] bg-fill p-4">
            <div className="text-[13px] font-medium text-fg2">Forecast margin on {p.name}</div>
            <div className="mt-2 flex items-center gap-4">
              <span className="tnum text-[26px] font-semibold text-warn">{before.margin.toFixed(1)}%</span>
              <ArrowRight className="text-fg3" size={20} />
              <span className="tnum text-[26px] font-semibold text-ok">
                <AnimatedNumber value={after.margin} format={(n) => `${n.toFixed(1)}%`} />
              </span>
              <span className="ml-auto text-right text-[12px] text-fg3">
                {markup.toFixed(0)}% on cost
                <br />+{money(value, p.currency)} recovered
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              Not now
            </Button>
            <Button
              variant="primary"
              icon={<Send size={15} />}
              disabled={value <= 0}
              onClick={() => {
                actions.priceVariation(v, value, who)
                setStep('done')
              }}
            >
              Price and issue to {p.pm.split(' ')[0]}
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-2 text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok/15 text-ok">
            <Check size={30} />
          </motion.div>
          <p className="mx-auto mt-4 max-w-[360px] text-[15px] text-fg2">
            {v.ref} priced at <b className="text-fg">{money(value, p.currency, { exact: true })}</b> and sent to {p.pm} for sign off. The forecast on {p.name} has moved already.
          </p>
          <Button className="mt-6" variant="primary" onClick={close}>
            Done
          </Button>
        </div>
      )}
    </Sheet>
  )
}

export function siteMonogram(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}
