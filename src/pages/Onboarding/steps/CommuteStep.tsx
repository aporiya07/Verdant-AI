import { m } from 'motion/react'
import { Check, ChevronRight } from 'lucide-react'

const COMMUTE_OPTIONS = [
  { id: 'metro', label: 'Metro', emoji: '🚇' },
  { id: 'city_bus', label: 'City Bus', emoji: '🚌' },
  { id: 'auto', label: 'Auto', emoji: '🛺' },
  { id: 'two_wheeler', label: 'Two-wheeler', emoji: '🏍️' },
  { id: 'two_wheeler_ev', label: 'EV Two-wheeler', emoji: '⚡🏍️' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'cab', label: 'Ola/Uber', emoji: '🚕' },
  { id: 'local_train', label: 'Local Train', emoji: '🚆' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'cycle', label: 'Cycle', emoji: '🚲' },
]

interface CommuteStepProps {
  value: string[]
  onChange: (v: string[]) => void
  onNext: () => void
}

export function CommuteStep({ value, onChange, onNext }: CommuteStepProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <p className="text-3xl mb-4">🗺️</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">How do you get around?</h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-6 text-sm">Select all that apply</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {COMMUTE_OPTIONS.map(opt => {
            const selected = value.includes(opt.id)
            return (
              <m.button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left relative"
                style={{
                  background: selected ? 'rgba(46,204,122,0.18)' : 'rgba(26,58,42,0.5)',
                  border: `1px solid ${selected ? 'rgba(46,204,122,0.5)' : 'rgba(46,204,122,0.1)'}`,
                  color: selected ? '#A8F5B0' : 'rgba(245,240,232,0.7)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg flex-shrink-0">{opt.emoji}</span>
                <span className="flex-1">{opt.label}</span>
                {selected && (
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <Check size={14} className="text-[#2ECC7A]" />
                  </m.span>
                )}
              </m.button>
            )
          })}
        </div>

        <m.button
          onClick={onNext}
          disabled={value.length === 0}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold w-full"
          style={{ background: value.length > 0 ? '#2ECC7A' : 'rgba(46,204,122,0.3)', color: '#0D1F17' }}
          whileHover={value.length > 0 ? { scale: 1.01 } : {}}
          whileTap={value.length > 0 ? { scale: 0.99 } : {}}
        >
          Next <ChevronRight size={18} />
        </m.button>
      </m.div>
    </div>
  )
}
