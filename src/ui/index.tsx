import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Photo, Rag } from '../data/types'
import { cx } from '../lib/format'

export const spring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 } as const

export function Card({ children, className, onClick, as = 'div' }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'button' }) {
  const C = as
  return (
    <C
      onClick={onClick}
      className={cx(
        'glass rounded-[24px] text-left',
        onClick && 'cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:bg-fill2 active:translate-y-0 active:scale-[0.995]',
        className,
      )}
    >
      {children}
    </C>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ok'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', icon, className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cx(
        'focus-ring inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' && 'h-8 px-3.5 text-[13px]',
        size === 'md' && 'h-10 px-4.5 text-[14px]',
        size === 'lg' && 'h-12 px-6 text-[15px]',
        variant === 'primary' && 'bg-accent text-white shadow-[0_8px_24px_-8px_rgba(var(--accent-rgb),0.7)] hover:brightness-110',
        variant === 'secondary' && 'bg-fill2 text-fg hover:bg-fill2/80 hover:brightness-125',
        variant === 'ghost' && 'text-fg2 hover:bg-fill hover:text-fg',
        variant === 'danger' && 'bg-bad/15 text-bad hover:bg-bad/25',
        variant === 'ok' && 'bg-ok/15 text-ok hover:bg-ok/25',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export const ragColor = (r: Rag) => (r === 'green' ? 'var(--ok)' : r === 'amber' ? 'var(--warn)' : 'var(--bad)')

export function Dot({ rag, pulse, size = 8 }: { rag: Rag | 'accent'; pulse?: boolean; size?: number }) {
  const c = rag === 'accent' ? 'var(--accent)' : ragColor(rag)
  return (
    <span className={cx('inline-block shrink-0 rounded-full', pulse && 'pulse')} style={{ width: size, height: size, background: c, color: c }} />
  )
}

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'accent'; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold',
        tone === 'neutral' && 'bg-fill2 text-fg2',
        tone === 'ok' && 'bg-ok/15 text-ok',
        tone === 'warn' && 'bg-warn/15 text-warn',
        tone === 'bad' && 'bg-bad/15 text-bad',
        tone === 'accent' && 'bg-accent/15 text-accent',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Sparkline({ data, color = 'var(--accent)', w = 120, h = 36, threshold }: { data: number[]; color?: string; w?: number; h?: number; threshold?: number }) {
  const id = useId().replace(/:/g, '')
  const lo = Math.min(...data, threshold ?? Infinity) - 0.4
  const hi = Math.max(...data, threshold ?? -Infinity) + 0.4
  const pad = 3
  const xs = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2)
  const ys = (v: number) => pad + (1 - (v - lo) / (hi - lo)) * (h - pad * 2)
  const pts = data.map((v, i) => [xs(i), ys(v)] as const)
  const line = pts.map(([x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const cx1 = px + (x - px) / 2
    return `C${cx1},${py} ${cx1},${y} ${x},${y}`
  }).join(' ')
  const area = `${line} L${xs(data.length - 1)},${h} L${xs(0)},${h} Z`
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {threshold !== undefined && (
        <line x1={0} x2={w} y1={ys(threshold)} y2={ys(threshold)} stroke="var(--fg3)" strokeDasharray="2 3" strokeWidth={1} />
      )}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={3} fill={color} />
    </svg>
  )
}

export function Progress({ value, color = 'var(--accent)', className, height = 6 }: { value: number; color?: string; className?: string; height?: number }) {
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-fill2', className)} style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 24 }}
      />
    </div>
  )
}

export function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => format(v))
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] })
    return c.stop
  }, [value, mv])
  return <motion.span className="tnum">{text}</motion.span>
}

const TONES: [string, string, string][] = [
  ['#5b6f86', '#26303c', 'grid'],
  ['#5e6670', '#23272c', 'tray'],
  ['#8a7258', '#2e261d', 'floor'],
  ['#77736c', '#2a2826', 'detail'],
  ['#9a8c7b', '#3a332b', 'room'],
  ['#7d8287', '#2c2f33', 'studs'],
  ['#6f8aa3', '#2a333b', 'roof'],
]

function PhotoArt({ kind }: { kind: string }) {
  const s = { stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1, fill: 'none' }
  if (kind === 'grid')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-40 + i * 36} y1={0} x2={20 + i * 22} y2={120} {...s} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={10 + i * i * 3.4} x2={200} y2={10 + i * i * 3.4} {...s} />
        ))}
      </svg>
    )
  if (kind === 'tray')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <path d="M0 40 L200 22 M0 52 L200 34" {...s} strokeWidth={2} />
        <path d="M0 70 L200 60 M0 78 L200 68" {...s} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 22} y1={40 - i * 1.8} x2={i * 22} y2={52 - i * 1.8} {...s} />
        ))}
      </svg>
    )
  if (kind === 'floor')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={100} y1={30} x2={-100 + i * 40} y2={120} {...s} />
        ))}
        {[44, 60, 82, 112].map((y) => (
          <line key={y} x1={0} y1={y} x2={200} y2={y} {...s} />
        ))}
      </svg>
    )
  if (kind === 'studs')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={8 + i * 16} y={10} width={3} height={100} fill="rgba(255,255,255,0.1)" />
        ))}
        <line x1={0} y1={12} x2={200} y2={12} {...s} strokeWidth={2} />
        <line x1={0} y1={108} x2={200} y2={108} {...s} strokeWidth={2} />
      </svg>
    )
  if (kind === 'roof')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <path d="M0 74 L200 62 L200 120 L0 120 Z" fill="rgba(0,0,0,0.25)" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={i * 30} y1={73 - i * 1.8} x2={i * 30 - 20} y2={120} {...s} />
        ))}
      </svg>
    )
  if (kind === 'room')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <path d="M60 20 L140 20 L140 90 L60 90 Z" {...s} />
        <path d="M0 0 L60 20 M200 0 L140 20 M0 120 L60 90 M200 120 L140 90" {...s} />
      </svg>
    )
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <circle cx={130} cy={50} r={34} {...s} />
      <circle cx={130} cy={50} r={20} {...s} />
      <line x1={0} y1={96} x2={200} y2={80} {...s} />
    </svg>
  )
}

