import { m } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { Download, RefreshCw, Leaf } from 'lucide-react'
import { useVerdantStore, getMonthlyLogs, getMonthlyTotal, getCategoryTotals } from '../../lib/store'
import { INDIA_BENCHMARKS, CATEGORY_LABELS } from '../../lib/carbon'
import { callGemini } from '../../lib/gemini'
import { formatMonthYear, formatNumDecimal, formatINR, currentMonthKey } from '../../lib/formatters'
import { GlassCard } from '../../components/ui/GlassCard'
import { CategoryPieChart } from '../../components/charts/CategoryPieChart'
import { EmissionsAreaChart } from '../../components/charts/EmissionsAreaChart'
import { SkeletonCard } from '../../components/ui/SkeletonCard'

export function EarthReportPage() {
  const user = useVerdantStore(s => s.user)
  const logs = useVerdantStore(s => s.logs)
  const monthlyReports = useVerdantStore(s => s.monthlyReports)
  const saveReport = useVerdantStore(s => s.saveReport)

  const reportRef = useRef<HTMLDivElement>(null)
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const monthKey = currentMonthKey()
  const monthLogs = getMonthlyLogs(logs)
  const monthlyKg = getMonthlyTotal(logs)
  const categoryTotals = getCategoryTotals(monthLogs)
  // topCategory used for future enhancements
  Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  const savedReport = monthlyReports.find(r => r.monthKey === monthKey)

  useEffect(() => {
    if (savedReport?.geminiSummary) {
      setSummary(savedReport.geminiSummary)
    } else if (monthlyKg > 0) {
      generateSummary()
    }
  }, [monthKey])

  const generateSummary = async () => {
    setSummaryLoading(true)
    try {
      const prompt = `
You are Sage, a carbon footprint coach for Indian users. Generate a warm, encouraging monthly report summary (3-4 sentences).
User: ${user.name}, ${user.city}
This month's CO₂: ${monthlyKg.toFixed(1)} kg (goal: ${user.monthlyGoalKg} kg, India avg: ${INDIA_BENCHMARKS.avgMonthlyKg} kg)
Breakdown: ${Object.entries(categoryTotals).map(([k, v]) => `${k}: ${v.toFixed(1)} kg`).join(', ')}
Activities logged: ${monthLogs.length}

Include: key wins, one specific suggestion for next month, and a motivating close. Use Indian English.
`
      const result = await callGemini(prompt)
      setSummary(result)
      saveReport({
        id: crypto.randomUUID(),
        monthKey,
        totalCO2Kg: monthlyKg,
        byCategory: categoryTotals as Record<string, number> as never,
        geminiSummary: result,
        generatedAt: new Date().toISOString(),
      })
    } catch {
      setSummary(`Great effort this month, ${user.name}! You logged ${monthLogs.length} activities and tracked ${monthlyKg.toFixed(1)} kg CO₂. ${monthlyKg < INDIA_BENCHMARKS.avgMonthlyKg ? 'You\'re below India\'s average — brilliant!' : 'Keep pushing — every kg counts!'} Keep up the momentum next month!`)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleExport = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const { domToPng } = await import('modern-screenshot')
      const dataUrl = await domToPng(reportRef.current, {
        scale: 2,
        backgroundColor: '#0D1F17',
      })
      const link = document.createElement('a')
      link.download = `verdant-earth-report-${monthKey}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('Export failed:', e)
      alert('Export failed. Try a different browser.')
    } finally {
      setExporting(false)
    }
  }

  const vsIndia = monthlyKg - INDIA_BENCHMARKS.avgMonthlyKg
  const vsParis = monthlyKg - INDIA_BENCHMARKS.parisTargetMonthlyKg
  const offsetCost = (monthlyKg / 1000) * 410

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]">EarthReport 📄</h1>
          <p className="text-sm text-[rgba(245,240,232,0.5)]">
            {formatMonthYear(new Date().toISOString())} · Monthly summary
          </p>
        </div>
        <m.button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          style={{ background: 'rgba(46,204,122,0.15)', border: '1px solid rgba(46,204,122,0.3)', color: '#2ECC7A' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={14} />
          {exporting ? 'Exporting…' : 'Export PNG'}
        </m.button>
      </div>

      {/* Exportable report area */}
      <div ref={reportRef} className="space-y-4">
        {/* Header card */}
        <GlassCard strong className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(46,204,122,0.15)' }}
            >
              <Leaf size={20} className="text-[#2ECC7A]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E8]">Verdant AI · EarthReport</p>
              <p className="text-xs text-[rgba(245,240,232,0.5)]">{user.name} · {user.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-[#F5F0E8]">{formatNumDecimal(monthlyKg)}</p>
              <p className="text-xs text-[rgba(245,240,232,0.5)]">kg CO₂ total</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className={`text-2xl font-bold ${vsIndia <= 0 ? 'text-[#2ECC7A]' : 'text-[#E8472A]'}`}>
                {vsIndia <= 0 ? '-' : '+'}{formatNumDecimal(Math.abs(vsIndia))}
              </p>
              <p className="text-xs text-[rgba(245,240,232,0.5)]">vs India avg</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-[#FFD166]">{monthLogs.length}</p>
              <p className="text-xs text-[rgba(245,240,232,0.5)]">activities logged</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-[#A8F5B0]">{formatINR(Math.round(offsetCost))}</p>
              <p className="text-xs text-[rgba(245,240,232,0.5)]">offset cost</p>
            </div>
          </div>
        </GlassCard>

        {/* AI Summary */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium">
              🤖 Sage's Monthly Recap
            </p>
            <button
              onClick={generateSummary}
              disabled={summaryLoading}
              className="text-xs flex items-center gap-1 text-[rgba(46,204,122,0.6)] hover:text-[#2ECC7A] transition-colors"
            >
              <RefreshCw size={12} className={summaryLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          {summaryLoading ? (
            <SkeletonCard lines={4} className="bg-transparent p-0 border-0" />
          ) : summary ? (
            <p className="text-sm text-[rgba(245,240,232,0.85)] leading-relaxed">{summary}</p>
          ) : (
            <p className="text-sm text-[rgba(245,240,232,0.4)]">
              Start logging activities to get your AI-powered monthly summary!
            </p>
          )}
        </GlassCard>

        {/* Category breakdown */}
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-3">
              Breakdown by category
            </p>
            <CategoryPieChart data={categoryTotals} />
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-3">
              Category totals
            </p>
            {Object.entries(categoryTotals).length === 0 ? (
              <p className="text-sm text-[rgba(245,240,232,0.4)] text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, kg]) => (
                    <div key={cat} className="flex items-center justify-between text-sm">
                      <span className="text-[rgba(245,240,232,0.7)] capitalize">
                        {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                      </span>
                      <span className="font-semibold text-[#F5F0E8]">{formatNumDecimal(kg)} kg</span>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Trend */}
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            30-day emissions trend
          </p>
          <EmissionsAreaChart />
        </GlassCard>

        {/* Comparison callout */}
        <GlassCard className="p-5">
          <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-4">
            How you compare
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: vsIndia <= 0 ? 'rgba(46,204,122,0.12)' : 'rgba(232,71,42,0.12)',
                border: `1px solid ${vsIndia <= 0 ? 'rgba(46,204,122,0.25)' : 'rgba(232,71,42,0.25)'}`,
              }}
            >
              <p className={`text-xl font-bold ${vsIndia <= 0 ? 'text-[#2ECC7A]' : 'text-[#E8472A]'}`}>
                {vsIndia <= 0 ? `${formatNumDecimal(Math.abs(vsIndia))} kg below` : `${formatNumDecimal(vsIndia)} kg above`}
              </p>
              <p className="text-xs text-[rgba(245,240,232,0.5)] mt-0.5">India average ({INDIA_BENCHMARKS.avgMonthlyKg} kg)</p>
            </div>
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: vsParis <= 0 ? 'rgba(46,204,122,0.12)' : 'rgba(255,209,102,0.12)',
                border: `1px solid ${vsParis <= 0 ? 'rgba(46,204,122,0.25)' : 'rgba(255,209,102,0.25)'}`,
              }}
            >
              <p className={`text-xl font-bold ${vsParis <= 0 ? 'text-[#2ECC7A]' : 'text-[#FFD166]'}`}>
                {vsParis <= 0 ? `On target` : `${formatNumDecimal(vsParis)} kg over`}
              </p>
              <p className="text-xs text-[rgba(245,240,232,0.5)] mt-0.5">Paris target ({INDIA_BENCHMARKS.parisTargetMonthlyKg} kg)</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
