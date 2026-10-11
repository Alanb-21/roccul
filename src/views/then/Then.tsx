import { motion } from 'framer-motion'
import { Camera, CheckCheck, FileSpreadsheet, Mic, Play, Search, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/format'
import { useStore } from '../../store'
import { Badge, Button, PhotoTile } from '../../ui'

type Msg =
  | { who: string; t: string; text: string }
  | { who: string; t: string; voice: string }
  | { who: string; t: string; photos: number[] }
  | { who: string; t: string; deleted: true }

const MSGS: Msg[] = [
  { who: 'Paddy B', t: '07:12', text: 'Apex only 3 lads in again' },
  { who: 'Gary R', t: '07:20', voice: '0:47' },
  { who: 'Mark F', t: '07:31', photos: [0, 1, 5, 3] },
  { who: 'Owen R', t: '07:44', text: 'Who has the scissor lift Thursday?? Need it L8' },
  { who: 'Shane K', t: '07:52', voice: '1:32' },
  { who: 'Aoife G', t: '08:03', text: 'Permit board pic above' },
  { who: 'Owen R', t: '08:05', deleted: true },
  { who: 'Mark F', t: '08:11', text: 'See above' },
  { who: 'Paddy B', t: '08:26', photos: [3, 2] },
  { who: 'Kerry A', t: '08:40', text: 'Building control want more fire stopping, will price later' },
  { who: 'Gary R', t: '08:58', text: 'Ok' },
  { who: 'Shane K', t: '09:14', voice: '0:22' },
]

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('glass overflow-hidden rounded-[24px]', className)}>{children}</div>
}

