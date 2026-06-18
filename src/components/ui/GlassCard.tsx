import { m } from 'motion/react'
import type { ReactNode, CSSProperties } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  hover?: boolean
  strong?: boolean
}

export function GlassCard({ children, className = '', style, onClick, hover = false, strong = false }: GlassCardProps) {
  const base = strong ? 'glass-card-strong' : 'glass-card'
  const hoverClass = hover ? 'cursor-pointer' : ''

  if (hover) {
    return (
      <m.div
        className={`${base} ${hoverClass} ${className}`}
        style={style}
        onClick={onClick}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </m.div>
    )
  }

  return (
    <div
      className={`${base} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
