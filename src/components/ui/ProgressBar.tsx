import { m } from 'motion/react'

interface ProgressBarProps {
  value: number        // 0-100
  max?: number
  color?: string
  className?: string
  height?: number
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  color = '#2ECC7A',
  className = '',
  height = 6,
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full overflow-hidden rounded-full"
        style={{ height, background: 'rgba(46,204,122,0.12)' }}
      >
        <m.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[rgba(245,240,232,0.5)] mt-1 inline-block">
          {value}/{max}
        </span>
      )}
    </div>
  )
}
