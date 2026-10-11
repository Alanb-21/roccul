import { AnimatePresence, motion } from 'framer-motion'
import { ListOrdered, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ProfileId } from '../data/types'
import { cx } from '../lib/format'
import { useStore, type SiteTab, type View } from '../store'
import { spring } from '../ui'

interface Stop {
  title: string
  talk: string
  profile: ProfileId
  view: View
  mode?: 'then' | 'now'
  siteId?: string
  siteTab?: SiteTab
  focus?: string
}

export const STOPS: Stop[] = [
  { title: 'Then and Now', talk: "This is how you see the jobs today. A WhatsApp group, a whiteboard and a cost sheet from last Thursday. Now flip it.", profile: 'john', view: 'home', mode: 'then' },
  { title: 'Portfolio', talk: 'This is every site, right now, not last Thursday. Five numbers, and the four things that need you today.', profile: 'john', view: 'home' },
  { title: 'IFSC site and Diary', talk: "IFSC is the one at risk. Pick a recovery right here. Then tap Diary and search ceiling grid: every site, every date.", profile: 'john', view: 'site', siteId: 'ifsc', siteTab: 'today' },
  { title: 'Mark posts an update', talk: "This is Mark's phone on site. He taps Post update, and watch it land in the Live panel on the right.", profile: 'mark', view: 'phone' },
  { title: 'Crews & Plant', talk: "The whiteboard, live. That lift is booked on two sites Thursday. Drag it to Friday, done. And the idle lift in Newcastle, off-hire it in one tap.", profile: 'john', view: 'board' },
  { title: 'Cost and Manchester', talk: 'Manchester is slipping because two variations are on site with no price. Price them and watch the margin come back.', profile: 'john', view: 'cost', focus: 'manchester' },
  { title: 'Friday report and Impact', talk: 'The Friday report in two seconds. That used to take the afternoon. Then Impact shows what this is worth to Roccul.', profile: 'john', view: 'reports' },
]

export function useJump() {
  const { actions } = useStore()
  return (i: number) => {
    const s = STOPS[i]
    actions.setProfile(s.profile)
    actions.go(s.view, {
      mode: s.mode ?? 'now',
      siteId: s.siteId ?? 'gcd',
      siteTab: s.siteTab ?? 'today',
      focus: s.focus ?? null,
      walkOpen: false,
      cmdOpen: false,
      settingsOpen: false,
      diaryQuery: '',
    })
    setTimeout(() => document.querySelector('[data-main-scroll]')?.scrollTo({ top: 0 }), 50)
  }
}

export function Walkthrough() {
  const { ui, actions } = useStore()
  const jump = useJump()
  const [last, setLast] = useState<number | null>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (/^[1-7h]$/i.test(e.key) && t instanceof HTMLButtonElement) t.blur()
      if (/^[1-7]$/.test(e.key)) {
        const i = Number(e.key) - 1
        setLast(i)
        jump(i)
      }
      if (e.key.toLowerCase() === 'h') actions.patchUI({ walkHidden: !ui.walkHidden, walkOpen: false })
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  if (ui.walkHidden) return null
  return (
    <div className="fixed bottom-24 right-4 z-[75] flex flex-col items-end md:bottom-5 md:right-5">
      <AnimatePresence>
        {ui.walkOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={spring}
            className="glass-solid mb-3 w-[min(400px,calc(100vw-32px))] origin-bottom-right overflow-hidden rounded-[26px]"
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <div>
                <div className="text-[16px] font-semibold">Walkthrough</div>
                <div className="text-[12px] text-fg3">Keys 1 to 7 jump. H hides this.</div>
              </div>
              <button onClick={() => actions.patchUI({ walkOpen: false })} className="grid h-8 w-8 place-items-center rounded-full bg-fill2 text-fg2 hover:text-fg" aria-label="Close walkthrough">
                <X size={15} />
              </button>
            </div>
            <div className="scroll max-h-[60vh] p-2">
              {STOPS.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => {
                    setLast(i)
                    jump(i)
                  }}
                  className={cx('flex w-full gap-3 rounded-[16px] p-3 text-left transition hover:bg-fill2', last === i && 'bg-fill')}
                >
                  <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-bold', last === i ? 'bg-accent text-white' : 'bg-fill2 text-fg')}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold">{s.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-fg2">{s.talk}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => actions.patchUI({ walkOpen: !ui.walkOpen })}
        className="glass-solid focus-ring flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-[14px] font-semibold transition hover:scale-[1.03] active:scale-[0.98]"
      >
        <ListOrdered size={17} className="text-accent" />
        <span className="max-sm:hidden">Walkthrough</span>
        {last !== null && <span className="tnum rounded-full bg-fill2 px-2 py-0.5 text-[12px] text-fg2">{last + 1}/7</span>}
      </button>
    </div>
  )
}
