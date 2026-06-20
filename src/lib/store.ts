import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayISO, currentMonthKey } from './formatters'
import { INDIA_BENCHMARKS } from './carbon'

export type DietType = 'vegan' | 'vegetarian' | 'eggetarian' | 'non-vegetarian'
export type ActivityCategory = 'transport' | 'food' | 'energy' | 'shopping' | 'travel' | 'waste'

export interface UserProfile {
  id: string
  name: string
  city: string
  avatar: string
  level: number
  xp: number
  streak: number
  lastLogDate: string
  monthlyGoalKg: number
  diet: DietType
  commuteMode: string[]
  onboardingComplete: boolean
}

export interface ActivityLog {
  id: string
  date: string               // ISO YYYY-MM-DD
  category: ActivityCategory
  activity: string
  co2Kg: number
  notes?: string
  unit?: string
  quantity?: number
}

export interface Quest {
  id: string
  title: string
  description: string
  co2SavingKg: number
  xpReward: number
  deadline: string           // ISO date
  progress: number           // 0-100
  completed: boolean
  category: ActivityCategory
  icon: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Report {
  id: string
  monthKey: string           // YYYY-MM
  totalCO2Kg: number
  byCategory: Record<ActivityCategory, number>
  geminiSummary: string
  generatedAt: string
}

export interface Badge {
  id: string
  label: string
  icon: string
  earnedAt: string
}

export interface VerdantStore {
  user: UserProfile
  logs: ActivityLog[]
  quests: Quest[]
  chatHistory: Message[]
  monthlyReports: Report[]
  badges: Badge[]
  clarityFeedCache: { insights: string[]; logCount: number } | null
  weeklyQuestGeneratedAt: string | null

  // Actions
  setUser: (u: Partial<UserProfile>) => void
  completeOnboarding: (profile: Partial<UserProfile>) => void
  addLog: (l: Omit<ActivityLog, 'id'>) => void
  updateLog: (id: string, l: Partial<ActivityLog>) => void
  deleteLog: (id: string) => void
  addMessage: (m: Omit<Message, 'id'>) => void
  clearChat: () => void
  updateQuestProgress: (id: string, progress: number) => void
  completeQuest: (id: string) => void
  addXP: (amount: number) => void
  addBadge: (badge: Omit<Badge, 'earnedAt'>) => void
  saveReport: (r: Report) => void
  setClarityFeedCache: (insights: string[], logCount: number) => void
  setWeeklyQuestGeneratedAt: (dt: string) => void
  initDefaultQuests: () => void
}

const DEFAULT_USER: UserProfile = {
  id: crypto.randomUUID(),
  name: '',
  city: 'Bengaluru',
  avatar: 'Leaf',
  level: 1,
  xp: 0,
  streak: 0,
  lastLogDate: '',
  monthlyGoalKg: INDIA_BENCHMARKS.avgMonthlyKg,
  diet: 'vegetarian',
  commuteMode: ['metro'],
  onboardingComplete: false,
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Metro Over Cab',
    description: 'Take the metro instead of cab 3 times this week',
    co2SavingKg: 2.1,
    xpReward: 50,
    deadline: getNextSunday(),
    progress: 0,
    completed: false,
    category: 'transport',
    icon: 'Train',
  },
  {
    id: 'q2',
    title: 'Cook at Home',
    description: 'Cook at home instead of ordering in for 4 days',
    co2SavingKg: 1.8,
    xpReward: 40,
    deadline: getNextSunday(),
    progress: 0,
    completed: false,
    category: 'food',
    icon: 'CookingPot',
  },
  {
    id: 'q3',
    title: 'AC Power Saver',
    description: 'Switch off AC 1 hour early for 5 days',
    co2SavingKg: 1.2,
    xpReward: 30,
    deadline: getNextSunday(),
    progress: 0,
    completed: false,
    category: 'energy',
    icon: 'Snowflake',
  },
  {
    id: 'q4',
    title: 'Go Veg This Week',
    description: 'Choose veg thali over non-veg 3 times',
    co2SavingKg: 4.2,
    xpReward: 60,
    deadline: getNextSunday(),
    progress: 0,
    completed: false,
    category: 'food',
    icon: 'Salad',
  },
  {
    id: 'q5',
    title: 'Office Carpool',
    description: 'Carpool to office 3 days this week',
    co2SavingKg: 3.1,
    xpReward: 55,
    deadline: getNextSunday(),
    progress: 0,
    completed: false,
    category: 'transport',
    icon: 'Car',
  },
]

function getNextSunday(): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilSunday = day === 0 ? 7 : 7 - day
  d.setDate(d.getDate() + daysUntilSunday)
  return d.toISOString().split('T')[0]
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 4000]

