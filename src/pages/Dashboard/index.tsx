import { m } from 'motion/react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plus, Car, UtensilsCrossed, Zap, Plane, ShoppingBag, X, ChevronRight } from 'lucide-react'
import { useVerdantStore, getMonthlyTotal, getCategoryTotals } from '../../lib/store'
import { INDIA_BENCHMARKS, ACTIVITY_TEMPLATES } from '../../lib/carbon'
import { getClarityInsights } from '../../lib/gemini'
import { ImpactOrb } from '../../components/impactorb/ImpactOrb'
import { EarthTwin } from '../../components/earthtwin/EarthTwin'
import { GlassCard } from '../../components/ui/GlassCard'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import { formatINR, formatNumDecimal } from '../../lib/formatters'
import { EmissionsAreaChart } from '../../components/charts/EmissionsAreaChart'
import { CategoryIcon } from '../../components/ui/CategoryIcon'

const QUICK_ADD_CATEGORIES = [
  { icon: Car, label: 'Drive', category: 'transport' },
  { icon: UtensilsCrossed, label: 'Meal', category: 'food' },
  { icon: Zap, label: 'Energy', category: 'energy' },
  { icon: Plane, label: 'Travel', category: 'travel' },
  { icon: ShoppingBag, label: 'Shop', category: 'shopping' },
]

function QuickAddModal({ category, onClose }: { category: string; onClose: () => void }) {
  const addLog = useVerdantStore(s => s.addLog)
  const templates = ACTIVITY_TEMPLATES.filter(t => t.category === category)
  const [selected, setSelected] = useState<typeof templates[0] | null>(null)
  const [qty, setQty] = useState(1)

  const handleAdd = () => {
    if (!selected) return
    const co2Kg = selected.defaultCO2 > 0 ? selected.defaultCO2 * qty : qty * 0.1
    addLog({
      date: new Date().toISOString().split('T')[0],
      category: selected.category,
      activity: selected.label,
      co2Kg: Number(co2Kg.toFixed(3)),
      unit: selected.unit,
      quantity: qty,
    })
    onClose()
  }

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(13,31,23,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        className="glass-card-strong w-full max-w-sm p-6"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#F5F0E8]">Quick Add — {category}</h3>
          <button onClick={onClose} className="text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
              style={{
                background: selected?.id === t.id ? 'rgba(46,204,122,0.18)' : 'rgba(26,58,42,0.5)',
                border: `1px solid ${selected?.id === t.id ? 'rgba(46,204,122,0.4)' : 'rgba(46,204,122,0.1)'}`,
                color: selected?.id === t.id ? '#A8F5B0' : 'rgba(245,240,232,0.7)',
              }}
            >
              <span className="text-base"><CategoryIcon name={t.icon} size={16} /></span>
              <span className="flex-1 font-medium">{t.label}</span>
              {t.defaultCO2 > 0 && (
                <span className="text-xs text-[rgba(245,240,232,0.4)]">{t.defaultCO2} kg</span>
              )}
            </button>
          ))}
        </div>

        {selected && (
          <div className="mb-4">
            <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1 block">
              {selected.prompt ?? `Quantity (${selected.unit})`}
            </label>
            <input
              type="number"
              value={qty}
              min={0.1}
              step={selected.unit === 'km' ? 0.5 : 1}
              onChange={e => setQty(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-[#F5F0E8] text-sm outline-none"
              style={{
                background: 'rgba(26,58,42,0.7)',
                border: '1px solid rgba(46,204,122,0.2)',
              }}
            />
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!selected}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: '#2ECC7A', color: '#0D1F17' }}
        >
          Add to TraceLog
        </button>
      </m.div>
    </m.div>
  )
}

