import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  ClipboardCheck,
  Coins,
  FileQuestion,
  FileSignature,
  HardHat,
  MessageSquareOff,
  Package,
  ShieldAlert,
  Truck,
  UserCheck,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { FeedKind } from '../data/types'
import { headcount } from '../lib/calc'
import { cx, timeAgo } from '../lib/format'
import { useNow, useStore } from '../store'
import { Dot, PhotoTile } from '../ui'
import { sitesFor } from './nav'

export const feedIcon: Record<FeedKind, LucideIcon> = {
  signin: UserCheck,
  photo: Camera,
  permit: FileSignature,
  delivery: Truck,
  toolbox: HardHat,
  snag: Wrench,
  rfi: FileQuestion,
  variation: Coins,
  inspection: ClipboardCheck,
  plant: Package,
  cost: Coins,
  safety: ShieldAlert,
}

function Feed() {
  const { data, ui, actions } = useStore()
  const now = useNow(10000)
  const all = data.projects.map((p) => p.id)
  const mine = ui.profile === 'mark' || ui.profile === 'owen' ? all : sitesFor(ui.profile!, all)
  const items = data.feed.filter((f) => mine.includes(f.projectId)).slice(0, 30)
  const people = data.projects.filter((p) => mine.includes(p.id)).reduce((s, p) => s + headcount(p), 0)
  return (
    <>
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="text-ok">
            <Dot rag="green" pulse />
          </span>
          <h2 className="text-[17px] font-semibold tracking-tight">Live</h2>
        </div>
        <span className="tnum text-[12px] font-medium text-fg2">{people} on site now</span>
      </div>
      <div className="scroll flex-1 px-3 pb-24">
        <AnimatePresence initial={false}>
          {items.map((f) => {
            const p = data.projects.find((y) => y.id === f.projectId)!
            const Icon = feedIcon[f.kind]
            return (
              <motion.button
                layout
                key={f.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => actions.openSite(f.projectId, f.kind === 'photo' ? 'diary' : 'today')}
                className="group flex w-full gap-3 rounded-[16px] p-2.5 text-left transition hover:bg-fill"
              >
                <span className="relative mt-0.5 shrink-0">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] text-white" style={{ background: `linear-gradient(145deg, ${p.tone[0]}, ${p.tone[1]})` }}>
                    <Icon size={17} />
                  </span>
                  {f.fresh && now - f.at < 60000 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-[var(--bg)]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold">{p.name}</span>
                    <span className="tnum shrink-0 text-[11px] text-fg3">{timeAgo(f.at, now)}</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-fg2">{f.text}</span>
                  <span className="mt-0.5 block text-[11px] text-fg3">{f.actor}</span>
                  {f.photo && <PhotoTile photo={f.photo} showCaption={false} className="mt-2 h-[72px] w-full rounded-[12px]" />}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

function ThenFeed() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-fill2 text-fg3">
        <MessageSquareOff size={24} />
      </div>
      <div className="mt-4 text-[16px] font-semibold">Nothing live</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-fg2">
        The picture arrives in Friday's report. If someone has time to write it.
      </p>
    </div>
  )
}

export function LivePanel() {
  const { ui } = useStore()
  return (
    <aside className="glass relative z-10 hidden w-[300px] shrink-0 flex-col overflow-hidden rounded-[28px] xl:flex 2xl:w-[330px]">
      {ui.mode === 'then' ? <ThenFeed /> : <Feed />}
    </aside>
  )
}

export function LiveDrawer() {
  const { ui, actions } = useStore()
  return (
    <AnimatePresence>
      {ui.liveOpen && (
        <motion.div className="fixed inset-0 z-[60] xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => actions.patchUI({ liveOpen: false })} />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={cx('glass-strong absolute bottom-2 right-2 top-2 flex w-[min(360px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px]')}
          >
            <button onClick={() => actions.patchUI({ liveOpen: false })} className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-fill2 text-fg2" aria-label="Close">
              <X size={16} />
            </button>
            {ui.mode === 'then' ? <ThenFeed /> : <Feed />}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
