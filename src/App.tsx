import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useVerdantStore } from './lib/store'
import { AppShell } from './components/layout/AppShell'
import { OnboardingPage } from './pages/Onboarding'
import { DashboardPage } from './pages/Dashboard'
import { TraceLogPage } from './pages/TraceLog'
import { QuestBoardPage } from './pages/QuestBoard'
import { GreenStreakPage } from './pages/GreenStreak'
import { TheGrovePage } from './pages/TheGrove'
import { NeutralMarketPage } from './pages/NeutralMarket'
import { EarthReportPage } from './pages/EarthReport'

export default function App() {
  const onboardingComplete = useVerdantStore(s => s.user.onboardingComplete)

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {!onboardingComplete ? (
          <OnboardingPage key="onboarding" />
        ) : (
          <Routes key="app">
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tracelog" element={<TraceLogPage />} />
              <Route path="quests" element={<QuestBoardPage />} />
              <Route path="streak" element={<GreenStreakPage />} />
              <Route path="grove" element={<TheGrovePage />} />
              <Route path="market" element={<NeutralMarketPage />} />
              <Route path="report" element={<EarthReportPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
