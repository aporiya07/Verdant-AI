interface SkeletonCardProps {
  className?: string
  lines?: number
}

export function SkeletonCard({ className = '', lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="skeleton h-4 w-3/4 mb-3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`skeleton h-3 mb-2 ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonText({ className = '', width = 'w-full' }: { className?: string; width?: string }) {
  return <div className={`skeleton h-4 ${width} ${className}`} />
}
