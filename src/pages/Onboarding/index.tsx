import { m, AnimatePresence, useReducedMotion, type Variants } from 'motion/react'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import type { DietType } from '../../lib/store'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { WelcomeStep } from './steps/WelcomeStep'
import { NameStep } from './steps/NameStep'
import { CityStep } from './steps/CityStep'
import { CommuteStep } from './steps/CommuteStep'
import { DietStep } from './steps/DietStep'
import { EnergyStep } from './steps/EnergyStep'
import { GoalStep } from './steps/GoalStep'
import { EarthTwinReveal } from './steps/EarthTwinReveal'
import { INDIA_BENCHMARKS } from '../../lib/carbon'

const TOTAL_STEPS = 8

export function OnboardingPage() {
  const completeOnboarding = useVerdantStore(s => s.completeOnboarding)
  const prefersReduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const [name, setName] = useState('')
  const [city, setCity] = useState('Bengaluru')
  const [commuteMode, setCommuteMode] = useState<string[]>(['metro'])
  const [diet, setDiet] = useState<DietType | ''>('vegetarian')
  const [electricity, setElectricity] = useState(150)
  const [lpg, setLpg] = useState(1)
  const [goalKg, setGoalKg] = useState(INDIA_BENCHMARKS.avgMonthlyKg)

  const goNext = () => {
    setDirection(1)
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  const goBack = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }

  const handleSkip = () => {
    completeOnboarding({
      name: name || 'Friend',
      city: city || 'Bengaluru',
      commuteMode,
      diet: (diet as DietType) || 'vegetarian',
      monthlyGoalKg: goalKg,
    })
  }

  const handleComplete = () => {
    completeOnboarding({
      name: name || 'Friend',
      city,
      commuteMode,
      diet: (diet as DietType) || 'vegetarian',
      monthlyGoalKg: goalKg,
    })
  }

  const variants: Variants | undefined = prefersReduced
    ? undefined
    : {
        initial: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
        animate: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
      }

  return (
    <m.div
      className="min-h-dvh bg-[#0D1F17] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(46,204,122,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-6">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={goBack}
              className="glass-pill p-2 text-[#A8F5B0] hover:text-[#2ECC7A] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1">
              <ProgressBar value={(step / (TOTAL_STEPS - 1)) * 100} height={4} animated />
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-[rgba(245,240,232,0.4)] hover:text-[rgba(245,240,232,0.7)] transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="pt-20">
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={step}
            custom={direction}
            {...(variants ? { variants, initial: 'initial', animate: 'animate', exit: 'exit' } : {})}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {step === 0 && <WelcomeStep onNext={goNext} />}
            {step === 1 && <NameStep value={name} onChange={setName} onNext={goNext} />}
            {step === 2 && <CityStep name={name} value={city} onChange={setCity} onNext={goNext} />}
            {step === 3 && <CommuteStep value={commuteMode} onChange={setCommuteMode} onNext={goNext} />}
            {step === 4 && <DietStep value={diet} onChange={setDiet} onNext={goNext} />}
            {step === 5 && (
              <EnergyStep
                electricity={electricity} lpg={lpg}
                onElectricity={setElectricity} onLpg={setLpg}
                onNext={goNext}
              />
            )}
            {step === 6 && <GoalStep value={goalKg} onChange={setGoalKg} onNext={goNext} />}
            {step === 7 && (
              <EarthTwinReveal
                name={name || 'Friend'}
                diet={diet || 'vegetarian'}
                electricity={electricity}
                lpg={lpg}
                goalKg={goalKg}
                onComplete={handleComplete}
              />
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </m.div>
  )
}
