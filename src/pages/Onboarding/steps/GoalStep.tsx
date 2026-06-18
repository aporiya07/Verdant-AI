import { m } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { INDIA_BENCHMARKS } from '../../../lib/carbon'
import { formatNumDecimal } from '../../../lib/formatters'

interface GoalStepProps {
  value: number
  onChange: (v: number) => void
  onNext: () => void
}

export function GoalStep({ value, onChange, onNext }: GoalStepProps) {
  const isOnTarget = value <= INDIA_BENCHMARKS.parisTargetMonthlyKg
  const isGood = value <= INDIA_BENCHMARKS.avgMonthlyKg

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <p className="text-3xl mb-4">🎯</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Set your monthly goal</h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-6 text-sm">
          How much CO₂ do you want to stay within each month?
        </p>

        <div className="glass-card p-6 mb-6">
          <m.p
            key={value}
            className="text-5xl font-bold mb-1"
            style={{ color: isOnTarget ? '#2ECC7A' : isGood ? '#FFD166' : '#E8472A' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {formatNumDecimal(value)} kg
          </m.p>
          <p className="text-sm text-[rgba(245,240,232,0.5)] mb-4">CO₂ per month</p>

          <input
            type="range"
            min={50} max={500} step={5}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full mb-4"
          />

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="glass-card p-2 text-center">
              <p className="text-[#2ECC7A] font-semibold">{INDIA_BENCHMARKS.parisTargetMonthlyKg} kg</p>
              <p className="text-[rgba(245,240,232,0.5)]">Paris Target</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-[#FFD166] font-semibold">{INDIA_BENCHMARKS.avgMonthlyKg} kg</p>
              <p className="text-[rgba(245,240,232,0.5)]">India Avg</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-[#E8472A] font-semibold">{INDIA_BENCHMARKS.globalAvgMonthlyKg} kg</p>
              <p className="text-[rgba(245,240,232,0.5)]">Global Avg</p>
            </div>
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: isOnTarget ? '#2ECC7A' : isGood ? '#FFD166' : '#E8472A' }}>
          {isOnTarget
            ? '🎉 Brilliant! That\'s at or below the Paris Agreement target.'
            : isGood
            ? '👍 That\'s around India\'s average — let\'s push for better!'
            : '💪 Ambitious! Sage will help you get there step by step.'}
        </p>

        <m.button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold w-full text-[#0D1F17]"
          style={{ background: '#2ECC7A' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Almost there! <ChevronRight size={18} />
        </m.button>
      </m.div>
    </div>
  )
}