export function WhatsApp({ tall }: { tall?: boolean }) {
  return (
    <Panel className={cx('flex flex-col', tall ? 'h-[720px]' : 'h-[480px] lg:h-auto lg:max-h-[560px]')}>
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-fill2 text-fg2">
          <Users size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">Roccul Site Updates</div>
          <div className="truncate text-[12px] text-fg2">Mark, Paddy, Aoife, Owen, Gary, Shane, Kerry and 14 others</div>
        </div>
        <span className="tnum rounded-full bg-[#25D366] px-2.5 py-1 text-[12px] font-bold text-black">214</span>
      </div>
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        <Search size={15} className="text-fg3" />
        <span className="text-[13px] text-fg2">ceiling grid</span>
        <span className="ml-auto text-[12px] font-medium text-bad">No results</span>
      </div>
      <div className="scroll noscroll flex-1 space-y-2 px-3 py-3">
        <div className="mx-auto w-fit rounded-full bg-fill2 px-3 py-1 text-[11px] font-semibold text-fg2">214 unread messages</div>
        {MSGS.map((m, i) => (
          <div key={i} className="max-w-[82%] rounded-[6px_16px_16px_16px] bg-fill2 px-3 py-2">
            <div className="text-[12px] font-semibold" style={{ color: ['#e9a23b', '#4fb6e3', '#7bc86c', '#e36f6f', '#c99be3'][m.who.length % 5] }}>
              {m.who}
            </div>
            {'text' in m && <div className="text-[14px] leading-snug">{m.text}</div>}
            {'deleted' in m && <div className="text-[13px] italic text-fg3">This message was deleted</div>}
            {'voice' in m && (
              <div className="flex items-center gap-2.5 py-1">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-fill2">
                  <Play size={14} className="ml-0.5" />
                </span>
                <span className="flex h-6 items-center gap-[2px]">
                  {Array.from({ length: 26 }, (_, k) => (
                    <span key={k} className="w-[2px] rounded-full bg-fg3" style={{ height: 4 + ((k * 7 + i * 3) % 17) }} />
                  ))}
                </span>
                <span className="tnum text-[12px] text-fg2">{m.voice}</span>
                <Mic size={13} className="text-fg3" />
              </div>
            )}
            {'photos' in m && (
              <div className={cx('mt-1 grid gap-1', m.photos.length > 2 ? 'grid-cols-2' : 'grid-cols-2')}>
                {m.photos.map((t, k) => (
                  <PhotoTile key={k} photo={{ caption: '', tone: t }} showCaption={false} className="aspect-square w-[92px] rounded-[10px]" />
                ))}
              </div>
            )}
            <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-fg3">
              {m.t}
              <CheckCheck size={12} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-hairline px-3 py-2.5">
        <Camera size={18} className="text-fg3" />
        <div className="h-9 flex-1 rounded-full bg-fill2 px-3 text-[13px] leading-9 text-fg3">Message</div>
        <Mic size={18} className="text-fg3" />
      </div>
    </Panel>
  )
}

const SITES = ['GCD', 'IFSC', 'SANDY', 'MANC', 'NCL', 'CHERRY']
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const BOARD: Record<string, { t: string; c: string; x?: boolean; r?: number }[]> = {
  'GCD-0': [{ t: 'Apex x6', c: '#1f4fbf' }, { t: 'SL-04', c: '#111' }, { t: 'SL-07', c: '#111' }],
  'GCD-1': [{ t: 'Apex x6', c: '#1f4fbf' }, { t: 'Carps A', c: '#111' }],
  'GCD-3': [{ t: 'SL-07', c: '#111' }, { t: 'Carps B', c: '#111' }],
  'IFSC-0': [{ t: 'Kilbride 8', c: '#1f4fbf', x: true }, { t: 'Kilbride 6', c: '#1f4fbf' }],
  'IFSC-2': [{ t: 'Drywall 5', c: '#111' }],
  'IFSC-3': [{ t: 'SL-07 ??', c: '#d0312d', r: -4 }],
  'SANDY-0': [{ t: 'Pureform', c: '#111' }],
  'SANDY-4': [{ t: 'Validair?', c: '#1f4fbf' }],
  'MANC-0': [{ t: 'Northern 8', c: '#111' }, { t: 'SL-09', c: '#111' }],
  'MANC-2': [{ t: 'ring Owen', c: '#d0312d', r: 3 }],
  'NCL-0': [{ t: 'Genie', c: '#111' }, { t: 'snag gang', c: '#1f4fbf' }],
  'NCL-3': [{ t: 'Genie still there?', c: '#d0312d', r: -3 }],
  'CHERRY-0': [{ t: 'Summit 6', c: '#111' }, { t: 'Boom', c: '#111' }],
  'CHERRY-3': [{ t: 'Telehandler', c: '#1f4fbf' }, { t: 'wind!!', c: '#d0312d', r: 5 }],
}

export function Whiteboard() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-[#e9ebe8] p-3 shadow-[var(--shadow)] ring-1 ring-black/10">
      <div className="relative overflow-x-auto rounded-[14px] bg-[#fbfcfa] p-4 text-[#111]">
        <div className="pointer-events-none absolute left-[30%] top-[38%] h-16 w-40 rounded-full bg-[#9aa3a8]/15 blur-xl" />
        <div className="pointer-events-none absolute right-[12%] top-[12%] h-10 w-28 rounded-full bg-[#4a6fd1]/10 blur-lg" />
        <div className="marker mb-2 -rotate-1 text-[20px] text-[#1f4fbf]">CREWS + PLANT wk 42</div>
        <div className="min-w-[440px]">
          <div className="grid grid-cols-[72px_repeat(5,1fr)]">
            <span />
            {DAYS.map((d) => (
              <span key={d} className="marker border-b-2 border-[#111]/70 pb-1 text-center text-[14px]">
                {d}
              </span>
            ))}
          </div>
          {SITES.map((s, si) => (
            <div key={s} className="grid min-h-[52px] grid-cols-[72px_repeat(5,1fr)] border-b border-[#111]/25" style={{ transform: `rotate(${(si % 2 ? 0.2 : -0.2)}deg)` }}>
              <span className="marker self-center text-[14px]">{s}</span>
              {DAYS.map((_, di) => (
                <span key={di} className="flex flex-col items-start gap-0.5 border-l border-[#111]/25 px-1.5 py-1">
                  {(BOARD[`${s}-${di}`] ?? []).map((e, k) => (
                    <span key={k} className={cx('marker relative text-[13px] leading-tight', e.x && 'whitespace-nowrap opacity-80')} style={{ color: e.c, transform: `rotate(${e.r ?? (k % 2 ? 1 : -1)}deg)` }}>
                      {e.t}
                      {e.x && <span className="absolute left-[-2px] right-[-2px] top-1/2 h-[2px] -rotate-6 bg-[#d0312d]" />}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[#555]">
        <span>Office whiteboard, Georges Dock. Photo sent to the group Monday.</span>
        <span className="flex gap-1.5">
          {['#111', '#1f4fbf', '#d0312d'].map((c) => (
            <span key={c} className="h-2 w-6 rounded-full" style={{ background: c }} />
          ))}
        </span>
      </div>
    </div>
  )
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const ROWS = [
  ['Project', 'Contract', 'Budget', 'Cost to date', 'Forecast', 'Margin', 'Comments'],
  ['Grand Canal Dock', '3,800,000', '3,420,000', '1,884,200', '3,360,000', '11.6%', 'ok'],
  ['IFSC', '2,100,000', '1,890,000', '921,400', '1,880,000', '10.1%', 'ceilings?'],
  ['Sandyford', '1,600,000', '1,400,000', '771,000', '1,392,000', '12.8%', ''],
  ['Spinningfields (GBP)', '2,900,000', '2,640,000', '1,402,000', '2,610,000', '9.1%', 'check vars w Owen'],
  ['Quayside (GBP)', '1,200,000', '1,080,000', '902,500', '1,076,000', '10.6%', ''],
  ['Cherrywood', '1,400,000', '1,250,000', '402,000', '#REF!', '#REF!', 'update'],
  ['', '', '', '', '', '', ''],
  ['TOTAL', '13,000,000', '', '', '', '10.8%', 'GBP not converted'],
]

export function Spreadsheet() {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#f3f4f2] text-[#1d1f22] shadow-[var(--shadow)] ring-1 ring-black/10">
      <div className="flex items-center gap-2 border-b border-black/10 bg-[#1f7a46] px-4 py-2.5 text-white">
        <FileSpreadsheet size={16} />
        <span className="truncate text-[13px] font-semibold">Cost Report WK41 v3 FINAL (2).xlsx</span>
        <span className="ml-auto text-[11px] opacity-80">Read only</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="w-8 border border-black/10 bg-[#e6e7e4]" />
              {COLS.map((c) => (
                <th key={c} className="border border-black/10 bg-[#e6e7e4] py-1 font-medium text-[#555]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i}>
                <td className="border border-black/10 bg-[#e6e7e4] text-center text-[#555]">{i + 1}</td>
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={cx(
                      'tnum h-7 whitespace-nowrap border border-black/10 bg-white px-2',
                      i === 0 && 'bg-[#f0f0ee] font-semibold',
                      i === 8 && 'font-semibold',
                      j > 0 && j < 6 && 'text-right',
                      c === '#REF!' && 'text-[#c0392b]',
                      i === 4 && j === 5 && 'bg-[#fff6c2]',
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 rotate-[-8deg] rounded-[10px] border-[3px] border-[#d0312d] px-4 py-2 text-center text-[#d0312d] opacity-90">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]">Last updated</div>
        <div className="text-[18px] font-extrabold uppercase tracking-wide">Thursday last week</div>
      </div>
    </div>
  )
}

export function ThenView() {
  const { ui, actions } = useStore()
  const v = ui.view
  const heading = (
    <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
      <div>
        <Badge tone="warn">Then</Badge>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight">How you see the jobs today</h1>
        <p className="mt-1 max-w-[560px] text-[15px] text-fg2">Site records on WhatsApp. Crews and plant on a whiteboard. A cost report that was out of date when it was sent.</p>
      </div>
      <Button variant="primary" onClick={() => actions.setMode('now')}>
        Show it live
      </Button>
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, filter: 'saturate(0)' }} animate={{ opacity: 1, filter: 'saturate(0.85)' }} className="space-y-5">
      {heading}
      {v === 'site' ? (
        <WhatsApp tall />
      ) : v === 'board' ? (
        <Whiteboard />
      ) : v === 'cost' || v === 'commercial' ? (
        <Spreadsheet />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <WhatsApp />
          <Whiteboard />
          <div className="lg:col-span-2">
            <Spreadsheet />
          </div>
        </div>
      )}
    </motion.div>
  )
}
