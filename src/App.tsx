import { AnimatePresence, motion } from 'framer-motion'
import { CommandK } from './shell/CommandK'
import { LiveDrawer, LivePanel } from './shell/LivePanel'
import { ProfilePicker } from './shell/ProfilePicker'
import { Settings } from './shell/Settings'
import { BottomBar, Sidebar } from './shell/Sidebar'
import { Toasts } from './shell/Toasts'
import { TopBar } from './shell/TopBar'
import { Walkthrough } from './shell/Walkthrough'
import { Loader } from './ui/Loader'
import { StoreProvider, useStore } from './store'
import { Approvals } from './views/Approvals'
import { Board } from './views/Board'
import { Commercial } from './views/Commercial'
import { Cost } from './views/Cost'
import { Home } from './views/Home'
import { Impact } from './views/Impact'
import { Phone } from './views/Phone'
import { Reports } from './views/Reports'
import { Safety } from './views/Safety'
import { Site } from './views/Site'
import { ThenView } from './views/then/Then'

function Main() {
  const { ui } = useStore()
  const view = (() => {
    if (ui.mode === 'then' && ui.view !== 'phone') return <ThenView />
    switch (ui.view) {
      case 'home':
        return <Home />
      case 'site':
        return <Site />
      case 'board':
        return <Board />
      case 'cost':
        return <Cost />
      case 'safety':
        return <Safety />
      case 'reports':
        return <Reports />
      case 'impact':
        return <Impact />
      case 'approvals':
        return <Approvals />
      case 'commercial':
        return <Commercial />
      case 'phone':
        return <Phone />
    }
  })()
  const key = `${ui.profile}|${ui.mode}|${ui.view}|${ui.view === 'site' ? ui.siteId : ''}|${ui.navKey > 0 && ui.view !== 'site' ? ui.navKey : ''}`
  return (
    <main className="glass relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px]">
      <TopBar />
      <div data-main-scroll className="scroll flex-1 px-4 pb-28 pt-1 sm:px-6 md:pb-10">
        <Loader k={key}>{view}</Loader>
      </div>
    </main>
  )
}

function Shell() {
  return (
    <div className="relative z-10 flex h-full gap-2 p-2">
      <Sidebar />
      <Main />
      <LivePanel />
      <BottomBar />
      <LiveDrawer />
    </div>
  )
}

function Root() {
  const { ui } = useStore()
  return (
    <>
      <div className="fields" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={ui.profile ? 'app' : 'picker'}
          className="h-full"
          initial={{ opacity: 0, scale: ui.profile ? 1.02 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: ui.profile ? 0.98 : 1.02 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {ui.profile ? <Shell /> : <ProfilePicker />}
        </motion.div>
      </AnimatePresence>
      <Toasts />
      {ui.profile && <CommandK />}
      <Settings />
      <Walkthrough />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  )
}
