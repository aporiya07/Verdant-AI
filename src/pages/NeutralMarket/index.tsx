import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { ShieldCheck, X, ArrowRight } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { formatINR, formatNumDecimal } from '../../lib/formatters'
import { useVerdantStore, getMonthlyTotal } from '../../lib/store'

const OFFSET_PROJECTS = [
  {
    id: 'sundarbans',
    name: 'Sundarbans Mangrove Restoration',
    location: 'West Bengal',
    emoji: '🌿',
    pricePerTonne: 420,
    verification: 'Gold Standard',
    description: 'Restoring mangrove forests in the Sundarbans delta — one of the world\'s most biodiverse ecosystems and a vital carbon sink.',
    impact: 'Protects coastal communities from cyclones while sequestering 2,400 tonnes CO₂/year',
    category: 'forest',
    tag: 'Biodiversity',
  },
  {
    id: 'rajasthan-solar',
    name: 'Rajasthan Solar Farm Community Project',
    location: 'Rajasthan',
    emoji: '☀️',
    pricePerTonne: 380,
    verification: 'VCS (Verified Carbon Standard)',
    description: 'Community-owned solar farms in rural Rajasthan, bringing clean energy to 1,200 households while displacing coal power.',
    impact: 'Generates 8.5 MW of clean energy, powers 5 villages',
    category: 'solar',
    tag: 'Clean Energy',
  },
  {
    id: 'western-ghats',
    name: 'Western Ghats Reforestation',
    location: 'Karnataka',
    emoji: '🌳',
    pricePerTonne: 490,
    verification: 'Gold Standard',
    description: 'Native species reforestation in the biodiverse Western Ghats — one of only 36 global biodiversity hotspots.',
    impact: 'Plants 50,000 trees/year, supports 140+ endemic species',
    category: 'forest',
    tag: 'Biodiversity',
  },
  {
    id: 'himalayan-cookstove',
    name: 'Himalayan Clean Cookstove Initiative',
    location: 'Uttarakhand & Himachal Pradesh',
    emoji: '🍳',
    pricePerTonne: 350,
    verification: 'Gold Standard',
    description: 'Replacing traditional wood-burning chulhas with efficient cookstoves in Himalayan villages — reducing deforestation and indoor air pollution.',
    impact: 'Saves 1,200 kg firewood/year per family, benefits 3,000+ women',
    category: 'efficiency',
    tag: 'Community',
  },
  {
    id: 'gujarat-wind',
    name: 'Gujarat Offshore Wind Farm',
    location: 'Gujarat',
    emoji: '💨',
    pricePerTonne: 410,
    verification: 'VCS (Verified Carbon Standard)',
    description: 'Offshore wind energy project in the Gulf of Kutch, contributing to India\'s 500 GW renewable target.',
    impact: 'Generates 120 MW, avoids 280,000 tonnes CO₂/year',
    category: 'wind',
    tag: 'Clean Energy',
  },
]

function CheckoutModal({ project, tonnes, onClose }: { project: typeof OFFSET_PROJECTS[0]; tonnes: number; onClose: () => void }) {
  const totalINR = project.pricePerTonne * tonnes
  const [step, setStep] = useState(0)

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13,31,23,0.9)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        className="glass-card-strong w-full max-w-sm p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {step === 0 ? (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#F5F0E8]">Checkout</h3>
              <button onClick={onClose} className="text-[rgba(245,240,232,0.5)]"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(245,240,232,0.6)]">Project</span>
                <span className="text-[#F5F0E8] text-right max-w-[60%]">{project.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(245,240,232,0.6)]">Amount</span>
                <span className="text-[#F5F0E8]">{formatNumDecimal(tonnes)} tonnes CO₂</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(245,240,232,0.6)]">Rate</span>
                <span className="text-[#F5F0E8]">{formatINR(project.pricePerTonne)}/tonne</span>
              </div>
              <div
                className="flex justify-between text-base font-bold pt-3"
                style={{ borderTop: '1px solid rgba(46,204,122,0.15)' }}
              >
                <span className="text-[rgba(245,240,232,0.8)]">Total</span>
                <span className="text-[#FFD166]">{formatINR(Math.round(totalINR))}</span>
              </div>
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-5 text-xs"
              style={{ background: 'rgba(46,204,122,0.08)', border: '1px solid rgba(46,204,122,0.15)' }}
            >
              <ShieldCheck size={14} className="text-[#2ECC7A] flex-shrink-0" />
              <span className="text-[rgba(245,240,232,0.7)]">Verified by {project.verification}. Certificate issued after payment.</span>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: '#2ECC7A', color: '#0D1F17' }}
            >
              Pay via Razorpay <ArrowRight size={16} />
            </button>
            <p className="text-xs text-center text-[rgba(245,240,232,0.3)] mt-2">
              Demo only — no actual payment
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <m.p
              className="text-5xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              🌿
            </m.p>
            <h3 className="text-xl font-bold text-[#2ECC7A] mb-2">Thank you!</h3>
            <p className="text-sm text-[rgba(245,240,232,0.7)] mb-4">
              Your contribution helps the {project.name} project.
              Certificate will be emailed within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#0D1F17]"
              style={{ background: '#2ECC7A' }}
            >
              Close
            </button>
          </div>
        )}
      </m.div>
    </m.div>
  )
}

