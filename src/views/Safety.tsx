import { motion } from 'framer-motion'
import { Award, Check, CheckCircle2, FileWarning, HardHat, Plus, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { cx } from '../lib/format'
import { useStore } from '../store'
import { Avatar, Badge, Button, Card, Dot, Field, SectionTitle, Sheet, Stat, inputCls } from '../ui'

export function Safety() {
  const { data, actions, x } = useStore()
  const [nm, setNm] = useState(false)
  const [nmForm, setNmForm] = useState({ projectId: 'gcd', text: '' })
  const name = (id: string) => data.projects.find((p) => p.id === id)!.name
  const live = data.permits.filter((p) => p.status !== 'closed')
  const expiring = data.permits.filter((p) => p.status === 'expiring')
  const permits = [...data.permits].sort((a, b) => ['expiring', 'live', 'closed'].indexOf(a.status) - ['expiring', 'live', 'closed'].indexOf(b.status))
  const blocked = data.subbies.filter((s) => s.insurance === 'expired' || s.blocked)
  const flagged = data.subbies.filter((s) => !blocked.includes(s) && (s.rams !== 'ok' || s.insurance !== 'ok'))
  const talks = data.toolbox.filter((t) => t.daysAgo <= 4)
  const month = new Date().toLocaleDateString('en-IE', { month: 'long' })
  const maxVotes = Math.max(...data.nominees.map((n) => n.votes))
  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight">Safety</h1>
        <p className="mt-1 text-[15px] text-fg2">Every permit, RAMS and certificate on every site, live. ISO 45001.</p>
      </div>

      <Card className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
        <Stat label="Days LTI free" value="412" tone="ok" />
        <Stat label="Permits live" value={live.length} sub={`${data.permits.filter((p) => p.projectId === 'sandyford' && p.status !== 'closed').length} at Sandyford`} />
        <Stat label="Expiring today" value={expiring.length} tone={expiring.length ? 'warn' : undefined} />
        <Stat label="Toolbox talks" value={talks.length} sub={`${talks.reduce((s, t) => s + t.attendees, 0)} signed this week`} />
        <Stat label="Inductions" value="23" sub="This week, 4 cleanroom" />
        <Stat label="Near misses" value={data.nearMisses.length} sub={`${data.nearMisses.filter((n) => !n.closed).length} open`} />
      </Card>

      {blocked.map((s) => (
        <Card key={s.id} className="flex flex-wrap items-center gap-4 p-5">
          <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[14px]', s.blocked ? 'bg-bad/15 text-bad' : 'bg-ok/15 text-ok')}>{s.blocked ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}</span>
          <div className="min-w-[220px] flex-1">
            <div className="text-[16px] font-semibold">{s.blocked ? `${s.name} blocked from site` : `${s.name} cleared`}</div>
            <div className="mt-0.5 text-[14px] text-fg2">
              {s.blocked ? `${s.insuranceNote}. Gate sign-in refused at Cherrywood and Spinningfields until a valid certificate is on file.` : 'Renewed certificate on file. Sign-in open again.'}
            </div>
          </div>
          {s.blocked && (
            <div className="flex gap-2">
              {x.certRequested[s.id] ? (
                <Badge tone="accent">
                  <Check size={12} /> Requested
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    actions.requestCert(s.id)
                    actions.toast({ title: 'Certificate requested', body: `Email sent to ${s.name} accounts. Reminder set for 9am.`, tone: 'info' })
                  }}
                >
                  Request certificate
                </Button>
              )}
              <Button
                size="sm"
                variant="ok"
                onClick={() => {
                  actions.unblock(s.id)
                  actions.toast({ title: `${s.name} cleared`, body: 'Certificate checked and filed. Sign-in open.', tone: 'ok' })
                }}
              >
                Certificate received
              </Button>
            </div>
          )}
        </Card>
      ))}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle action={<Badge tone="accent">{live.length} live</Badge>}>Permits</SectionTitle>
          <div className="scroll max-h-[420px] space-y-1.5">
            {permits.map((p) => (
              <div key={p.id} className={cx('flex items-center gap-3 rounded-[14px] p-3 transition', p.status === 'closed' ? 'opacity-55' : 'bg-fill')}>
                <Dot rag={p.status === 'expiring' ? 'amber' : 'green'} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">
                    {p.type}, {p.area}
                  </span>
                  <span className="block truncate text-[12px] text-fg2">
                    {name(p.projectId)}. {p.ref}. {p.issuedTo}. {p.expires}
                  </span>
                </span>
                {p.status === 'closed' ? (
                  <Badge>Closed</Badge>
                ) : p.status === 'expiring' ? (
                  <Button size="sm" variant="ok" onClick={() => (actions.extendPermit(p.id), actions.toast({ title: `${p.ref} extended`, body: `${p.type} at ${name(p.projectId)} to 18:00.`, tone: 'ok' }))}>
                    Extend
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => (actions.closePermit(p.id), actions.feed({ projectId: p.projectId, kind: 'permit', actor: 'Declan Ward', text: `Closed permit ${p.ref}, ${p.type.toLowerCase()}` }))}>
                    Close
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Subcontractor RAMS and insurance</SectionTitle>
          <div className="space-y-1.5">
            {[...flagged, ...data.subbies.filter((s) => !flagged.includes(s) && !blocked.includes(s))].slice(0, 9).map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-[14px] p-3 hover:bg-fill">
                <span className="min-w-0 flex-1 basis-[160px]">
                  <span className="block truncate text-[14px] font-semibold">{s.name}</span>
                  <span className="block truncate text-[12px] text-fg2">
                    {s.trade}. {s.projects.map(name).join(', ')}
                  </span>
                </span>
                {s.rams === 'review' ? (
                  <Button size="sm" variant="primary" onClick={() => (actions.approveRams(s.id), actions.toast({ title: 'RAMS approved', body: `${s.name}, ${s.ramsNote.split(',')[0]}.`, tone: 'ok' }))}>
                    Approve RAMS
                  </Button>
                ) : (
                  <Badge tone={s.rams === 'ok' ? 'ok' : 'warn'}>{s.rams === 'ok' ? 'RAMS ok' : 'RAMS review due'}</Badge>
                )}
                <Badge tone={s.insurance === 'ok' ? 'ok' : s.insurance === 'expiring' ? 'warn' : 'bad'}>{s.insurance === 'ok' ? 'Insured' : s.insuranceNote}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Toolbox talks this week</SectionTitle>
          <div className="space-y-1">
            {talks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-[14px] p-2.5 hover:bg-fill">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-fill2 text-fg2">
                  <HardHat size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{t.topic}</span>
                  <span className="block truncate text-[12px] text-fg2">
                    {name(t.projectId)}. {t.by}. {t.daysAgo === 0 ? 'Today' : t.daysAgo === 1 ? 'Yesterday' : `${t.daysAgo} days ago`}
                  </span>
                </span>
                <span className="tnum text-[14px] font-semibold">{t.attendees}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle
            action={
              <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setNm(true)}>
                Log near miss
              </Button>
            }
          >
            Near misses
          </SectionTitle>
          <div className="space-y-1.5">
            {data.nearMisses.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-[14px] p-2.5 hover:bg-fill">
                <span className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px]', n.closed ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn')}>{n.closed ? <Check size={15} /> : <FileWarning size={15} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium leading-snug">{n.text}</span>
                  <span className="mt-0.5 block text-[12px] text-fg2">
                    {name(n.projectId)}. {n.action}
                  </span>
                </span>
                {!n.closed && (
                  <Button size="sm" onClick={() => (actions.closeNearMiss(n.id), actions.toast({ title: 'Near miss closed out', body: 'Action recorded against the site.', tone: 'ok' }))}>
                    Close out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-accent/15 text-accent">
              <Award size={21} />
            </span>
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight">{month} H&S award</h2>
              <p className="text-[13px] text-fg2">One person a month. Nominate in one tap, from any site.</p>
            </div>
          </div>
          <Badge>Closes on the last Friday</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[...data.nominees].sort((a, b) => b.votes - a.votes).map((n) => {
            const done = x.nominated[n.id]
            return (
              <motion.div layout key={n.id} className="flex items-start gap-3 rounded-[20px] bg-fill p-4">
                <Avatar initials={n.name.split(' ').map((w) => w[0]).join('')} size={44} ring={n.votes === maxVotes} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold">{n.name}</span>
                    {n.votes === maxVotes && <Badge tone="accent">Leading</Badge>}
                  </div>
                  <div className="truncate text-[12px] text-fg2">{n.role}</div>
                  <div className="mt-2 text-[13px] leading-snug text-fg2">{n.reason}</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-fill2">
                      <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(n.votes / (maxVotes + 1)) * 100}%` }} />
                    </div>
                    <span className="tnum w-6 text-right text-[13px] font-semibold">{n.votes}</span>
                    <Button
                      size="sm"
                      variant={done ? 'ok' : 'primary'}
                      disabled={done}
                      icon={done ? <Check size={14} /> : undefined}
                      onClick={() => {
                        actions.nominate(n.id)
                        actions.toast({ title: `${n.name} nominated`, body: `Added to the ${month} H&S award.`, tone: 'ok' })
                      }}
                    >
                      {done ? 'Nominated' : 'Nominate'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <Sheet open={nm} onClose={() => setNm(false)} title="Log a near miss" subtitle="Goes to the site manager to close out">
        <div className="space-y-4">
          <Field label="Site">
            <select className={inputCls} value={nmForm.projectId} onChange={(e) => setNmForm({ ...nmForm, projectId: e.target.value })}>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What happened">
            <textarea rows={3} className={inputCls} value={nmForm.text} placeholder="Offcut of board left at the top of stair core B" onChange={(e) => setNmForm({ ...nmForm, text: e.target.value })} />
          </Field>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                actions.logNearMiss(nmForm.projectId, nmForm.text || 'Offcut of board left at the top of stair core B')
                actions.toast({ title: 'Near miss logged', body: `${name(nmForm.projectId)} site manager notified.`, tone: 'ok' })
                setNm(false)
                setNmForm({ projectId: 'gcd', text: '' })
              }}
            >
              Log it
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
