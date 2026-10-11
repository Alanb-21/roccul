import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

export function Skeleton() {
  return (
    <div className="space-y-5 p-1">
      <div className="shimmer h-9 w-64 rounded-[12px]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-28 rounded-[24px]" />
        ))}
      </div>
      <div className="shimmer h-56 rounded-[24px]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shimmer h-40 rounded-[24px]" />
        ))}
      </div>
    </div>
  )
}

/** Shows a 300ms skeleton whenever the key changes, so moving around feels like real data loading. */
export function Loader({ k, children, skeleton = <Skeleton /> }: { k: string; children: ReactNode; skeleton?: ReactNode }) {
  const [shown, setShown] = useState(k)
  const loading = shown !== k
  useEffect(() => {
    if (shown === k) return
    const t = setTimeout(() => setShown(k), 300)
    return () => clearTimeout(t)
  }, [k, shown])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loading ? `sk-${k}` : k}
        initial={{ opacity: 0, y: loading ? 0 : 6, filter: loading ? 'blur(0px)' : 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0 }}
        transition={{ duration: loading ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {loading ? skeleton : children}
      </motion.div>
    </AnimatePresence>
  )
}

