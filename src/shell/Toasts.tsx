import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'

export function Toasts() {
  const { toasts, setToasts, data, actions, ui } = useStore()
  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[90] flex w-[min(420px,calc(100vw-24px))] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const p = t.site ? data.projects.find((y) => y.id === t.site) : undefined
          const Icon = t.tone === 'ok' ? CheckCircle2 : t.tone === 'warn' ? AlertTriangle : Bell
          return (
            <motion.button
              layout
              key={t.id}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={() => {
                setToasts((l) => l.filter((y) => y.id !== t.id))
                if (t.site && ui.profile !== 'mark' && ui.profile !== 'owen') actions.openSite(t.site, 'diary')
              }}
              className="glass-solid pointer-events-auto flex items-start gap-3 rounded-[22px] p-3.5 text-left"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white"
                style={{ background: p ? `linear-gradient(145deg, ${p.tone[0]}, ${p.tone[1]})` : t.tone === 'ok' ? 'var(--ok)' : 'var(--accent)' }}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold">{t.title}</span>
                  <span className="shrink-0 text-[11px] text-fg3">now</span>
                </span>
                {t.body && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-fg2">{t.body}</span>}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