export function NeutralMarketPage() {
  const logs = useVerdantStore(s => s.logs)
  const user = useVerdantStore(s => s.user)
  const monthlyKg = getMonthlyTotal(logs)
  const [checkout, setCheckout] = useState<{ project: typeof OFFSET_PROJECTS[0]; tonnes: number } | null>(null)

  const monthlyTonnes = monthlyKg / 1000

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">NeutralMarket 🛒</h1>
        <p className="text-sm text-[rgba(245,240,232,0.5)]">
          Offset your footprint with verified Indian projects
        </p>
      </div>

      {/* Offset calculator */}
      <GlassCard strong className="p-5">
        <p className="text-xs text-[rgba(245,240,232,0.5)] uppercase tracking-wider font-medium mb-3">
          Your offset estimate
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-[#F5F0E8]">
              {formatNumDecimal(monthlyKg)} <span className="text-base font-normal text-[rgba(245,240,232,0.5)]">kg CO₂</span>
            </p>
            <p className="text-sm text-[rgba(245,240,232,0.5)]">this month, {user.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[rgba(245,240,232,0.5)]">to offset at avg price</p>
            <p className="text-xl font-bold text-[#FFD166]">
              {formatINR(Math.round(monthlyTonnes * 410))}
            </p>
          </div>
        </div>
        <div className="mt-3 text-xs text-[rgba(245,240,232,0.4)]">
          At ₹410/tonne · {formatNumDecimal(monthlyTonnes * 1000) === '0.0' ? '0' : formatNumDecimal(monthlyTonnes)} tonnes CO₂ equivalent
        </div>
      </GlassCard>

      {/* Projects */}
      <div className="space-y-4">
        {OFFSET_PROJECTS.map((project, i) => (
          <m.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(46,204,122,0.12)' }}
                >
                  {project.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-[#F5F0E8] text-sm leading-tight">{project.name}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(46,204,122,0.1)', color: '#2ECC7A', border: '1px solid rgba(46,204,122,0.2)' }}
                    >
                      {project.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[rgba(245,240,232,0.5)] mb-2">
                    📍 {project.location}
                  </p>
                  <p className="text-xs text-[rgba(245,240,232,0.65)] mb-3 leading-relaxed">
                    {project.description}
                  </p>
                  <p className="text-xs text-[rgba(168,245,176,0.7)] mb-3">
                    ✦ {project.impact}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-[#FFD166]" />
                        <span className="text-xs text-[rgba(245,240,232,0.4)]">{project.verification}</span>
                      </div>
                      <p className="text-sm font-bold text-[#FFD166] mt-0.5">
                        {formatINR(project.pricePerTonne)}/tonne CO₂
                      </p>
                    </div>
                    <m.button
                      onClick={() => setCheckout({ project, tonnes: Math.max(0.1, monthlyTonnes) })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: '#2ECC7A', color: '#0D1F17' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Offset <ArrowRight size={14} />
                    </m.button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </m.div>
        ))}
      </div>

      <AnimatePresence>
        {checkout && (
          <CheckoutModal
            project={checkout.project}
            tonnes={checkout.tonnes}
            onClose={() => setCheckout(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
