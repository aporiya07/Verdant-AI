import { m, AnimatePresence } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Trash2, Sparkles } from 'lucide-react'
import { useVerdantStore } from '../../lib/store'
import { useSage } from './useSage'

const SUGGESTED_PROMPTS = [
  "What's my biggest emission source?",
  "How do I reduce my commute footprint?",
  "Is my footprint better than average Indians?",
  "Suggest a green challenge for this week",
]

interface SagePanelProps {
  onClose: () => void
}

export function SagePanel({ onClose }: SagePanelProps) {
  const user = useVerdantStore(s => s.user)
  const clearChat = useVerdantStore(s => s.clearChat)
  const { chatHistory, isTyping, sendMessage } = useSage()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <m.div
      className="fixed bottom-24 right-4 z-50 w-full max-w-sm flex flex-col"
      style={{
        height: 480,
        background: 'rgba(13,31,23,0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(46,204,122,0.2)',
        borderRadius: '1.25rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(46,204,122,0.05)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(46,204,122,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(46,204,122,0.15)', border: '1px solid rgba(46,204,122,0.2)' }}
          >
            <Sparkles size={15} color="#2ECC7A" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-[#F5F0E8] text-sm leading-tight">Sage</p>
            <p className="text-xs text-[#2ECC7A]">Your carbon coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[rgba(245,240,232,0.35)] hover:text-[rgba(245,240,232,0.6)] transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8] transition-colors"
            aria-label="Close Sage"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(46,204,122,0.12)', border: '1px solid rgba(46,204,122,0.2)' }}>
              <Sparkles size={24} color="#2ECC7A" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-[#F5F0E8] mb-1">
              Hi {user.name}! I'm Sage.
            </p>
            <p className="text-xs text-[rgba(245,240,232,0.5)] mb-4">
              Your personal carbon footprint coach. Ask me anything!
            </p>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(46,204,122,0.1)',
                    border: '1px solid rgba(46,204,122,0.15)',
                    color: 'rgba(245,240,232,0.7)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { background: 'rgba(46,204,122,0.2)', color: '#F5F0E8', borderBottomRightRadius: 4 }
                  : { background: 'rgba(26,58,42,0.8)', color: 'rgba(245,240,232,0.9)', borderBottomLeftRadius: 4, border: '1px solid rgba(46,204,122,0.1)' }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex justify-start"
            >
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-1"
                style={{ background: 'rgba(26,58,42,0.8)', border: '1px solid rgba(46,204,122,0.1)', borderBottomLeftRadius: 4 }}
              >
                {[0, 1, 2].map(i => (
                  <m.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#2ECC7A]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(46,204,122,0.1)' }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask Sage anything…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] placeholder:text-[rgba(245,240,232,0.3)] outline-none"
          style={{
            background: 'rgba(26,58,42,0.6)',
            border: '1px solid rgba(46,204,122,0.15)',
          }}
        />
        <m.button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: input.trim() ? '#2ECC7A' : 'rgba(46,204,122,0.2)' }}
          whileHover={input.trim() ? { scale: 1.05 } : {}}
          whileTap={input.trim() ? { scale: 0.95 } : {}}
        >
          <Send size={14} style={{ color: input.trim() ? '#0D1F17' : 'rgba(46,204,122,0.6)' }} />
        </m.button>
      </div>
    </m.div>
  )
}
