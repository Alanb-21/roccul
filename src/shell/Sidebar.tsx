import { AnimatePresence, motion } from 'framer-motion'
import { Check, LogOut, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { profiles, siteCode } from '../data/seed'
import { cx } from '../lib/format'
import { profileById, useStore } from '../store'
import { Avatar, Dot, spring } from '../ui'
import { navFor, sitesFor } from './nav'

export function ProfileMenu({ compact }: { compact?: boolean }) {
  const { ui, actions } = useStore()
  const me = profileById(ui.profile)!
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx('focus-ring flex min-w-0 items-center gap-3 rounded-full p-1 pr-3 text-left transition hover:bg-fill', compact && 'pr-1')}
        aria-label="Switch profile"
      >
        <Avatar initials={me.initials} size={36} />
        {!compact && (
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold leading-tight">{me.name}</span>
            <span className="block truncate text-[12px] text-fg2">{me.role}</span>
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={spring}
            className="glass-solid absolute left-0 top-12 z-[70] w-[290px] origin-top-left rounded-[22px] p-2"
          >
            <div className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-wider text-fg3">Switch profile</div>
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  actions.setProfile(p.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-left transition hover:bg-fill2"
              >
                <Avatar initials={p.initials} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                  <span className="block truncate text-[12px] text-fg2">{p.role}</span>
                </span>
                {p.id === ui.profile && <Check size={16} className="text-accent" />}
              </button>
            ))}
            <div className="my-1 h-px bg-hairline" />
            <button
              onClick={() => actions.setProfile(null)}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium text-fg2 transition hover:bg-fill2 hover:text-fg"
            >
              <LogOut size={16} /> Back to profiles
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar() {
  const { ui, data, actions } = useStore()
  const nav = navFor(ui.profile!)
  const siteIds = sitesFor(ui.profile!, data.projects.map((p) => p.id))
  const showSites = ui.profile !== 'mark' && ui.profile !== 'owen'
  return (
    <aside className="glass relative z-20 hidden w-[76px] shrink-0 flex-col rounded-[28px] md:flex xl:w-[252px]">
      <div className="flex items-center justify-between px-3 pt-3 xl:px-4 xl:pt-4">
        <div className="xl:hidden">
          <ProfileMenu compact />
        </div>
        <div className="hidden min-w-0 xl:block">
          <ProfileMenu />
        </div>
      </div>
      <div className="hidden px-5 pt-5 xl:block">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-extrabold tracking-[0.18em]">ROCCUL</span>
          <span className="text-[13px] font-semibold text-fg2">Live</span>
        </div>
      </div>
      <nav className="mt-3 space-y-1 px-2 xl:mt-2 xl:px-3">
        {nav.map((n) => {
          const active = ui.view === n.view
          return (
            <button
              key={n.view}
              onClick={() => actions.go(n.view)}
              title={n.label}
              className={cx(
                'focus-ring relative flex h-11 w-full items-center justify-center gap-3 rounded-[14px] px-3 text-[15px] font-semibold transition xl:justify-start',
                active ? 'text-fg' : 'text-fg2 hover:bg-fill hover:text-fg',
              )}
            >
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-[14px] bg-fill2" transition={spring} />}
              <n.icon size={20} className="relative" strokeWidth={active ? 2.3 : 2} />
              <span className="relative hidden xl:inline">{n.label}</span>
            </button>
          )
        })}
      </nav>
      {showSites && (
        <>
          <div className="mx-4 mt-5 hidden text-[12px] font-semibold uppercase tracking-wider text-fg3 xl:block">Live sites</div>
          <div className="scroll noscroll mt-2 flex-1 space-y-0.5 px-2 xl:px-3">
            {siteIds.map((id) => {
              const p = data.projects.find((y) => y.id === id)!
              const active = ui.view === 'site' && ui.siteId === id
              return (
                <button
                  key={id}
                  onClick={() => actions.openSite(id)}
                  title={p.name}
                  className={cx(
                    'focus-ring flex w-full items-center justify-center gap-3 rounded-[14px] p-2 text-left transition xl:justify-start',
                    active ? 'bg-fill2' : 'hover:bg-fill',
                  )}
                >
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[11px] text-[11px] font-bold tracking-tight text-white" style={{ background: `linear-gradient(145deg, ${p.tone[0]}, ${p.tone[1]})` }}>
                    {siteCode[p.id]}
                    <span className="absolute -right-0.5 -top-0.5 rounded-full p-[2px]" style={{ background: 'var(--bg)' }}>
                      <Dot rag={p.rag} size={8} />
                    </span>
                  </span>
                  <span className="hidden min-w-0 flex-1 xl:block">
                    <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                    <span className="block truncate text-[12px] text-fg2">{p.statusLine}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
      {!showSites && <div className="flex-1" />}
      <div className="p-2 xl:p-3">
        <button
          onClick={() => actions.patchUI({ settingsOpen: true })}
          className="focus-ring flex h-11 w-full items-center justify-center gap-3 rounded-[14px] px-3 text-[14px] font-semibold text-fg2 transition hover:bg-fill hover:text-fg xl:justify-start"
          title="Settings"
        >
          <Settings size={19} />
          <span className="hidden xl:inline">Settings</span>
        </button>
      </div>
    </aside>
  )
}

export function BottomBar() {
  const { ui, actions } = useStore()
  const nav = navFor(ui.profile!).slice(0, 5)
  return (
    <nav className="glass-solid fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-[24px] px-2 md:hidden">
      {nav.map((n) => {
        const active = ui.view === n.view
        return (
          <button key={n.view} onClick={() => actions.go(n.view)} className={cx('flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition', active ? 'text-accent' : 'text-fg2')}>
            <n.icon size={21} />
            {n.label.split(' ')[0]}
          </button>
        )
      })}
      <button onClick={() => actions.patchUI({ settingsOpen: true })} className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold text-fg2">
        <Settings size={21} />
        Settings
      </button>
    </nav>
  )
}