export function PhotoTile({ photo, className, showCaption = true, compact }: { photo: Photo; className?: string; showCaption?: boolean; compact?: boolean }) {
  const [a, b, kind] = TONES[photo.tone % TONES.length]
  return (
    <div className={cx('relative overflow-hidden rounded-[18px]', className)} style={{ background: `linear-gradient(150deg, ${a}, ${b})` }}>
      <PhotoArt kind={kind} />
      <div className="photo-grain absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
      {showCaption && (
        <div className={cx('absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white', compact ? 'px-2.5 pb-2 pt-6 text-[11px]' : 'px-3.5 pb-3 pt-10 text-[13px]')}>
          <span className="font-medium leading-tight">{photo.caption}</span>
        </div>
      )}
    </div>
  )
}

export function Avatar({ initials, size = 40, ring, className }: { initials: string; size?: number; ring?: boolean; className?: string }) {
  return (
    <span
      className={cx('relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-fg', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: 'linear-gradient(145deg, rgba(var(--accent-rgb),0.38), rgba(var(--accent-rgb),0.08))',
        boxShadow: ring
          ? '0 0 0 2px var(--bg), 0 0 0 4px var(--accent), inset 0 1px 0 rgba(255,255,255,0.18)'
          : 'inset 0 0 0 1px var(--hairline), inset 0 1px 0 rgba(255,255,255,0.14)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {initials}
    </span>
  )
}

export function Sheet({ open, onClose, title, subtitle, children, width = 520 }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={title}
            className="glass-strong relative z-10 m-0 flex max-h-[88vh] w-full flex-col rounded-t-[28px] sm:m-4 sm:rounded-[28px]"
            style={{ maxWidth: width }}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={spring}
          >
            <div className="flex items-start gap-4 px-6 pb-3 pt-6">
              <div className="min-w-0 flex-1">
                <h3 className="text-[20px] font-semibold tracking-tight">{title}</h3>
                {subtitle && <p className="mt-1 text-[14px] text-fg2">{subtitle}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="focus-ring -mr-1 grid h-8 w-8 place-items-center rounded-full bg-fill2 text-fg2 transition hover:text-fg">
                <X size={16} />
              </button>
            </div>
            <div className="scroll px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Segmented<T extends string>({ value, options, onChange, className, size = 'md' }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md' }) {
  const id = useId()
  return (
    <div className={cx('relative inline-flex shrink-0 rounded-full bg-fill p-1 hair', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'focus-ring relative z-10 whitespace-nowrap rounded-full font-semibold transition-colors duration-200',
            size === 'md' ? 'h-8 px-4 text-[13px]' : 'h-7 px-3 text-[12px]',
            value === o.value ? 'text-fg' : 'text-fg2 hover:text-fg',
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 -z-10 rounded-full bg-glass-strong shadow-[0_2px_10px_rgba(0,0,0,0.15)] hair" transition={spring} />
          )}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Wordmark({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span className={cx('inline-flex items-baseline font-extrabold tracking-[0.16em] text-fg', className)} style={{ fontSize: size }}>
      ROCCUL
      <span className="ml-[0.18em] inline-block rounded-full bg-accent" style={{ width: size * 0.26, height: size * 0.26 }} />
    </span>
  )
}

export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx('mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2', className)}>
      <h2 className="text-[19px] font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-medium leading-tight text-fg2">{label}</div>
      <div className={cx('tnum mt-1.5 whitespace-nowrap text-[28px] font-semibold leading-none tracking-tight', tone === 'ok' && 'text-ok', tone === 'warn' && 'text-warn', tone === 'bad' && 'text-bad')}>{value}</div>
      {sub && <div className="mt-1.5 text-[12px] leading-snug text-fg3">{sub}</div>}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-fg2">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-[14px] bg-fill px-3.5 py-2.5 text-[15px] outline-none hair transition focus:bg-fill2 focus:ring-2 focus:ring-accent/50'

export function Empty({ icon, title, body }: { icon: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-fill2 text-fg2">{icon}</div>
      <div className="mt-3 text-[15px] font-semibold">{title}</div>
      {body && <div className="mt-1 max-w-[280px] text-[13px] text-fg2">{body}</div>}
    </div>
  )
}
