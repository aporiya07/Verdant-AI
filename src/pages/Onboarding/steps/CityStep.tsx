import { m } from 'motion/react'
import { ChevronRight } from 'lucide-react'

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Other']

interface CityStepProps {
  name: string
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export function CityStep({ name, value, onChange, onNext }: CityStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <p className="text-3xl mb-4">🏙️</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">
          Which city, {name}?
        </h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-6 text-sm">
          We'll use city-specific data for accurate estimates.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 w-full">
          {CITIES.map(city => (
            <m.button
              key={city}
              onClick={() => onChange(city)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: value === city ? 'rgba(46,204,122,0.2)' : 'rgba(26,58,42,0.5)',
                border: `1px solid ${value === city ? 'rgba(46,204,122,0.5)' : 'rgba(46,204,122,0.1)'}`,
                color: value === city ? '#2ECC7A' : 'rgba(245,240,232,0.7)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {city}
            </m.button>
          ))}
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
