import { m } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { EarthTwin } from '../../../components/earthtwin/EarthTwin'
import { ImpactOrb } from '../../../components/impactorb/ImpactOrb'
import { CO2_FACTORS_INDIA } from '../../../lib/carbon'

interface EarthTwinRevealProps {
  name: string
  diet: string
  electricity: number
  lpg: number
  goalKg: number
  onComplete: () => void
}

export function EarthTwinReveal({ name, diet, electricity, lpg, goalKg, onComplete }: EarthTwinRevealProps) {
  // Rough initial CO₂ estimate from onboarding data
  const foodCO2 = {
    vegan: 0.3, vegetarian: 0.45, eggetarian: 0.55, 'non-vegetarian': 1.2,
  }[diet] ?? 0.45

  const initialEstimate = Math.round(
    (electricity * CO2_FACTORS_INDIA.energy.electricity_kwh) +
    (lpg * CO2_FACTORS_INDIA.energy.lpg_cylinder_14kg) +
    (foodCO2 * 60) // 60 meals per month estimate
  )

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <m.p
          className="text-[#2ECC7A] font-semibold text-sm mb-3 tracking-widest uppercase"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ✨ Meet your EarthTwin
        </m.p>

        <m.h2
          className="text-2xl font-bold text-[#F5F0E8] mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Namaste, {name}! 🌿
        </m.h2>

        <div className="flex items-center justify-center gap-8 mb-6">
          <m.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <EarthTwin size={160} />
          </m.div>

          <m.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <ImpactOrb monthlyKg={initialEstimate} goalKg={goalKg} size={180} />
          </m.div>
        </div>

        <m.div
          className="glass-card p-4 mb-6 text-sm text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-[rgba(245,240,232,0.7)] leading-relaxed">
            Based on your profile, your estimated footprint is around{' '}
            <span className="text-[#FFD166] font-semibold">{initialEstimate} kg CO₂/month</span>.
            Your goal is <span className="text-[#2ECC7A] font-semibold">{goalKg} kg/month</span>.{' '}
            Start logging daily to get your precise number — Sage is ready to guide you!
          </p>
        </m.div>

        <m.button
          onClick={onComplete}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold w-full text-[#0D1F17] text-base"
          style={{ background: '#2ECC7A' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={18} />
          Start my journey!
        </m.button>
      </m.div>
    </div>
  )
}
