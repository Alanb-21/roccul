import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cx } from '../lib/format'
import { useStore } from '../store'
import { Button, Segmented, Sheet, Wordmark } from '../ui'

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx('focus-ring relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200', on ? 'bg-ok' : 'bg-fill2')}
    >
      <motion.span
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

function Row({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <div className="text-[15px] font-semibold">{title}</div>
        {sub && <div className="mt-0.5 text-[13px] text-fg2">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export function Settings() {
  const { ui, actions, threshold } = useStore()
  const [confirm, setConfirm] = useState(false)
  const close = () => {
    setConfirm(false)
    actions.patchUI({ settingsOpen: false })
  }
  return (
    <Sheet open={ui.settingsOpen} onClose={close} title="Settings">
      <div className="divide-y divide-hairline">
        <Row title="Appearance">
          <Segmented
            value={ui.theme}
            onChange={() => actions.toggleTheme()}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </Row>
        <Row title="Demo mode" sub="A new site event every 20 to 30 seconds">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-fg2">
              {ui.demo ? <Play size={13} /> : <Pause size={13} />}
              {ui.demo ? 'Playing' : 'Paused'}
            </span>
            <Switch on={ui.demo} onChange={(demo) => actions.patchUI({ demo })} label="Demo mode" />
          </div>
        </Row>
        <Row title="Margin warning" sub={`Flag any job forecasting under ${threshold.toFixed(1)}%`}>
          <input type="range" min={5} max={12} step={0.5} value={threshold} onChange={(e) => actions.setThreshold(Number(e.target.value))} className="w-36" aria-label="Margin threshold" />
        </Row>
        <Row title="Walkthrough pill" sub="Keys 1 to 7 jump to each stop. H hides it.">
          <Switch on={!ui.walkHidden} onChange={(v) => actions.patchUI({ walkHidden: !v })} label="Walkthrough pill" />
        </Row>
        <Row title="Reset demo" sub="Puts every site back to this morning">
          {confirm ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  actions.reset()
                  close()
                }}
              >
                Reset now
              </Button>
            </div>
          ) : (
            <Button size="sm" icon={<RotateCcw size={14} />} onClick={() => setConfirm(true)}>
              Reset
            </Button>
          )}
        </Row>
      </div>
      <div className="mt-4 rounded-[20px] bg-fill p-5">
        <div className="flex items-center justify-between">
          <Wordmark size={16} />
          <span className="text-[12px] font-medium text-fg3">Roccul Live 1.0</span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-fg2">
          Roccul Limited, 2nd Floor, 2 Georges Dock, IFSC, Dublin 1.
          <br />
          Roccul UK Limited, Coalisland, Tyrone.
          <br />
          ISO 45001 accredited.
        </p>
        <div className="mt-4 border-t border-hairline pt-3 text-[12px] text-fg3">Built by MTMN</div>
      </div>
    </Sheet>
  )
}
