import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Plus, Trash2, X, Zap } from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import { ACTIVITY_TEMPLATES, CATEGORY_COLORS } from '../../lib/carbon'
import { estimateCO2 } from '../../lib/gemini'
import { formatDate, formatNumDecimal, todayISO } from '../../lib/formatters'
import { GlassCard } from '../../components/ui/GlassCard'
import { CategoryBadge } from '../../components/ui/Badge'
import { WeeklyBarChart } from '../../components/charts/WeeklyBarChart'
import type { ActivityCategory } from '../../lib/store'
import { CategoryIcon } from '../../components/ui/CategoryIcon'

const CATEGORIES: { id: ActivityCategory; label: string; icon: string }[] = [
  { id: 'transport', label: 'Transport', icon: 'Car' },
  { id: 'food', label: 'Food', icon: 'UtensilsCrossed' },
  { id: 'energy', label: 'Energy', icon: 'Zap' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'travel', label: 'Travel', icon: 'Plane' },
  { id: 'waste', label: 'Waste', icon: 'Recycle' },
]

function AddLogModal({ onClose }: { onClose: () => void }) {
  const addLog = useVerdantStore(s => s.addLog)
  const [category, setCategory] = useState<ActivityCategory>('transport')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [customActivity, setCustomActivity] = useState('')
  const [customCO2, setCustomCO2] = useState('')
  const [notes, setNotes] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [date, setDate] = useState(todayISO())

  const templates = ACTIVITY_TEMPLATES.filter(t => t.category === category)
  const template = templates.find(t => t.id === selectedTemplate)

  const handleEstimateAI = async () => {
    if (!customActivity.trim()) return
    setEstimating(true)
    try {
      const co2 = await estimateCO2(customActivity)
      setCustomCO2(String(co2.toFixed(3)))
    } finally {
      setEstimating(false)
    }
  }

  const handleSubmit = () => {
    if (isCustom) {
      if (!customActivity || !customCO2) return
      addLog({
        date, category,
        activity: customActivity,
        co2Kg: Number(customCO2),
        notes: notes || undefined,
      })
    } else {
      if (!template) return
      const co2Kg = template.defaultCO2 > 0 ? template.defaultCO2 * qty : qty * 0.1
      addLog({
        date, category,
        activity: template.label,
        co2Kg: Number(co2Kg.toFixed(3)),
        unit: template.unit,
        quantity: qty,
        notes: notes || undefined,
      })
    }
    onClose()
  }

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(13,31,23,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        className="glass-card-strong w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-[#F5F0E8] text-lg">Log Activity</h3>
          <button onClick={onClose} className="text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8]">
            <X size={18} />
          </button>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">Date</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
            style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)', colorScheme: 'dark' }}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setSelectedTemplate('') }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: category === c.id ? `${CATEGORY_COLORS[c.id]}22` : 'rgba(26,58,42,0.5)',
                  border: `1px solid ${category === c.id ? CATEGORY_COLORS[c.id] + '66' : 'rgba(46,204,122,0.1)'}`,
                  color: category === c.id ? CATEGORY_COLORS[c.id] : 'rgba(245,240,232,0.6)',
                }}
              >
                <CategoryIcon name={c.icon} size={14} strokeWidth={1.75} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsCustom(false)}
            className="text-sm px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: !isCustom ? 'rgba(46,204,122,0.15)' : 'transparent',
              color: !isCustom ? '#2ECC7A' : 'rgba(245,240,232,0.5)',
            }}
          >
            From list
          </button>
          <button
            onClick={() => setIsCustom(true)}
            className="text-sm px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: isCustom ? 'rgba(46,204,122,0.15)' : 'transparent',
              color: isCustom ? '#2ECC7A' : 'rgba(245,240,232,0.5)',
            }}
          >
            Custom
          </button>
        </div>

        {!isCustom ? (
          <>
            <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: selectedTemplate === t.id ? 'rgba(46,204,122,0.15)' : 'rgba(26,58,42,0.5)',
                    border: `1px solid ${selectedTemplate === t.id ? 'rgba(46,204,122,0.4)' : 'rgba(46,204,122,0.08)'}`,
                    color: selectedTemplate === t.id ? '#A8F5B0' : 'rgba(245,240,232,0.7)',
                  }}
                >
                  <CategoryIcon name={t.icon} size={16} strokeWidth={1.75} />
                  <span className="flex-1">{t.label}</span>
                  {t.defaultCO2 > 0 && <span className="text-xs opacity-50">{t.defaultCO2}kg</span>}
                </button>
              ))}
            </div>
            {template && (
              <div className="mb-4">
                <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">
                  {template.prompt ?? `Quantity (${template.unit})`}
                </label>
                <input
                  type="number"
                  value={qty}
                  min={0.1}
                  step={template.unit === 'km' ? 0.5 : 1}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
                  style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
                />
                <p className="text-xs text-[rgba(245,240,232,0.4)] mt-1">
                  = {formatNumDecimal(template.defaultCO2 * qty)} kg CO₂
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">Activity description</label>
              <input
                type="text"
                value={customActivity}
                onChange={e => setCustomActivity(e.target.value)}
                placeholder="e.g. Drove 15km on petrol car to office"
                className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
                style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
              />
            </div>
            <div>
              <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">CO₂ (kg)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customCO2}
                  onChange={e => setCustomCO2(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
                  style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
                />
                <button
                  onClick={handleEstimateAI}
                  disabled={!customActivity.trim() || estimating}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                  style={{ background: 'rgba(46,204,122,0.15)', border: '1px solid rgba(46,204,122,0.3)', color: '#2ECC7A' }}
                >
                  <Zap size={12} />
                  {estimating ? 'Estimating…' : 'AI Estimate'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="text-xs text-[rgba(245,240,232,0.5)] mb-1.5 block">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any extra details…"
            className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
            style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.1)' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isCustom ? (!customActivity || !customCO2) : !template}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: '#2ECC7A', color: '#0D1F17' }}
        >
          Save to TraceLog
        </button>
      </m.div>
    </m.div>
  )
}

export function TraceLogPage() {
  const logs = useVerdantStore(s => s.logs)
  const deleteLog = useVerdantStore(s => s.deleteLog)
  const [showModal, setShowModal] = useState(false)
  const [filterCat, setFilterCat] = useState<string>('all')

  const sortedLogs = [...logs]
    .filter(l => filterCat === 'all' || l.category === filterCat)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Group by date
  const grouped = sortedLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {} as Record<string, typeof logs>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]">TraceLog</h1>
          <p className="text-sm text-[rgba(245,240,232,0.5)]">Track every emission, big or small</p>
        </div>
        <m.button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#0D1F17]"
          style={{ background: '#2ECC7A' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={16} /> Log Activity
        </m.button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: filterCat === 'all' ? 'rgba(46,204,122,0.15)' : 'rgba(26,58,42,0.5)',
            color: filterCat === 'all' ? '#2ECC7A' : 'rgba(245,240,232,0.5)',
            border: `1px solid ${filterCat === 'all' ? 'rgba(46,204,122,0.3)' : 'transparent'}`,
          }}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCat(c.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterCat === c.id ? `${CATEGORY_COLORS[c.id]}22` : 'rgba(26,58,42,0.5)',
              color: filterCat === c.id ? CATEGORY_COLORS[c.id] : 'rgba(245,240,232,0.5)',
              border: `1px solid ${filterCat === c.id ? CATEGORY_COLORS[c.id] + '44' : 'transparent'}`,
            }}
          >
            <CategoryIcon name={c.icon} size={12} className="inline mr-1" />{c.label}
          </button>
        ))}
      </div>

      {/* Weekly chart */}
      <GlassCard className="p-5">
        <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
          This week by category
        </p>
        <WeeklyBarChart />
      </GlassCard>

      {/* Log timeline */}
      {Object.keys(grouped).length === 0 ? (
        <GlassCard className="p-8 text-center">
          <CategoryIcon name="Sprout" size={48} className="mb-3" />
          <p className="text-[#F5F0E8] font-semibold mb-1">No activities logged yet</p>
          <p className="text-sm text-[rgba(245,240,232,0.5)]">
            Start logging to track your carbon footprint!
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayLogs]) => {
            const dayTotal = dayLogs.reduce((s, l) => s + l.co2Kg, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-sm font-semibold text-[rgba(245,240,232,0.7)]">
                    {formatDate(date + 'T00:00:00')}
                  </p>
                  <p className="text-xs text-[rgba(245,240,232,0.4)]">
                    {formatNumDecimal(dayTotal)} kg CO₂
                  </p>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {dayLogs.map(log => (
                      <m.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="glass-card p-4 flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${CATEGORY_COLORS[log.category]}22` }}
                        >
                          <CategoryIcon name={CATEGORIES.find(c => c.id === log.category)?.icon ?? 'Leaf'} size={16} strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F5F0E8] truncate">{log.activity}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <CategoryBadge category={log.category} />
                            {log.notes && (
                              <p className="text-xs text-[rgba(245,240,232,0.4)] truncate">{log.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold" style={{ color: CATEGORY_COLORS[log.category] }}>
                            {formatNumDecimal(log.co2Kg)} kg
                          </p>
                        </div>
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="text-[rgba(245,240,232,0.3)] hover:text-[#E8472A] transition-colors ml-1"
                          aria-label="Delete log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddLogModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
