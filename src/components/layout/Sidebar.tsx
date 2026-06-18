import { NavLink, useLocation } from 'react-router-dom'
import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import {
  LayoutDashboard, Leaf, Target, Flame, Users, ShoppingBag, FileText, Menu, X, Sprout,
} from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import { LevelBadge } from '../ui/Badge'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'EarthPulse', emoji: '🌍' },
  { to: '/tracelog', icon: Leaf, label: 'TraceLog', emoji: '📊' },
  { to: '/quests', icon: Target, label: 'QuestBoard', emoji: '⚡' },
  { to: '/streak', icon: Flame, label: 'GreenStreak', emoji: '🌱' },
  { to: '/grove', icon: Users, label: 'The Grove', emoji: '🌳' },
  { to: '/market', icon: ShoppingBag, label: 'NeutralMarket', emoji: '🛒' },
  { to: '/report', icon: FileText, label: 'EarthReport', emoji: '📄' },
]

export function Sidebar() {
  const location = useLocation()
  const user = useVerdantStore(s => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden glass-pill p-2 text-[#A8F5B0]"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(13,31,23,0.8)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <m.aside
        className="fixed left-0 top-0 h-full z-50 w-64 flex flex-col"
        style={{
          background: 'rgba(13,31,23,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(46,204,122,0.12)',
        }}
        initial={false}
        animate={{
          x: mobileOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 768 ? -256 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Brand */}
        <div className="p-6 border-b border-[rgba(46,204,122,0.1)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(46,204,122,0.15)', border: '1px solid rgba(46,204,122,0.3)' }}
            >
              <Sprout size={18} color="#2ECC7A" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E8] text-base leading-tight">Verdant AI</p>
              <p className="text-xs text-[rgba(168,245,176,0.6)]">Know your Earth</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-[rgba(46,204,122,0.08)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(46,204,122,0.18)', border: '1px solid rgba(46,204,122,0.25)', color: '#2ECC7A' }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : <Leaf size={16} strokeWidth={1.75} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F5F0E8] truncate">
                {user.name || 'Friend'}
              </p>
              <LevelBadge xp={user.xp} size="sm" />
            </div>
          </div>
          {user.streak > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#FFD166]">
              <span>🍃</span>
              <span>{user.streak} day streak</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.to
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative"
                    style={{
                      color: isActive ? '#2ECC7A' : 'rgba(245,240,232,0.65)',
                      background: isActive ? 'rgba(46,204,122,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(46,204,122,0.2)' : '1px solid transparent',
                    }}
                  >
                    {isActive && (
                      <m.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#2ECC7A]"
                        layoutId="nav-indicator"
                      />
                    )}
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(46,204,122,0.08)]">
          <p className="text-xs text-[rgba(168,245,176,0.4)] text-center">
            Verdant AI · Virtual PromptWars 2026
          </p>
        </div>
      </m.aside>
    </>
  )
}
