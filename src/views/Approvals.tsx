import { AnimatePresence, motion } from 'framer-motion'
import { Check, Inbox, X } from 'lucide-react'
import { useState } from 'react'
import { cx, money } from '../lib/format'
import { useStore } from '../store'
import { Badge, Button, Card, Empty, Segmented } from '../ui'

export function Approvals() {
  const { data, actions, x } = useStore()
  const [tab, setTab] = useState<'waiting' | 'done'>('waiting')
  const mine = ['gcd', 'ifsc', 'sandyford', 'cherrywood']
  const all = data.approvals.filter((a) => mine.includes(a.projectId))
  const list = all.filter((a) => (tab === 'waiting' ? a.state === 'waiting' : a.state !== 'waiting'))
  const name = (id: string) => data.projects.find((p) => p.id === id)!.name
  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight">Approvals</h1>
          <p className="mt-1 text-[15px] text-fg2">Variations, overtime, RAMS, plant and orders from your sites. One tap, and the site knows.</p>
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'waiting', label: `Waiting ${all.filter((a) => a.state === 'waiting').length}` },
            { value: 'done', label: 'Done' },
          ]}
        />
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((a) => (
            <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-[240px] flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="accent">{a.kind}</Badge>
                    <span className="text-[12px] text-fg3">
                      {name(a.projectId)}. From {a.from}. {a.daysAgo === 0 ? 'Today' : `${a.daysAgo}d ago`}
                    </span>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold leading-snug">{a.title}</div>
                </div>
                {a.amount && <span className="tnum text-[18px] font-semibold">{money(a.amount, 'EUR', { exact: true })}</span>}
                {a.state === 'waiting' ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<X size={14} />}
                      onClick={() => {
                        actions.decide(a.id, 'rejected')
                        actions.toast({ title: 'Sent back', body: `${a.from} asked for more detail.`, tone: 'info' })
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Check size={14} />}
                      onClick={() => {
                        if (a.id === 'a2' && !x.ifscFix) actions.fixIfsc('saturday')
                        else {
                          actions.decide(a.id, 'approved')
                          actions.feed({ projectId: a.projectId, kind: a.kind === 'RAMS' ? 'safety' : 'cost', actor: 'Ciara Doyle', text: `Approved: ${a.title}` })
                          actions.toast({ title: 'Approved', body: `${a.from} notified on site.`, tone: 'ok' })
                        }
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                ) : (
                  <Badge tone={a.state === 'approved' ? 'ok' : 'neutral'} className={cx(a.state === 'rejected' && 'opacity-80')}>
                    {a.state === 'approved' ? 'Approved' : 'Sent back'}
                  </Badge>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <Card>
            <Empty icon={<Inbox size={20} />} title={tab === 'waiting' ? 'All clear' : 'Nothing decided yet'} body={tab === 'waiting' ? 'Nothing waiting on you. The sites have what they need.' : 'Approvals you make show up here.'} />
          </Card>
        )}
      </div>
    </div>
  )
}
