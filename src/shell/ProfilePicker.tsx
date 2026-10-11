import { motion } from 'framer-motion'
import { profiles } from '../data/seed'
import { useStore } from '../store'
import { Avatar, Wordmark } from '../ui'

export function ProfilePicker() {
  const { actions } = useStore()
  return (
    <div className="scroll relative z-10 flex h-full flex-col items-center px-4 py-10 sm:justify-center">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
        <Wordmark size={22} />
        <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-fg3">Create | Construct | Complete</div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-10 text-center text-[34px] font-semibold tracking-tight sm:mt-14 sm:text-[48px]"
      >
        Who's on Roccul Live?
      </motion.h1>
      <div className="mt-10 grid max-w-[980px] grid-cols-2 gap-x-6 gap-y-9 sm:mt-14 sm:grid-cols-3 lg:grid-cols-6">
        {profiles.map((p, i) => {
          const first = i === 0
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 260, damping: 26 }}
              onClick={() => actions.setProfile(p.id)}
              className="focus-ring group flex w-[140px] flex-col items-center rounded-[28px] p-2 text-center outline-none"
            >
              <span className="relative">
                {first && <span className="absolute -inset-3 rounded-full bg-accent/25 blur-xl transition group-hover:bg-accent/40" />}
                <span className="relative block transition duration-300 group-hover:scale-[1.06] group-active:scale-[0.98]">
                  <Avatar initials={p.initials} size={112} ring={first} className="text-[38px]" />
                </span>
              </span>
              <span className="mt-4 text-[16px] font-semibold text-fg transition group-hover:text-fg">{p.name}</span>
              <span className="mt-1 text-[13px] leading-snug text-fg2">{p.role}</span>
            </motion.button>
          )
        })}
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-14 text-center text-[13px] text-fg3">
        Roccul Limited, 2 Georges Dock, IFSC, Dublin 1. Roccul UK Limited, Coalisland, Tyrone.
      </motion.p>
    </div>
  )
}
