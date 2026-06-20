import { useEffect, useRef, useMemo } from 'react'
import createGlobe from 'cobe'
import type { Globe } from 'cobe'
import { useVerdantStore, getMonthlyTotal } from '../../lib/store'
import { INDIA_BENCHMARKS } from '../../lib/carbon'

interface EarthTwinProps {
  size?: number
  className?: string
  static?: boolean
}

export function EarthTwin({ size = 280, className = '', static: isStatic = false }: EarthTwinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(0)
  const rafRef = useRef<number>(0)

  const logs = useVerdantStore(s => s.logs)
  const monthlyKg = getMonthlyTotal(logs)

  const healthScore = Math.max(0, 1 - monthlyKg / 400)

  const baseColor = useMemo<[number, number, number]>(() => [
    0.1 + (1 - healthScore) * 0.8,
    0.75 * healthScore + 0.1,
    0.1 + healthScore * 0.2,
  ], [healthScore])

  const glowColor = useMemo<[number, number, number]>(() => [
    0.05 + (1 - healthScore) * 0.5,
    0.5 * healthScore + 0.05,
    0.05,
  ], [healthScore])

  const markers = useMemo(() => [
    { location: [20.5937, 78.9629] as [number, number], size: 0.06 },
  ], [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const devicePR = Math.min(window.devicePixelRatio, 2)

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: devicePR,
      width: size * devicePR,
      height: size * devicePR,
      phi: phiRef.current,
      theta: 0.25,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: healthScore > 0.5 ? 5 : 3,
      baseColor,
      markerColor: [0.8, 1, 0.5],
      glowColor,
      markers,
    })

    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    if (!isStatic) {
      const animate = () => {
        phiRef.current += 0.003
        globeRef.current?.update({ phi: phiRef.current })
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
    }
  }, [size, healthScore, isStatic, baseColor, glowColor, markers])

  const zone = monthlyKg < INDIA_BENCHMARKS.avgMonthlyKg
    ? 'Thriving'
    : monthlyKg < 300
    ? 'Under stress'
    : 'Needs healing'

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full"
      />
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold" style={{
          color: healthScore > 0.6 ? '#2ECC7A' : healthScore > 0.3 ? '#FFD166' : '#E8472A'
        }}>
          EarthTwin · {zone}
        </p>
      </div>
    </div>
  )
}
