import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Trophy, Zap, Check } from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import { CATEGORY_COLORS } from '../../lib/carbon'
import { formatNumDecimal } from '../../lib/formatters'
import { GlassCard } from '../../components/ui/GlassCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { CategoryIcon } from '../../components/ui/CategoryIcon'

export function QuestBoardPage() {
  const quests = useVerdantStore(s => s.quests)
  const completeQuest = useVerdantStore(s => s.completeQuest)
  const updateQuestProgress = useVerdantStore(s => s.updateQuestProgress)
  const [celebrating, setCelebrating] = useState<string | null>(null)

  const activeQuests = quests.filter(q => !q.completed)
  const completedQuests = quests.filter(q => q.completed)
  const totalSavedKg = completedQuests.reduce((s, q) => s + q.co2SavingKg, 0)

  const handleMarkProgress = (id: string, current: number) => {
    const next = Math.min(current + 25, 100)
    updateQuestProgress(id, next)
    if (next >= 100) {
      handleComplete(id)
    }
  }

  const handleComplete = (id: string) => {
    setCelebrating(id)
    setTimeout(() => {
      completeQuest(id)
      setCelebrating(null)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">QuestBoard</h1>
        <p className="text-sm text-[rgba(245,240,232,0.5)]">
          Weekly challenges to slash your footprint
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#2ECC7A]">{activeQuests.length}</p>
          <p className="text-xs text-[rgba(245,240,232,0.5)] mt-0.5">Active</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#FFD166]">{completedQuests.length}</p>
          <p className="text-xs text-[rgba(245,240,232,0.5)] mt-0.5">Completed</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#A8F5B0]">{formatNumDecimal(totalSavedKg)}</p>
          <p className="text-xs text-[rgba(245,240,232,0.5)] mt-0.5">kg CO₂ saved</p>
        </GlassCard>
      </div>

      {/* Active quests */}
      <div>
        <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-3">
          This week's quests
        </p>
        <div className="space-y-3">
          {activeQuests.map(quest => (
            <m.div
              key={quest.id}
              layout
              className={`glass-card p-5 relative overflow-hidden ${celebrating === quest.id ? 'border-[#FFD166]' : ''}`}
            >
              {/* Celebration overlay */}
              <AnimatePresence>
                {celebrating === quest.id && (
                  <m.div
                    className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
                    style={{ background: 'rgba(255,209,102,0.15)', backdropFilter: 'blur(4px)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <m.p
                      className="text-4xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <CategoryIcon name="Award" size={48} className="text-[#FFD166]" />
                    </m.p>
                  </m.div>
                )}
              </AnimatePresence>

              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[quest.category]}20` }}
                >
                  <CategoryIcon name={quest.icon} size={20} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-[#F5F0E8] text-sm leading-tight">{quest.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Zap size={12} className="text-[#FFD166]" />
                      <span className="text-xs text-[#FFD166] font-semibold">{quest.xpReward} XP</span>
                    </div>
                  </div>
                  <p className="text-xs text-[rgba(245,240,232,0.55)] mb-3">{quest.description}</p>
                  <ProgressBar value={quest.progress} color={CATEGORY_COLORS[quest.category]} height={5} />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[rgba(245,240,232,0.4)]">
                      saves {formatNumDecimal(quest.co2SavingKg)} kg CO₂
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkProgress(quest.id, quest.progress)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                        style={{
                          background: 'rgba(46,204,122,0.12)',
                          border: '1px solid rgba(46,204,122,0.25)',
                          color: '#2ECC7A',
                        }}
                      >
                        +25%
                      </button>
                      <button
                        onClick={() => handleComplete(quest.id)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                        style={{
                          background: 'rgba(255,209,102,0.12)',
                          border: '1px solid rgba(255,209,102,0.3)',
                          color: '#FFD166',
                        }}
                      >
                        Done!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          ))}

          {activeQuests.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Trophy className="mx-auto mb-3 text-[#FFD166]" size={32} />
              <p className="text-[#F5F0E8] font-semibold">All quests done! 🎉</p>
              <p className="text-sm text-[rgba(245,240,232,0.5)] mt-1">
                You're a true EarthGuardian. New quests next week!
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Completed quests */}
      {completedQuests.length > 0 && (
        <div>
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-3">
            Completed
          </p>
          <div className="space-y-2">
            {completedQuests.map(quest => (
              <m.div
                key={quest.id}
                layout
                className="glass-card p-4 flex items-center gap-3 opacity-60"
              >
                <CategoryIcon name={quest.icon} size={16} strokeWidth={1.75} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F5F0E8] line-through">{quest.title}</p>
                  <p className="text-xs text-[#2ECC7A]">+{quest.xpReward} XP · saved {quest.co2SavingKg} kg CO₂</p>
                </div>
                <Check size={16} className="text-[#2ECC7A] flex-shrink-0" />
              </m.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
