import { m } from 'motion/react'
import { useVerdantStore, getLevelInfo } from '../../lib/store'
import { GlassCard } from '../../components/ui/GlassCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatNum } from '../../lib/formatters'
import { CategoryIcon, LevelIcon } from '../../components/ui/CategoryIcon'

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 4000]

const BADGES_DATA = [
  { id: 'metro-warrior', icon: 'Train', label: 'Metro Warrior', desc: 'Logged metro 5 times' },
  { id: 'veg-week', icon: 'Salad', label: 'Zero-Veg Week', desc: 'Chose veg all week' },
  { id: 'no-ac', icon: 'Snowflake', label: 'No-AC Day', desc: 'Saved AC electricity' },
  { id: 'cycle-champ', icon: 'Bike', label: 'Cycle Champion', desc: 'Cycled 3 days in a week' },
  { id: 'streak-7', icon: 'Flame', label: '7-Day Streak', desc: 'Logged 7 days in a row' },
  { id: 'first-log', icon: 'Sprout', label: 'First Step', desc: 'Logged first activity' },
]

export function GreenStreakPage() {
  const user = useVerdantStore(s => s.user)
  const badges = useVerdantStore(s => s.badges)
  const logs = useVerdantStore(s => s.logs)

  const { title, nextThreshold } = getLevelInfo(user.xp)
  const level = getLevelInfo(user.xp).level
  const currentThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0
  const xpInLevel = user.xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const levelProgress = Math.min((xpInLevel / xpNeeded) * 100, 100)

  // Generate streak calendar for past 30 days
  const logDates = new Set(logs.map(l => l.date))
  const streakDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().split('T')[0]
    return { key, logged: logDates.has(key), day: d.getDate() }
  })

  const earnedBadgeIds = new Set(badges.map(b => b.id))
  // Unlock first-log if any logs exist
  if (logs.length > 0) earnedBadgeIds.add('first-log')
  if (user.streak >= 7) earnedBadgeIds.add('streak-7')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">GreenStreak</h1>
        <p className="text-sm text-[rgba(245,240,232,0.5)]">Your journey to becoming an EarthGuardian</p>
      </div>

      {/* Level card */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard strong className="p-6 text-center">
          <LevelIcon name={title} size={64} className="mb-3" />
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-1">{title}</h2>
          <p className="text-[rgba(245,240,232,0.5)] text-sm mb-4">Level {level}</p>

          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-[rgba(245,240,232,0.5)] mb-2">
              <span>{formatNum(user.xp)} XP</span>
              <span>Next: {formatNum(nextThreshold)} XP</span>
            </div>
            <ProgressBar
              value={levelProgress}
              color="#FFD166"
              height={8}
            />
          </div>
        </GlassCard>
      </m.div>

      {/* Streak counter */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <GlassCard className="p-5 text-center">
          <m.p
            className="text-4xl font-bold text-[#FFD166]"
            key={user.streak}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {user.streak}
          </m.p>
          <p className="text-sm text-[rgba(245,240,232,0.6)] mt-1"><CategoryIcon name="Leaf" size={12} className="inline mr-1" />Day streak</p>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <p className="text-4xl font-bold text-[#A8F5B0]">{formatNum(user.xp)}</p>
          <p className="text-sm text-[rgba(245,240,232,0.6)] mt-1"><CategoryIcon name="Zap" size={12} className="inline mr-1" />Total XP</p>
        </GlassCard>
      </m.div>

      {/* 30-day streak calendar */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            30-day activity calendar
          </p>
          <div className="grid grid-cols-10 gap-1.5">
            {streakDays.map((d) => (
              <m.div
                key={d.key}
                className="aspect-square rounded-md flex items-center justify-center text-xs font-medium"
                style={{
                  background: d.logged ? 'rgba(46,204,122,0.35)' : 'rgba(26,58,42,0.5)',
                  border: `1px solid ${d.logged ? 'rgba(46,204,122,0.5)' : 'rgba(46,204,122,0.1)'}`,
                  color: d.logged ? '#2ECC7A' : 'rgba(245,240,232,0.25)',
                }}
                whileHover={{ scale: 1.15 }}
                title={d.key}
              >
                {d.day}
              </m.div>
            ))}
          </div>
          <p className="text-xs text-[rgba(245,240,232,0.4)] mt-3 text-center">
            {logDates.size} days logged this month
          </p>
        </GlassCard>
      </m.div>

      {/* Level roadmap */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            Level Roadmap
          </p>
          <div className="space-y-3">
            {[
              { level: 1, title: 'Seedling', icon: 'Sprout', threshold: 0 },
              { level: 2, title: 'Sprout', icon: 'Leaf', threshold: 100 },
              { level: 3, title: 'Sapling', icon: 'TreePine', threshold: 300 },
              { level: 4, title: 'Bamboo', icon: 'TreePine', threshold: 600 },
              { level: 5, title: 'Oak', icon: 'TreePine', threshold: 1000 },
              { level: 6, title: 'Banyan', icon: 'Palmtree', threshold: 2000 },
              { level: 7, title: 'EarthGuardian', icon: 'Globe', threshold: 4000 },
            ].map(l => {
              const unlocked = user.xp >= l.threshold
              const isCurrent = level === l.level
              return (
                <div
                  key={l.level}
                  className="flex items-center gap-3"
                  style={{ opacity: unlocked ? 1 : 0.4 }}
                >
                  <LevelIcon name={l.icon} size={20} className="w-8 text-center" />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: isCurrent ? '#2ECC7A' : '#F5F0E8' }}>
                      {l.title} {isCurrent && '← You are here'}
                    </p>
                    <p className="text-xs text-[rgba(245,240,232,0.4)]">{formatNum(l.threshold)} XP</p>
                  </div>
                  {unlocked && <span className="text-[#2ECC7A]">✓</span>}
                </div>
              )
            })}
          </div>
        </GlassCard>
      </m.div>

      {/* Badges */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            Badges
          </p>
          <div className="grid grid-cols-3 gap-3">
            {BADGES_DATA.map(badge => {
              const earned = earnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
                  style={{
                    background: earned ? 'rgba(46,204,122,0.1)' : 'rgba(26,58,42,0.4)',
                    border: `1px solid ${earned ? 'rgba(46,204,122,0.3)' : 'rgba(46,204,122,0.05)'}`,
                    opacity: earned ? 1 : 0.4,
                  }}
                >
                  <CategoryIcon name={badge.icon} size={24} strokeWidth={1.75} />
                  <p className="text-xs font-semibold text-[#F5F0E8] leading-tight">{badge.label}</p>
                  <p className="text-xs text-[rgba(245,240,232,0.4)] leading-tight">{badge.desc}</p>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </m.div>
    </div>
  )
}
