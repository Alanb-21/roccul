import { Moon, Radio, Search, Sun } from 'lucide-react'
import { useStore } from '../store'
import { Segmented } from '../ui'
import { ProfileMenu } from './Sidebar'

export function TopBar() {
  const { ui, actions } = useStore()
  const isPhone = ui.view === 'phone'
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-2 px-3 sm:gap-3 sm:px-5">
      <div className="md:hidden">
        <ProfileMenu compact />
      </div>
      <button
        onClick={() => actions.patchUI({ cmdOpen: true })}
        className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center gap-2.5 rounded-full bg-fill hair transition hover:bg-fill2 hover:text-fg2 sm:w-auto sm:min-w-0 sm:flex-1 sm:justify-start sm:px-4 text-left text-[14px] text-fg3 sm:max-w-[420px]"
      >
        <Search size={17} className="shrink-0" />
        <span className="hidden truncate sm:inline">Search sites, people, diary</span>
        <kbd className="ml-auto hidden shrink-0 rounded-md bg-fill2 px-1.5 py-0.5 text-[11px] font-semibold text-fg2 lg:inline">⌘K</kbd>
      </button>
      <div className="flex-1" />
      {!isPhone && (
        <Segmented
          value={ui.mode}
          onChange={(m) => actions.setMode(m)}
          options={[
            { value: 'then', label: 'Then' },
            { value: 'now', label: 'Now' },
          ]}
        />
      )}
      <button
        onClick={actions.toggleTheme}
        aria-label="Toggle light and dark"
        className="focus-ring hidden h-10 w-10 shrink-0 place-items-center rounded-full text-fg2 transition hover:bg-fill hover:text-fg sm:grid"
      >
        {ui.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button
        onClick={() => actions.patchUI({ liveOpen: true })}
        className="focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full bg-fill px-3.5 text-[13px] font-semibold text-fg hair transition hover:bg-fill2 xl:hidden"
      >
        <Radio size={16} className="text-ok" />
        <span className="max-sm:hidden">Live</span>
      </button>
    </header>
  )
}
