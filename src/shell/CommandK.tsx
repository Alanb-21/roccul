import { AnimatePresence, motion } from 'framer-motion'
import { Building2, CalendarRange, Coins, MessageSquareText, Search, User } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { profiles } from '../data/seed'
import { clock, cx, money } from '../lib/format'
import { useStore } from '../store'
import { spring } from '../ui'

interface Hit {
  id: string
  group: string
  icon: ReactNode
  title: string
  sub: string
  run: () => void
}

export function CommandK() {
  const { ui, data, actions } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const open = ui.cmdOpen
  const close = () => actions.patchUI({ cmdOpen: false })

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        actions.patchUI({ cmdOpen: !open })
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, actions])

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => input.current?.focus(), 30)
    }
  }, [open])

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase()
    const m = (...t: string[]) => !s || t.some((x) => x.toLowerCase().includes(s))
    const pName = (id: string) => data.projects.find((p) => p.id === id)!.name
    const out: Hit[] = []
    const field = ui.profile === 'mark' || ui.profile === 'owen'
    data.projects
      .filter((p) => m(p.name, p.area, p.client, p.scope, p.siteManager))
      .forEach((p) =>
        out.push({ id: `s${p.id}`, group: 'Sites', icon: <Building2 size={16} />, title: `${p.name}, ${p.area}`, sub: `${p.scope}. ${p.client}`, run: () => (field ? actions.setProfile('john') : null, actions.openSite(p.id)) }),
      )
    profiles
      .filter((p) => m(p.name, p.role))
      .forEach((p) => out.push({ id: `p${p.id}`, group: 'People', icon: <User size={16} />, title: p.name, sub: `${p.role}. Open their view`, run: () => actions.setProfile(p.id) }))
    data.projects
      .filter((p) => s && m(p.siteManager))
      .forEach((p) => out.push({ id: `sm${p.id}`, group: 'People', icon: <User size={16} />, title: p.siteManager, sub: `Site Manager, ${p.name}`, run: () => actions.openSite(p.id) }))
    if (s)
      data.diary
        .filter((d) => m(d.text, d.area, d.trade, d.photo?.caption ?? ''))
        .slice(0, 6)
        .forEach((d) =>
          out.push({ id: d.id, group: 'Diary', icon: <MessageSquareText size={16} />, title: d.photo?.caption ?? d.text, sub: `${pName(d.projectId)}, ${clock(d.at)}, ${d.author}`, run: () => actions.openSite(d.projectId, 'diary', { diaryQuery: q }) }),
        )
    data.variations
      .filter((v) => s && m(v.ref, v.title, v.status))
      .slice(0, 6)
      .forEach((v) => {
        const cur = data.projects.find((p) => p.id === v.projectId)!.currency
        out.push({ id: v.id, group: 'Variations', icon: <Coins size={16} />, title: `${v.ref} ${v.title}`, sub: `${pName(v.projectId)}, ${v.status === 'withQS' ? 'with QS' : v.status}, ${money(v.status === 'unpriced' ? v.cost : v.value, cur)}`, run: () => actions.go('cost', { focus: v.projectId }) })
      })
    data.resources
      .filter((r) => s && m(r.name, r.short, r.detail))
      .forEach((r) => out.push({ id: r.id, group: r.kind === 'plant' ? 'Plant' : 'Crews', icon: <CalendarRange size={16} />, title: r.name, sub: r.kind === 'plant' ? (r.onHire ? `${r.supplier}, ${money(r.rate!, r.currency)} a week` : 'Off hire') : r.detail, run: () => actions.go('board') }))
    return out.slice(0, 40)
  }, [q, data, actions, ui.profile])

  useEffect(() => setSel(0), [q])

  const groups = hits.reduce<Record<string, Hit[]>>((a, h) => ((a[h.group] ??= []).push(h), a), {})
  let idx = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] flex justify-center px-3 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <motion.div
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.98 }}
            transition={spring}
            className="glass-solid relative flex max-h-[70vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[26px]"
          >
            <div className="flex items-center gap-3 border-b border-hairline px-5">
              <Search size={19} className="text-fg3" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close()
                  if (e.key === 'ArrowDown') (e.preventDefault(), setSel((s) => Math.min(s + 1, hits.length - 1)))
                  if (e.key === 'ArrowUp') (e.preventDefault(), setSel((s) => Math.max(s - 1, 0)))
                  if (e.key === 'Enter' && hits[sel]) (hits[sel].run(), close())
                }}
                placeholder="Try ceiling grid, SL-07, V-015 or Owen"
                className="h-16 flex-1 bg-transparent text-[17px] outline-none placeholder:text-fg3"
              />
              <kbd className="rounded-md bg-fill2 px-1.5 py-0.5 text-[11px] font-semibold text-fg2">esc</kbd>
            </div>
            <div className="scroll p-2">
              {hits.length === 0 && <div className="px-4 py-10 text-center text-[14px] text-fg2">Nothing found for "{q}"</div>}
              {Object.entries(groups).map(([g, list]) => (
                <div key={g} className="mb-1">
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-fg3">{g}</div>
                  {list.map((h) => {
                    idx++
                    const i = idx
                    return (
                      <button
                        key={h.id}
                        onMouseEnter={() => setSel(i)}
                        onClick={() => (h.run(), close())}
                        className={cx('flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition', sel === i ? 'bg-fill2' : '')}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-fill2 text-fg2">{h.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold">{h.title}</span>
                          <span className="block truncate text-[12px] text-fg2">{h.sub}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
