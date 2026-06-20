import { m } from 'motion/react'
import { useState, useEffect } from 'react'
import { X, User, MapPin, UtensilsCrossed, Target, RotateCcw, Save } from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import type { DietType } from '../../lib/store'

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
]

const DIETS: { value: DietType; label: string }[] = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'non-vegetarian', label: 'Non-vegetarian' },
]

interface ProfileEditModalProps {
  onClose: () => void
}

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const user = useVerdantStore(s => s.user)
  const setUser = useVerdantStore(s => s.setUser)

  const [name, setName] = useState(user.name)
  const [city, setCity] = useState(user.city)
  const [diet, setDiet] = useState<DietType>(user.diet)
  const [monthlyGoalKg, setMonthlyGoalKg] = useState(user.monthlyGoalKg)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [resetTimer, setResetTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [resetTimer])

  const handleSave = () => {
    setUser({
      name,
      city,
      diet,
      monthlyGoalKg,
    })
    onClose()
  }

  const handleResetClick = () => {
    if (showConfirmReset) {
      // Second click - actually reset
      if (resetTimer) clearTimeout(resetTimer)
      
      // Reset all user data by clearing localStorage and reloading
      localStorage.removeItem('verdant-store')
      window.location.reload()
    } else {
      setShowConfirmReset(true)
      setResetTimer(setTimeout(() => {
        setShowConfirmReset(false)
      }, 3000))
    }
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
        className="glass-card-strong w-full max-w-md p-6"
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#F5F0E8]">Edit Profile</h2>
          <button onClick={onClose} className="text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[rgba(245,240,232,0.5)] mb-1.5">
              <User size={12} />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
              style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
              placeholder="Your name"
            />
          </div>

          {/* City */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[rgba(245,240,232,0.5)] mb-1.5">
              <MapPin size={12} />
              City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
              style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Diet */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[rgba(245,240,232,0.5)] mb-1.5">
              <UtensilsCrossed size={12} />
              Diet
            </label>
            <select
              value={diet}
              onChange={e => setDiet(e.target.value as DietType)}
              className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
              style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
            >
              {DIETS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Monthly CO2 Goal */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[rgba(245,240,232,0.5)] mb-1.5">
              <Target size={12} />
              Monthly CO₂ Goal (kg)
            </label>
            <input
              type="number"
              value={monthlyGoalKg}
              onChange={e => setMonthlyGoalKg(Number(e.target.value))}
              min={50}
              max={500}
              step={1}
              className="w-full px-4 py-2.5 rounded-xl text-[#F5F0E8] text-sm outline-none"
              style={{ background: 'rgba(26,58,42,0.7)', border: '1px solid rgba(46,204,122,0.2)' }}
            />
            <p className="text-xs text-[rgba(168,245,176,0.5)] mt-1">
              India average: 158 kg/month
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#2ECC7A', color: '#0D1F17' }}
          >
            <Save size={16} />
            Save Changes
          </button>
          
          <button
            onClick={handleResetClick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: showConfirmReset ? 'rgba(232,71,42,0.2)' : 'rgba(232,71,42,0.1)',
              border: `1px solid ${showConfirmReset ? '#E8472A' : 'rgba(232,71,42,0.3)'}`,
              color: '#E8472A',
            }}
          >
            <RotateCcw size={16} />
            {showConfirmReset ? 'Are you sure?' : 'Reset Profile'}
          </button>
        </div>

        <p className="text-xs text-center text-[rgba(245,240,232,0.3)] mt-3">
          Resetting will clear all progress and restart onboarding
        </p>
      </m.div>
    </m.div>
  )
}