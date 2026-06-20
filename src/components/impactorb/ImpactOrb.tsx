import { m, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { Leaf, Zap, CircleAlert } from 'lucide-react'
import { getOrbZone, getOrbMessage, INDIA_BENCHMARKS } from '../../lib/carbon'
import { formatNumDecimal } from '../../lib/formatters'

interface ImpactOrbProps {
  monthlyKg: number
  goalKg?: number
  size?: number
  className?: string
}

const ORB_COLORS = {
  green: { stroke: '#2ECC7A', glow: 'rgba(46,204,122,0.3)', text: '#2ECC7A' },
  amber: { stroke: '#FFD166', glow: 'rgba(255,209,102,0.3)', text: '#FFD166' },
  red: { stroke: '#E8472A', glow: 'rgba(232,71,42,0.3)', text: '#E8472A' },
}

export function ImpactOrb({ monthlyKg, goalKg = INDIA_BENCHMARKS.avgMonthlyKg, size = 220, className = '' }: ImpactOrbProps) {
  const prefersReducedMotion = useReducedMotion()
  const zone = getOrbZone(monthlyKg)
  const colors = ORB_COLORS[zone]
  const message = getOrbMessage(monthlyKg)

  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.78
  const circumference = 2 * Math.PI * radius

  // Progress as fraction of 400 kg ceiling
  const progress = Math.min(monthlyKg / 400, 1)
  const strokeDashoffset = circumference * (1 - progress)

  const animatedOffset = useMotionValue(circumference)
  const springOffset = useSpring(animatedOffset, { stiffness: 60, damping: 20 })

  useEffect(() => {
    if (!prefersReducedMotion) {
      animatedOffset.set(strokeDashoffset)
    }
  }, [strokeDashoffset, prefersReducedMotion, animatedOffset])

  const displayOffset = prefersReducedMotion ? strokeDashoffset : springOffset

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            animation: prefersReducedMotion ? 'none' : 'pulse-ring 3s ease-in-out infinite',
          }}
        />

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="rgba(46,204,122,0.12)"
            strokeWidth="10"
          />
          {/* Goal marker */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="rgba(245,240,232,0.15)"
            strokeWidth="2"
            strokeDasharray={`4 ${circumference - 4}`}
            strokeDashoffset={circumference * (1 - goalKg / 400)}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Progress arc */}
          <m.circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: displayOffset,
              transform: 'rotate(-90deg)',
              transformOrigin: `${cx}px ${cy}px`,
              filter: `drop-shadow(0 0 8px ${colors.stroke})`,
            }}
          />
          {/* Inner decorative ring */}
          <circle
            cx={cx} cy={cy} r={radius * 0.82}
            fill="none"
            stroke="rgba(46,204,122,0.06)"
            strokeWidth="1"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <m.p
            className="font-bold leading-none"
            style={{ color: colors.text, fontSize: size * 0.16 }}
            key={monthlyKg}
            initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {formatNumDecimal(monthlyKg)}
          </m.p>
          <p className="text-xs text-[rgba(245,240,232,0.6)] mt-1">kg CO₂/month</p>
          <div
            className="mt-2 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: `${colors.glow}`,
              color: colors.text,
              border: `1px solid ${colors.stroke}40`,
            }}
          >
            {zone === 'green' ? <Leaf size={10} /> : zone === 'amber' ? <Zap size={10} /> : <CircleAlert size={10} />}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-sm font-medium" style={{ color: colors.text }}>
        {message}
      </p>
    </div>
  )
}
