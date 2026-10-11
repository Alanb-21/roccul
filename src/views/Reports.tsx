import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, FileText, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GBP_TO_EUR } from '../data/seed'
import type { Project } from '../data/types'
import { headcount, toEur } from '../lib/calc'
import { cx, money } from '../lib/format'
import { useStore } from '../store'
import { Badge, Button, Card, Field, PhotoTile, Segmented, Sheet, inputCls } from '../ui'

const STEPS = ['Programme on 6 sites', 'Cost, committed and forecast', 'Variations and valuations', 'Safety, permits and RAMS', 'Photos from the week', 'Building report']

function friday() {
  const d = new Date()
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7))
  return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

function Paper({ client, site }: { client: boolean; site: Project }) {
  const { data, derived } = useStore()
  const sites = client ? [site] : data.projects
  const photos = data.diary.filter((d) => d.photo && sites.some((s) => s.id === d.projectId)).sort((a, b) => b.at - a.at).slice(0, 4)
  const rev = data.projects.reduce((s, p) => s + toEur(derived.pos[p.id].revenue, p), 0)
  const mv = data.projects.reduce((s, p) => s + toEur(derived.pos[p.id].marginValue, p), 0)
  const issues = client
    ? data.rfis.filter((r) => r.projectId === site.id && r.status !== 'answered').map((r) => `${r.ref} ${r.title}, with ${r.to} ${r.daysAgo} days`)
    : [
        `IFSC: ${data.projects.find((p) => p.id === 'ifsc')!.statusLine.toLowerCase()}`,
        `Spinningfields: forecast margin ${derived.pos.manchester.margin.toFixed(1)}%, ${derived.pos.manchester.unpricedCount} unpriced variations`,
        `Quayside: ${data.snags.filter((s) => s.projectId === 'newcastle' && s.status === 'open').length} snags open, handover in 2 weeks`,
        'Kelvin Scaffolding: insurance expired, blocked from site',
      ]
  const ink = '#1b1d21'
  const mute = '#6b6f76'
  return (
    <div className="mx-auto w-full max-w-[760px] rounded-[18px] bg-[#fbfbf9] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-9" style={{ color: ink }}>
      <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <div className="text-[13px] font-extrabold tracking-[0.2em]">ROCCUL</div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-[0.2em]" style={{ color: mute }}>
            CREATE | CONSTRUCT | COMPLETE
          </div>
        </div>
        <div className="text-right text-[11px]" style={{ color: mute }}>
          Week ending {friday()}
          <br />
          {client ? `Prepared for ${site.client}` : 'Internal. Director of Construction'}
        </div>
      </div>
      <h2 className="mt-6 text-[26px] font-semibold tracking-tight">{client ? `${site.name} progress report` : 'Portfolio report'}</h2>
      <p className="mt-1 text-[13px]" style={{ color: mute }}>
        {client ? `${site.scope}. ${site.size}. Week ${site.weekNow} of ${site.weekTotal}.` : `${data.projects.length} live sites. ${data.projects.reduce((s, p) => s + headcount(p), 0)} people on site today. GBP converted at £1 = €${GBP_TO_EUR}.`}
      </p>
      <div className={cx('mt-5 grid gap-3', client ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
        {(client
          ? [
              ['Complete', `${site.pct}%`],
              ['Programme', site.daysBehind ? `${site.daysBehind} days behind` : 'On programme'],
              ['Completion', site.handover.replace('Practical completion ', '')],
            ]
          : [
              ['Portfolio value', money(rev)],
              ['Forecast margin', `${((mv / rev) * 100).toFixed(1)}%`],
              ['On programme', `${data.projects.filter((p) => !p.daysBehind).length} of ${data.projects.length}`],
              ['Days without lost time', '412'],
            ]
        ).map(([l, v]) => (
          <div key={l} className="rounded-[12px] bg-black/[0.04] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: mute }}>
              {l}
            </div>
            <div className="tnum mt-1 text-[17px] font-semibold">{v}</div>
          </div>
        ))}
      </div>
      {client ? (
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mute }}>
            Milestones
          </div>
          <div className="mt-2 divide-y divide-black/5 text-[13px]">
            {site.milestones.map((m) => (
              <div key={m.name} className="flex justify-between py-2">
                <span>{m.name}</span>
                <span style={{ color: m.done ? '#1f8f3a' : mute }}>{m.done ? 'Complete' : `Week ${m.week}`}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <table className="mt-6 w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: mute }} className="text-[10px] uppercase tracking-wider">
              <th className="pb-2 font-semibold">Site</th>
              <th className="pb-2 font-semibold">Status</th>
              <th className="pb-2 text-right font-semibold">Done</th>
              <th className="pb-2 text-right font-semibold">Forecast</th>
              <th className="pb-2 text-right font-semibold">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.projects.map((p) => (
              <tr key={p.id}>
                <td className="py-2 pr-2 font-semibold">
                  {p.name}
                  <span className="block text-[10px] font-normal" style={{ color: mute }}>
                    {p.area}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.rag === 'green' ? '#30a14e' : p.rag === 'amber' ? '#e08a00' : '#d93a30' }} />
                  {p.statusLine}
                </td>
                <td className="tnum py-2 text-right">{p.pct}%</td>
                <td className="tnum py-2 text-right">{money(derived.pos[p.id].forecast, p.currency)}</td>
                <td className="tnum py-2 text-right font-semibold">{derived.pos[p.id].margin.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mute }}>
          {client ? 'Waiting on design team' : 'Needs attention'}
        </div>
        <ul className="mt-2 space-y-1.5 text-[13px]">
          {(issues.length ? issues : ['Nothing outstanding']).map((i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-black/50" />
              {i}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-[11px] font-semibold uppercase tracking-wider" style={{ color: mute }}>
        Photos this week
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {photos.map((d) => (
          <div key={d.id}>
            <PhotoTile photo={d.photo!} showCaption={false} className="aspect-[4/3] rounded-[10px]" />
            <div className="mt-1 truncate text-[10px]" style={{ color: mute }}>
              {d.photo!.caption}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 border-t border-black/10 pt-3 text-[10px]" style={{ color: mute }}>
        Roccul Limited, 2nd Floor, 2 Georges Dock, IFSC, Dublin 1. Roccul UK Limited, Coalisland, Tyrone. ISO 45001.
      </div>
    </div>
  )
}

export function Reports() {
  const { data, actions, x, ui } = useStore()
  const [phase, setPhase] = useState<'idle' | 'building' | 'done'>('idle')
  const [step, setStep] = useState(0)
  const [client, setClient] = useState<'internal' | 'client'>('internal')
  const [site, setSite] = useState('gcd')
  const [send, setSend] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (phase !== 'building') return
    const t0 = performance.now()
    const i = setInterval(() => {
      const e = performance.now() - t0
      setStep(Math.min(STEPS.length, Math.floor(e / 340)))
      if (e > 2100) {
        clearInterval(i)
        setElapsed(e / 1000)
        setPhase('done')
      }
    }, 60)
    return () => clearInterval(i)
  }, [phase])

  const p = data.projects.find((y) => y.id === site)!
  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-[15px] text-fg2">Built from what happened on site this week. Nobody types it up.</p>
        </div>
        {phase === 'done' && (
          <Button variant="ghost" onClick={() => actions.go('impact')}>
            See the impact
          </Button>
        )}
      </div>

      {phase === 'idle' && (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-accent/15 text-accent">
            <FileText size={28} />
          </span>
          <h2 className="mt-5 text-[24px] font-semibold tracking-tight">Friday report</h2>
          <p className="mt-2 max-w-[440px] text-[15px] text-fg2">Programme, cost, safety and photos for every site, in one branded report. Ready to send to the MD or a client.</p>
          <Button
            size="lg"
            variant="primary"
            className="mt-7"
            onClick={() => {
              setStep(0)
              setPhase('building')
            }}
          >
            Build Friday report
          </Button>
        </Card>
      )}

      {phase === 'building' && (
        <Card className="mx-auto max-w-[520px] px-7 py-8">
          <div className="text-[17px] font-semibold">Building report</div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-fill2">
            <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(step / STEPS.length) * 100}%` }} transition={{ ease: 'easeOut', duration: 0.3 }} />
          </div>
          <div className="mt-5 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className={cx('flex items-center gap-3 text-[14px] transition', i < step ? 'text-fg' : i === step ? 'text-fg2' : 'text-fg3')}>
                <span className={cx('grid h-5 w-5 place-items-center rounded-full transition', i < step ? 'bg-ok text-white' : 'bg-fill2')}>{i < step && <Check size={12} strokeWidth={3} />}</span>
                {s}
              </div>
            ))}
          </div>
        </Card>
      )}

      <AnimatePresence>
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 26 }} className="space-y-5">
            <Card className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-ok/15 text-ok">
                <Clock size={20} />
              </span>
              <div className="min-w-[200px] flex-1">
                <div className="text-[16px] font-semibold">Built in {elapsed.toFixed(1)} seconds</div>
                <div className="text-[14px] text-fg2">Used to take Friday afternoon.</div>
              </div>
              <Segmented
                value={client}
                onChange={setClient}
                options={[
                  { value: 'internal', label: 'Internal' },
                  { value: 'client', label: 'Client version' },
                ]}
              />
              {client === 'client' && (
                <select value={site} onChange={(e) => setSite(e.target.value)} className="h-10 rounded-full bg-fill px-4 text-[14px] font-semibold outline-none hair" aria-label="Client site">
                  {data.projects.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}, {y.client}
                    </option>
                  ))}
                </select>
              )}
              <Button variant="primary" icon={x.reportSent ? <Check size={15} /> : <Send size={15} />} onClick={() => setSend(true)}>
                {client === 'client' ? `Send to ${p.client.split(' ')[0]}` : x.reportSent ? 'Sent to MD' : 'Send to MD'}
              </Button>
            </Card>
            {client === 'client' && (
              <div className="flex justify-center">
                <Badge tone="accent">Client version. Cost and margin hidden</Badge>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div key={client + site} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Paper client={client === 'client'} site={p} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={send} onClose={() => setSend(false)} title={client === 'client' ? `Send to ${p.client}` : 'Send to MD'} subtitle={client === 'client' ? 'Client version, no cost or margin' : 'Internal portfolio report'}>
        <div className="space-y-4">
          <Field label="To">
            <input className={inputCls} defaultValue={client === 'client' ? `${p.pm}, ${p.client}` : 'Managing Director'} />
          </Field>
          <Field label="Note">
            <textarea
              rows={3}
              className={inputCls}
              defaultValue={client === 'client' ? `Weekly progress for ${p.name} attached. Happy to walk it on Tuesday.` : `Week's position attached. IFSC recovery approved, Manchester variations being priced, Newcastle snag blitz Saturday. ${ui.profile === 'john' ? 'John' : ''}`.trim()}
            />
          </Field>
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={<Send size={15} />}
              onClick={() => {
                if (client === 'internal') actions.reportSent()
                actions.toast({ title: 'Report sent', body: client === 'client' ? `${p.name} progress report sent to ${p.pm}.` : 'Portfolio report with the MD.', tone: 'ok' })
                setSend(false)
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
