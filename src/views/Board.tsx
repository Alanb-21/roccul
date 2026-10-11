import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Forklift, GripVertical, Users } from 'lucide-react'
import { useState } from 'react'
import type { Booking } from '../data/types'
import { findClashes } from '../lib/calc'
import { cx, money, weekDays } from '../lib/format'
import { sitesFor } from '../shell/nav'
import { profileById, useStore } from '../store'
import { Badge, Button, Card, Field, Segmented, Sheet, inputCls, spring } from '../ui'

export function Board() {
  const { data, ui, actions, derived } = useStore()
  const days = weekDays()
  const [filter, setFilter] = useState<'all' | 'crew' | 'plant'>('all')
  const [over, setOver] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [moving, setMoving] = useState<Booking | null>(null)
  const [dest, setDest] = useState({ projectId: '', day: 0 })
  const [offHired, setOffHired] = useState<string[]>([])
  const ids = sitesFor(ui.profile!, data.projects.map((p) => p.id))
  const sites = ui.profile === 'ciara' ? data.projects : data.projects.filter((p) => ids.includes(p.id))
  const clashKeys = new Set(derived.clashes.flatMap((c) => c.bookings.map((b) => b.id)))
  const res = (id: string) => data.resources.find((r) => r.id === id)!

  const move = (id: string, projectId: string, day: number) => {
    const b = data.bookings.find((y) => y.id === id)
    if (!b || (b.projectId === projectId && b.day === day)) return
    const before = derived.clashes.length
    const next = data.bookings.map((y) => (y.id === id ? { ...y, projectId, day } : y))
    const after = findClashes(next, data.resources).length
    actions.moveBooking(id, projectId, day)
    const r = res(b.resourceId)
    const p = data.projects.find((y) => y.id === projectId)!
    if (after < before) {
      actions.clashFixed(1150)
      actions.toast({ title: 'Clash cleared', body: `${r.short} now at ${p.name} on ${days[day].long}. Both sites notified.`, tone: 'ok' })
      actions.feed({ projectId, kind: 'plant', actor: profileById(ui.profile)!.name, text: `${r.short} moved to ${days[day].long}. Double booking cleared.` })
    } else if (after > before) {
      actions.toast({ title: 'That creates a clash', body: `${r.short} is already booked on ${days[day].long}.`, tone: 'warn' })
    } else {
      actions.toast({ title: `${r.short} moved`, body: `${p.name}, ${days[day].long}. Site manager notified.`, tone: 'ok' })
    }
  }

  const idle = data.resources.filter((r) => r.kind === 'plant' && (r.idleDays ?? 0) >= 5)
  const clash = derived.clashes[0]

  return (
    <div className="space-y-5 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight">Crews & Plant</h1>
          <p className="mt-1 text-[15px] text-fg2">
            Week of {days[0].short} {days[0].date} {days[0].month}. Drag a crew or a lift to move it. Every site sees it straight away.
          </p>
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'crew', label: 'Crews' },
            { value: 'plant', label: 'Plant' },
          ]}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {clash ? (
            <motion.div key="clash" layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <Card className="flex h-full items-start gap-4 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-bad/15 text-bad">
                  <AlertTriangle size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold">
                    {res(clash.resourceId).name.split(',')[0]} double-booked {days[clash.day].long}
                  </div>
                  <div className="mt-0.5 text-[13px] text-fg2">
                    {clash.bookings.map((b) => data.projects.find((p) => p.id === b.projectId)!.name).join(' and ')}. Drag one to a free day.
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => {
                      const b = clash.bookings[clash.bookings.length - 1]
                      move(b.id, b.projectId, Math.min(4, clash.day + 1))
                    }}
                  >
                    Move {data.projects.find((p) => p.id === clash.bookings[clash.bookings.length - 1].projectId)!.name} to {days[Math.min(4, clash.day + 1)].long}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="noclash" layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="flex h-full items-center gap-4 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-ok/15 text-ok">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <div className="text-[15px] font-semibold">No clashes this week</div>
                  <div className="text-[13px] text-fg2">Every crew and every machine is in one place a day.</div>
                </div>
              </Card>
            </motion.div>
          )}
          {idle.map((r) => {
            const done = !r.onHire
            const p = data.projects.find((y) => y.id === 'newcastle')!
            const left = p.weekTotal - p.weekNow
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="flex h-full items-start gap-4 p-4">
                  <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[14px]', done ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn')}>
                    {done ? <CheckCircle2 size={20} /> : <Forklift size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {done ? (
                      <>
                        <div className="text-[15px] font-semibold">Off-hired. {money(r.rate! * left, r.currency, { exact: true })} saved to handover</div>
                        <div className="mt-0.5 text-[13px] text-fg2">Collection booked with {r.supplier}. Newcastle forecast updated.</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[15px] font-semibold">
                          Genie lift at Newcastle idle {r.idleDays} days, costing {money(r.rate!, r.currency)} a week. Off-hire?
                        </div>
                        <div className="mt-0.5 text-[13px] text-fg2">
                          No use logged since last week. {money((r.rate! / 7) * r.idleDays!, r.currency)} spent on it standing still.
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              actions.offHire(r.id)
                              setOffHired([...offHired, r.id])
                              actions.toast({ title: 'Off-hire booked', body: `${r.short} collection with ${r.supplier}. Saving ${money(r.rate! * left, r.currency)} to handover.`, tone: 'ok', site: 'newcastle' })
                            }}
                          >
                            Off-hire now
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => actions.toast({ title: 'Kept on hire', body: 'Gary Robson asked to confirm what it is needed for.', tone: 'info' })}>
                            Keep
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="scroll overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-b border-hairline">
              <div className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-fg3">Site</div>
              {days.map((d) => (
                <div key={d.i} className={cx('border-l border-hairline px-3 py-3 text-center', d.isToday && 'bg-accent/8')}>
                  <div className={cx('text-[12px] font-semibold uppercase tracking-wider', d.isToday ? 'text-accent' : 'text-fg3')}>{d.short}</div>
                  <div className="tnum text-[17px] font-semibold">{d.date}</div>
                </div>
              ))}
            </div>
            {sites.map((p) => (
              <div key={p.id} className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-b border-hairline last:border-0">
                <button onClick={() => actions.openSite(p.id, 'crews')} className="flex flex-col justify-center px-4 py-3 text-left transition hover:bg-fill">
                  <span className="text-[14px] font-semibold leading-tight">{p.name}</span>
                  <span className="text-[12px] text-fg2">{p.area}</span>
                </button>
                {days.map((d) => {
                  const key = `${p.id}|${d.i}`
                  const cell = data.bookings.filter((b) => b.projectId === p.id && b.day === d.i && (filter === 'all' || res(b.resourceId).kind === filter))
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        if (over !== key) setOver(key)
                      }}
                      onDragLeave={() => setOver((o) => (o === key ? null : o))}
                      onDrop={(e) => {
                        e.preventDefault()
                        const id = e.dataTransfer.getData('text/plain')
                        setOver(null)
                        setDragging(null)
                        move(id, p.id, d.i)
                      }}
                      className={cx(
                        'min-h-[64px] space-y-1.5 border-l border-hairline p-1.5 transition-colors',
                        d.isToday && 'bg-accent/[0.04]',
                        over === key && 'bg-accent/15 ring-2 ring-inset ring-accent/60',
                      )}
                    >
                      <AnimatePresence initial={false}>
                        {cell.map((b) => {
                          const r = res(b.resourceId)
                          const clashing = clashKeys.has(b.id)
                          return (
                            <motion.div
                              layout
                              layoutId={b.id}
                              key={b.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: dragging === b.id ? 0.4 : 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={spring}
                            >
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', b.id)
                                  e.dataTransfer.effectAllowed = 'move'
                                  setDragging(b.id)
                                }}
                                onDragEnd={() => {
                                  setDragging(null)
                                  setOver(null)
                                }}
                                onClick={() => {
                                  setMoving(b)
                                  setDest({ projectId: b.projectId, day: Math.min(4, b.day + 1) })
                                }}
                                title={`${r.name}. Drag to move, or click`}
                                className={cx(
                                  'group flex h-8 cursor-grab select-none items-center gap-1.5 rounded-[10px] px-2 text-[12px] font-semibold transition hover:brightness-110 active:cursor-grabbing',
                                  clashing ? 'bg-bad/20 text-bad ring-1 ring-bad/60' : r.kind === 'plant' ? 'bg-accent/15 text-accent' : 'bg-fill2 text-fg',
                                )}
                              >
                                {clashing ? <AlertTriangle size={13} className="shrink-0" /> : r.kind === 'plant' ? <Forklift size={13} className="shrink-0" /> : <Users size={13} className="shrink-0 text-fg2" />}
                                <span className="truncate">{r.short}</span>
                                {r.size && <span className="tnum ml-auto shrink-0 text-fg3">{r.size}</span>}
                                <GripVertical size={12} className="ml-auto hidden shrink-0 opacity-40 group-hover:block" />
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="flex flex-wrap items-center gap-4 px-1 text-[12px] text-fg2">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-fill2" /> Crew
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-accent/40" /> Plant
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-bad/40" /> Clash
        </span>
        <span className="ml-auto">Tap a chip to move it without dragging</span>
      </div>

      <Sheet open={!!moving} onClose={() => setMoving(null)} title={moving ? `Move ${res(moving.resourceId).short}` : ''} subtitle={moving ? `${data.projects.find((p) => p.id === moving.projectId)!.name}, ${days[moving.day].long}` : ''}>
        {moving && (
          <div className="space-y-4">
            <Field label="To site">
              <select className={inputCls} value={dest.projectId} onChange={(e) => setDest({ ...dest, projectId: e.target.value })}>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}, {p.area}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Day">
              <div className="grid grid-cols-5 gap-2">
                {days.map((d) => {
                  const taken = data.bookings.some((b) => b.resourceId === moving.resourceId && b.day === d.i && b.id !== moving.id && b.projectId !== dest.projectId)
                  return (
                    <button
                      key={d.i}
                      onClick={() => setDest({ ...dest, day: d.i })}
                      className={cx('rounded-[14px] py-2.5 text-center transition', dest.day === d.i ? 'bg-accent text-white' : 'bg-fill hover:bg-fill2')}
                    >
                      <div className="text-[12px] font-semibold">{d.short}</div>
                      <div className="tnum text-[16px] font-semibold">{d.date}</div>
                      {taken && <div className={cx('mx-auto mt-1 h-1.5 w-1.5 rounded-full', dest.day === d.i ? 'bg-white' : 'bg-bad')} />}
                    </button>
                  )
                })}
              </div>
            </Field>
            <div className="flex items-center justify-between gap-2">
              <Badge tone="neutral">Red dot means already booked elsewhere</Badge>
              <Button
                variant="primary"
                onClick={() => {
                  move(moving.id, dest.projectId, dest.day)
                  setMoving(null)
                }}
              >
                Move
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
