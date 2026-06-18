import { m } from 'motion/react'
import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import type { Globe } from 'cobe'
import { ChevronRight } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const devicePR = Math.min(window.devicePixelRatio, 2)
    globeRef.current = createGlobe(canvasRef.current, {
      devicePixelRatio: devicePR,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.7, 0.35],
      markerColor: [0.6, 1, 0.6],
      glowColor: [0.05, 0.4, 0.15],
      markers: [{ location: [20.5937, 78.9629], size: 0.06 }],
    })
    canvasRef.current.style.width = '300px'
    canvasRef.current.style.height = '300px'

    const animate = () => {
      phiRef.current += 0.004
      globeRef.current?.update({ phi: phiRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh text-center px-6 py-12">
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8"
      >
        <canvas ref={canvasRef} style={{ width: 300, height: 300 }} className="rounded-full" />
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🌿</span>
          <h1 className="text-3xl font-bold text-[#F5F0E8]">Verdant AI</h1>
        </div>
        <p className="text-xl font-semibold text-[#2ECC7A] mb-3">
          Know your Earth. Change your story.
        </p>
        <p className="text-[rgba(245,240,232,0.7)] leading-relaxed mb-8">
          Track your carbon footprint, get AI-powered insights, and take real action — built for India, powered by Gemini.
        </p>

        <div className="flex flex-col gap-3">
          <m.button
            onClick={onNext}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-[#0D1F17] transition-all"
            style={{ background: '#2ECC7A' }}
            whileHover={{ scale: 1.02, background: '#25a862' }}
            whileTap={{ scale: 0.98 }}
          >
            Let's get started
            <ChevronRight size={18} />
          </m.button>
        </div>
      </m.div>
    </div>
  )
}
