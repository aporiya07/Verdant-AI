import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Sidebar } from './Sidebar'
import { PageTransition } from './PageTransition'
import { SageBubble } from '../sage/SageBubble'

export function AppShell() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh bg-[#0D1F17]">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <div className="min-h-dvh p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </PageTransition>
        </AnimatePresence>
      </main>
      <SageBubble />
    </div>
  )
}