export function getLevelInfo(xp: number): { level: number; title: string; icon: string; nextThreshold: number } {
  const titles = [
    { title: 'Seedling', icon: 'Sprout' },
    { title: 'Sprout', icon: 'Leaf' },
    { title: 'Sapling', icon: 'TreePine' },
    { title: 'Bamboo', icon: 'TreePine' },
    { title: 'Oak', icon: 'TreePine' },
    { title: 'Banyan', icon: 'Palmtree' },
    { title: 'EarthGuardian', icon: 'Globe' },
  ]
  let level = 0
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  level = Math.min(level, 7)
  const info = titles[Math.min(level - 1, titles.length - 1)]
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return { level, ...info, nextThreshold }
}

export function getMonthlyLogs(logs: ActivityLog[], monthKey?: string): ActivityLog[] {
  const mk = monthKey ?? currentMonthKey()
  return logs.filter(l => l.date.startsWith(mk))
}

export function getMonthlyTotal(logs: ActivityLog[], monthKey?: string): number {
  return getMonthlyLogs(logs, monthKey).reduce((acc, l) => acc + l.co2Kg, 0)
}

export function getCategoryTotals(logs: ActivityLog[]): Record<string, number> {
  return logs.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + l.co2Kg
    return acc
  }, {} as Record<string, number>)
}

export const useVerdantStore = create<VerdantStore>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      logs: [],
      quests: DEFAULT_QUESTS,
      chatHistory: [],
      monthlyReports: [],
      badges: [],
      clarityFeedCache: null,
      weeklyQuestGeneratedAt: null,

      setUser: (u) => set(s => ({ user: { ...s.user, ...u } })),

      completeOnboarding: (profile) => set(s => ({
        user: {
          ...s.user,
          ...profile,
          onboardingComplete: true,
          id: s.user.id || crypto.randomUUID(),
        },
      })),

      addLog: (l) => {
        const today = todayISO()
        set(s => {
          const newLog: ActivityLog = { ...l, id: crypto.randomUUID() }
          const newLogs = [...s.logs, newLog]
          // Streak logic
          let streak = s.user.streak
          const last = s.user.lastLogDate
          if (last !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yStr = yesterday.toISOString().split('T')[0]
            if (last === yStr) {
              streak = streak + 1
            } else if (last !== today) {
              streak = 1
            }
          }
          return {
            logs: newLogs,
            user: { ...s.user, streak, lastLogDate: today },
          }
        })
        get().addXP(10)
      },

      updateLog: (id, l) => set(s => ({
        logs: s.logs.map(log => log.id === id ? { ...log, ...l } : log),
      })),

      deleteLog: (id) => set(s => ({
        logs: s.logs.filter(log => log.id !== id),
      })),

      addMessage: (m) => set(s => ({
        chatHistory: [...s.chatHistory, { ...m, id: crypto.randomUUID() }].slice(-100),
      })),

      clearChat: () => set({ chatHistory: [] }),

      updateQuestProgress: (id, progress) => set(s => ({
        quests: s.quests.map(q => q.id === id ? { ...q, progress: Math.min(100, progress) } : q),
      })),

      completeQuest: (id) => {
        const quest = get().quests.find(q => q.id === id)
        if (!quest || quest.completed) return
        set(s => ({
          quests: s.quests.map(q => q.id === id ? { ...q, completed: true, progress: 100 } : q),
        }))
        get().addXP(quest.xpReward)
      },

      addXP: (amount) => set(s => {
        const newXP = s.user.xp + amount
        const { level } = getLevelInfo(newXP)
        return { user: { ...s.user, xp: newXP, level } }
      }),

      addBadge: (badge) => set(s => {
        if (s.badges.find(b => b.id === badge.id)) return s
        return { badges: [...s.badges, { ...badge, earnedAt: new Date().toISOString() }] }
      }),

      saveReport: (r) => set(s => ({
        monthlyReports: [...s.monthlyReports.filter(rp => rp.monthKey !== r.monthKey), r],
      })),

      setClarityFeedCache: (insights, logCount) => set({
        clarityFeedCache: { insights, logCount },
      }),

      setWeeklyQuestGeneratedAt: (dt) => set({ weeklyQuestGeneratedAt: dt }),

      initDefaultQuests: () => set({ quests: DEFAULT_QUESTS }),
    }),
    {
      name: 'verdant-store',
      partialize: (s) => ({
        user: s.user,
        logs: s.logs,
        quests: s.quests,
        chatHistory: s.chatHistory,
        monthlyReports: s.monthlyReports,
        badges: s.badges,
        clarityFeedCache: s.clarityFeedCache,
        weeklyQuestGeneratedAt: s.weeklyQuestGeneratedAt,
      }),
    }
  )
)