export function DashboardPage() {
  const user = useVerdantStore(s => s.user)
  const logs = useVerdantStore(s => s.logs)
  const clarityCache = useVerdantStore(s => s.clarityFeedCache)
  const setClarityFeedCache = useVerdantStore(s => s.setClarityFeedCache)

  const [insights, setInsights] = useState<string[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null)

  const monthlyKg = getMonthlyTotal(logs)
  const categoryTotals = getCategoryTotals(logs)
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'transport'

  // Load Clarity insights
  useEffect(() => {
    const shouldRefresh = !clarityCache || clarityCache.logCount !== logs.length
    if (shouldRefresh && !insightsLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInsightsLoading(true)
      getClarityInsights({
        name: user.name,
        city: user.city,
        monthlyKg,
        goalKg: user.monthlyGoalKg,
        byCategory: categoryTotals,
        avgMonthlyKg: INDIA_BENCHMARKS.avgMonthlyKg,
      })
        .then(result => {
          setInsights(result)
          setClarityFeedCache(result, logs.length)
        })
        .catch(() => {
          setInsights([
            '🌿 Keep logging your activities for personalized insights!',
            '🚇 Try commuting by metro or bus to reduce transport emissions.',
            '🍛 Choosing a veg thali over non-veg saves 1–3 kg CO₂ per meal.',
          ])
        })
        .finally(() => setInsightsLoading(false))
    } else if (clarityCache) {
      setInsights(clarityCache.insights)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs.length])

  const offsetCostINR = monthlyKg * 0.45 * 420  // ~₹420/tonne, 0.45 for rough fraction

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[rgba(168,245,176,0.7)] text-sm mb-1">{greeting()}</p>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">
          Namaste, {user.name}
        </h1>
        <p className="text-sm text-[rgba(245,240,232,0.5)] mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </m.div>

      {/* Hero: ImpactOrb + EarthTwin */}
      <m.div
        className="glass-card p-6 flex flex-col sm:flex-row items-center justify-around gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ImpactOrb monthlyKg={monthlyKg} goalKg={user.monthlyGoalKg} size={200} />
        <EarthTwin size={200} />
      </m.div>

      {/* Quick Add */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-xs text-[rgba(245,240,232,0.5)] mb-2 uppercase tracking-wider font-medium">
          Quick Add
        </p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_ADD_CATEGORIES.map(cat => (
            <m.button
              key={cat.category}
              onClick={() => setQuickAddCategory(cat.category)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass-pill transition-all"
              style={{ color: '#A8F5B0' }}
              whileHover={{ scale: 1.03, background: 'rgba(46,204,122,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              <cat.icon size={14} strokeWidth={1.75} />
              <span>{cat.label}</span>
              <Plus size={14} className="opacity-60" />
            </m.button>
          ))}
        </div>
      </m.div>

      {/* Clarity Feed */}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium">
            <CategoryIcon name="Bot" size={12} className="inline mr-1" />Sage's Clarity Feed
          </p>
          <span className="text-xs text-[rgba(168,245,176,0.4)]">AI-powered</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {insightsLoading
            ? [0, 1, 2].map(i => <SkeletonCard key={i} lines={3} />)
            : insights.map((insight, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <GlassCard className="p-4 h-full">
                    <p className="text-sm text-[rgba(245,240,232,0.85)] leading-relaxed">{insight}</p>
                  </GlassCard>
                </m.div>
              ))}
        </div>
      </m.div>

      {/* Comparison widget */}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            How you compare
          </p>
          <div className="space-y-3">
            {[
              { label: `${user.city} average`, kg: INDIA_BENCHMARKS.cityAvgMonthlyKg[user.city as keyof typeof INDIA_BENCHMARKS.cityAvgMonthlyKg] ?? 158, color: '#A8F5B0' },
              { label: 'India average', kg: INDIA_BENCHMARKS.avgMonthlyKg, color: '#FFD166' },
              { label: 'Paris target', kg: INDIA_BENCHMARKS.parisTargetMonthlyKg, color: '#2ECC7A' },
            ].map(({ label, kg, color }) => {
              const ratio = Math.min(monthlyKg / (kg * 2), 1)
              const isLower = monthlyKg <= kg
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[rgba(245,240,232,0.6)]">{label}</span>
                    <span style={{ color }}>
                      {isLower ? '✓ ' : ''}
                      {formatNumDecimal(kg)} kg/mo
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(46,204,122,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${ratio * 100}%`, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[rgba(46,204,122,0.1)] flex items-center justify-between">
            <p className="text-xs text-[rgba(245,240,232,0.5)]">
              To offset your footprint: <span className="text-[#FFD166] font-semibold">{formatINR(Math.round(offsetCostINR))}</span>
            </p>
            <Link to="/market" className="text-xs font-semibold text-[#2ECC7A] hover:text-[#A8F5B0] transition-colors bg-[rgba(46,204,122,0.1)] px-3 py-1 rounded-full">
              Offset Now
            </Link>
          </div>
        </GlassCard>
      </m.div>

      {/* 30-day trend */}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            30-day emissions trend
          </p>
          <EmissionsAreaChart />
        </GlassCard>
      </m.div>

      {/* Top category call-out */}
      {monthlyKg > 0 && (
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-5" hover onClick={() => {}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[rgba(245,240,232,0.5)] mb-1">Biggest source this month</p>
                <p className="text-lg font-bold text-[#F5F0E8] capitalize">{topCategory}</p>
                <p className="text-sm text-[#E8472A] font-semibold">
                  {formatNumDecimal(categoryTotals[topCategory] ?? 0)} kg CO₂
                </p>
              </div>
              <ChevronRight className="text-[rgba(245,240,232,0.3)]" size={20} />
            </div>
          </GlassCard>
        </m.div>
      )}

      {/* Quick Add modal */}
      {quickAddCategory && (
        <QuickAddModal category={quickAddCategory} onClose={() => setQuickAddCategory(null)} />
      )}
    </div>
  )
}
