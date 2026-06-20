import { m } from 'motion/react'
import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { formatNumDecimal } from '../../lib/formatters'
import { INDIA_BENCHMARKS } from '../../lib/carbon'
import { getLevelInfo } from '../../lib/store'
import { LevelIcon, CategoryIcon } from '../../components/ui/CategoryIcon'

const MOCK_USERS = [
  { id: '1', name: 'Priya Sharma', city: 'Bengaluru', monthlyKg: 82.4, xp: 2200, avatar: 'Leaf' },
  { id: '2', name: 'Arjun Menon', city: 'Kochi', monthlyKg: 91.1, xp: 1850, avatar: 'Sprout' },
  { id: '3', name: 'Kavya Nair', city: 'Chennai', monthlyKg: 105.7, xp: 1640, avatar: 'TreePine' },
  { id: '4', name: 'Rohan Gupta', city: 'Delhi', monthlyKg: 118.3, xp: 1420, avatar: 'TreePine' },
  { id: '5', name: 'Ananya Iyer', city: 'Mumbai', monthlyKg: 124.9, xp: 1380, avatar: 'Leaf' },
  { id: '6', name: 'Vikram Reddy', city: 'Hyderabad', monthlyKg: 138.2, xp: 1105, avatar: 'Sprout' },
  { id: '7', name: 'Sneha Joshi', city: 'Pune', monthlyKg: 142.6, xp: 990, avatar: 'TreePine' },
  { id: '8', name: 'Dev Agarwal', city: 'Ahmedabad', monthlyKg: 151.3, xp: 780, avatar: 'TreePine' },
]

const CITIES = ['All India', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune']

export function TheGrovePage() {
  const [filter, setFilter] = useState('All India')

  const filtered = MOCK_USERS
    .filter(u => filter === 'All India' || u.city === filter)
    .sort((a, b) => a.monthlyKg - b.monthlyKg)

  const indiaAvg = INDIA_BENCHMARKS.avgMonthlyKg
  const globalAvg = INDIA_BENCHMARKS.globalAvgMonthlyKg

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">The Grove</h1>
        <p className="text-sm text-[rgba(245,240,232,0.5)]">Your community of planet protectors</p>
      </div>

      {/* India vs World */}
      <GlassCard strong className="p-5">
        <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
          <CategoryIcon name="Globe" size={12} className="inline mr-1" />India vs World
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#2ECC7A]">{indiaAvg}</p>
            <p className="text-sm text-[rgba(245,240,232,0.6)]">kg CO₂/month</p>
            <p className="text-xs text-[rgba(245,240,232,0.4)] mt-1">🇮🇳 India average</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#E8472A]">{globalAvg}</p>
            <p className="text-sm text-[rgba(245,240,232,0.6)]">kg CO₂/month</p>
            <p className="text-xs text-[rgba(245,240,232,0.4)] mt-1">🌍 Global average</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(46,204,122,0.08)', border: '1px solid rgba(46,204,122,0.15)' }}>
          <p className="text-xs text-center text-[rgba(245,240,232,0.7)]">
            India's per-capita footprint is <span className="text-[#2ECC7A] font-semibold">2.5×</span> lower than the global average.
            The Paris Agreement target is <span className="text-[#FFD166] font-semibold">167 kg/month</span>.
          </p>
        </div>
      </GlassCard>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {CITIES.map(city => (
          <button
            key={city}
            onClick={() => setFilter(city)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === city ? 'rgba(46,204,122,0.15)' : 'rgba(26,58,42,0.5)',
              border: `1px solid ${filter === city ? 'rgba(46,204,122,0.4)' : 'transparent'}`,
              color: filter === city ? '#2ECC7A' : 'rgba(245,240,232,0.5)',
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium px-1">
          Top users this week — lowest footprint
        </p>
        {filtered.map((user, idx) => {
          const { icon: levelIcon } = getLevelInfo(user.xp)
          const isTop3 = idx < 3
          const medalColors = ['#FFD166', '#A8F5B0', '#E8472A']
          return (
            <m.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-card p-4 flex items-center gap-3"
              style={isTop3 ? { border: `1px solid ${medalColors[idx]}33` } : {}}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: isTop3 ? `${medalColors[idx]}22` : 'rgba(26,58,42,0.5)',
                  color: isTop3 ? medalColors[idx] : 'rgba(245,240,232,0.4)',
                }}
              >
                {isTop3 ? ['🏆', '🥈', '🥉'][idx] : idx + 1}
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(46,204,122,0.1)' }}
              >
                <LevelIcon name={user.avatar} size={16} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F5F0E8] truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[rgba(245,240,232,0.4)]">{user.city}</span>
                  <LevelIcon name={levelIcon} size={12} strokeWidth={1.75} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#2ECC7A]">{formatNumDecimal(user.monthlyKg)} kg</p>
                <p className="text-xs text-[rgba(245,240,232,0.4)]">this month</p>
              </div>
              <button
                className="ml-2 p-2 rounded-lg text-[rgba(245,240,232,0.3)] hover:text-[#A8F5B0] transition-colors"
                aria-label="Challenge friend"
              >
                <Share2 size={14} />
              </button>
            </m.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-[rgba(245,240,232,0.5)]">No users found in {filter} yet.</p>
        </GlassCard>
      )}
    </div>
  )
}
