import { getLevelInfo } from '../../lib/store'

interface LevelBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
}

export function LevelBadge({ xp, size = 'md', showTitle = true }: LevelBadgeProps) {
  const { icon, title } = getLevelInfo(xp)
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  }
  return (
    <span
      className={`inline-flex items-center glass-pill font-semibold text-[#A8F5B0] ${sizeClasses[size]}`}
    >
      <span>{icon}</span>
      {showTitle && <span>{title}</span>}
    </span>
  )
}

interface CategoryBadgeProps {
  category: string
  size?: 'sm' | 'md'
}

const CATEGORY_STYLES: Record<string, string> = {
  transport: 'bg-[rgba(46,204,122,0.15)] text-[#2ECC7A] border-[rgba(46,204,122,0.3)]',
  food: 'bg-[rgba(255,209,102,0.15)] text-[#FFD166] border-[rgba(255,209,102,0.3)]',
  energy: 'bg-[rgba(232,71,42,0.15)] text-[#E8472A] border-[rgba(232,71,42,0.3)]',
  shopping: 'bg-[rgba(168,245,176,0.15)] text-[#A8F5B0] border-[rgba(168,245,176,0.3)]',
  travel: 'bg-[rgba(78,205,196,0.15)] text-[#4ECDC4] border-[rgba(78,205,196,0.3)]',
  waste: 'bg-[rgba(149,165,166,0.15)] text-[#95A5A6] border-[rgba(149,165,166,0.3)]',
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.waste
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  const label = category.charAt(0).toUpperCase() + category.slice(1)
  return (
    <span className={`inline-block rounded-full border font-medium capitalize ${style} ${sizeClass}`}>
      {label}
    </span>
  )
}
