import { m } from 'motion/react'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface NameStepProps {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export function NameStep({ value, onChange, onNext }: NameStepProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 max-w-md mx-auto">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-4xl mb-6">👋</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">What should Sage call you?</h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-8 text-sm">
          Sage is your personal carbon coach — let's get personal!
        </p>

        <div className="relative w-full max-w-xs mx-auto mb-8">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Priya, Arjun, Rohan…"
            className="w-full px-5 py-4 rounded-2xl text-center text-lg font-semibold text-[#F5F0E8] placeholder:text-[rgba(245,240,232,0.3)] outline-none transition-all"
            style={{
              background: 'rgba(26,58,42,0.6)',
              border: `1px solid ${focused ? 'rgba(46,204,122,0.5)' : 'rgba(46,204,122,0.2)'}`,
              boxShadow: focused ? '0 0 0 3px rgba(46,204,122,0.1)' : 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
            autoFocus
          />
        </div>

        <m.button
          onClick={onNext}
          disabled={!value.trim()}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: value.trim() ? '#2ECC7A' : 'rgba(46,204,122,0.3)', color: '#0D1F17' }}
          whileHover={value.trim() ? { scale: 1.02 } : {}}
          whileTap={value.trim() ? { scale: 0.98 } : {}}
        >
          Sounds good!
          <ChevronRight size={18} />
        </m.button>
      </m.div>
    </div>
  )
}
