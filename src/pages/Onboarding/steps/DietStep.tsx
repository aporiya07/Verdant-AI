import { m } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import type { DietType } from '../../../lib/store'

const DIET_OPTIONS: { id: DietType; label: string; emoji: string; desc: string }[] = [
  { id: 'vegan', label: 'Vegan', emoji: '🌱', desc: 'No animal products' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗', desc: 'Veg thalis, dairy OK' },
  { id: 'eggetarian', label: 'Eggetarian', emoji: '🥚', desc: 'Veg + eggs' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian', emoji: '🍗', desc: 'All foods' },
]

interface DietStepProps {
  value: DietType | ''
  onChange: (v: DietType) => void
  onNext: () => void
}

export function DietStep({ value, onChange, onNext }: DietStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <p className="text-3xl mb-4">🍛</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">What's your diet?</h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-6 text-sm">
          Food choices have a big impact on your footprint
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {DIET_OPTIONS.map(opt => {
            const selected = value === opt.id
            return (
              <m.button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl"
                style={{
                  background: selected ? 'rgba(46,204,122,0.18)' : 'rgba(26,58,42,0.5)',
                  border: `1px solid ${selected ? 'rgba(46,204,122,0.5)' : 'rgba(46,204,122,0.1)'}`,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="font-semibold text-sm" style={{ color: selected ? '#2ECC7A' : '#F5F0E8' }}>
                  {opt.label}
                </span>
                <span className="text-xs text-[rgba(245,240,232,0.5)]">{opt.desc}</span>
              </m.button>
            )
          })}
        </div>

        <m.button
          onClick={onNext}
          disabled={!value}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold w-full"
          style={{ background: value ? '#2ECC7A' : 'rgba(46,204,122,0.3)', color: '#0D1F17' }}
          whileHover={value ? { scale: 1.01 } : {}}
          whileTap={value ? { scale: 0.99 } : {}}
        >
          Next <ChevronRight size={18} />
        </m.button>
      </m.div>
    </div>
  )
}
