import { m, AnimatePresence, useDragControls } from 'motion/react'
import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { SagePanel } from './SagePanel'

export function SageBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const dragControls = useDragControls()

  return (
    <>
      {/* Floating bubble */}
      <m.button
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #2ECC7A 0%, #1fa860 100%)',
          boxShadow: '0 8px 32px rgba(46,204,122,0.4)',
          cursor: 'grab',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open Sage AI assistant"
      >
        <m.span
          animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
        >
          {isOpen
            ? <X size={20} color="#0D1F17" strokeWidth={2.5} />
            : <Sparkles size={20} color="#0D1F17" strokeWidth={2} />
          }
        </m.span>
        {/* Pulse ring */}
        {!isOpen && (
          <m.span
            className="absolute inset-0 rounded-full border-2 border-[#2ECC7A]"
            animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </m.button>

      {/* Sage panel */}
      <AnimatePresence>
        {isOpen && <SagePanel onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
