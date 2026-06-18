import { m } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { CO2_FACTORS_INDIA } from '../../../lib/carbon'
import { formatNumDecimal } from '../../../lib/formatters'

interface EnergyStepProps {
  electricity: number
  lpg: number
  onElectricity: (v: number) => void
  onLpg: (v: number) => void
  onNext: () => void
}

export function EnergyStep({ electricity, lpg, onElectricity, onLpg, onNext }: EnergyStepProps) {
  const electricityCO2 = electricity * CO2_FACTORS_INDIA.energy.electricity_kwh
  const lpgCO2 = lpg * CO2_FACTORS_INDIA.energy.lpg_cylinder_14kg

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-md mx-auto py-8">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <p className="text-3xl mb-4">⚡</p>
        <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Home energy usage?</h2>
        <p className="text-[rgba(245,240,232,0.6)] mb-6 text-sm">
          Estimate your monthly usage
        </p>

        <div className="space-y-6 text-left mb-8">
          {/* Electricity */}
          <div className="glass-card p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-[#F5F0E8] flex items-center gap-2">
                  <span>⚡</span> Electricity
                </p>
                <p className="text-xs text-[rgba(245,240,232,0.5)]">Units used per month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#FFD166]">{electricity} kWh</p>
                <p className="text-xs text-[rgba(245,240,232,0.5)]">
                  ~{formatNumDecimal(electricityCO2)} kg CO₂
                </p>
              </div>
            </div>
            <input
              type="range"
              min={0} max={400} step={10}
              value={electricity}
              onChange={(e) => onElectricity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[rgba(245,240,232,0.4)] mt-1">
              <span>0</span><span>India avg ~150</span><span>400 kWh</span>
            </div>
          </div>

          {/* LPG */}
          <div className="glass-card p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-[#F5F0E8] flex items-center gap-2">
                  <span>🔥</span> LPG Cylinders
                </p>
                <p className="text-xs text-[rgba(245,240,232,0.5)]">14kg cylinders per month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#FFD166]">{lpg}</p>
                <p className="text-xs text-[rgba(245,240,232,0.5)]">
                  ~{formatNumDecimal(lpgCO2)} kg CO₂
                </p>
              </div>
            </div>
            <input
              type="range"
              min={0} max={5} step={0.5}
              value={lpg}
              onChange={(e) => onLpg(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[rgba(245,240,232,0.4)] mt-1">
              <span>0</span><span>~1 avg</span><span>5</span>
            </div>
          </div>
        </div>

        <m.button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold w-full text-[#0D1F17]"
          style={{ background: '#2ECC7A' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Next <ChevronRight size={18} />
        </m.button>
      </m.div>
    </div>
  )
}
