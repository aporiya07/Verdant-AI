'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Leaf } from 'lucide-react';
import { api } from '@/lib/api';
import { useVerdantStore } from '@/lib/store';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_PROMPTS = [
  'How can I reduce my footprint?',
  'Is an EV better than cycling?',
  'Sustainable eating tips?',
  'Green home energy?',
];

/* Avatar icon for the bot */
function BotAvatar() {
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Leaf size={16} color="white" strokeWidth={2.5} />
    </div>
  );
}

/* 3-dot typing indicator */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.5rem', alignItems: 'flex-end' }}>
      <BotAvatar />
      <div style={{
        padding: '0.7rem 1rem',
        borderRadius: '16px 16px 16px 4px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        minWidth: 56,
      }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

export default function EcoCoach() {
  const { profile } = useVerdantStore();
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Hi! I'm EcoCoach 🌿 I'm here to help you live more sustainably. What would you like to know?` },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res: any = await api.askCoach(text.trim());
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I had trouble connecting. Please try again 🌱' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating pill button ── */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          height: 50,
          paddingLeft: '1.1rem',
          paddingRight: '1.1rem',
          borderRadius: 999,
          background: open
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10b981, #0ea5e9)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: open
            ? '0 8px 24px rgba(239,68,68,0.35)'
            : '0 8px 28px rgba(16,185,129,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          color: 'white',
          zIndex: 1000,
          transition: 'background 0.25s ease, box-shadow 0.25s ease',
          whiteSpace: 'nowrap',
        }}
        title={open ? 'Close EcoCoach' : 'Open EcoCoach'}
      >
        {open ? (
          <>
            <X size={16} strokeWidth={2.5} />
            Close
          </>
        ) : (
          <>
            <Leaf size={16} strokeWidth={2.5} />
            EcoCoach
          </>
        )}
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '6rem',
              right: '2rem',
              width: 380,
              maxHeight: 540,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 22,
              boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 999,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #f0fdf4, #e0f2fe)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ position: 'relative' }}>
                <BotAvatar />
                {/* Online dot */}
                <div className="online-dot" style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  EcoCoach
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Powered by Gemini · Always here
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: '1px solid #e2e8f0',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#94a3b8',
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '0.5rem',
                    alignItems: 'flex-end',
                  }}
                >
                  {msg.role === 'assistant' && <BotAvatar />}
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.7rem 1rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : '#f8fafc',
                    color: msg.role === 'user' ? 'white' : '#0f172a',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 14px rgba(16,185,129,0.25)'
                      : '0 1px 4px rgba(0,0,0,0.04)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts — shown only on first open */}
            {messages.length < 2 && (
              <div style={{
                padding: '0 1rem 0.5rem',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: 999,
                      border: '1px solid #d1fae5',
                      background: '#f0fdf4',
                      color: '#059669',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              background: 'white',
            }}>
              <input
                className="input"
                style={{ flex: 1, padding: '0.6rem 0.9rem', fontSize: '0.875rem' }}
                placeholder="Ask anything about sustainability..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
              />
              <button
                className="btn-primary"
                style={{
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.875rem',
                  minWidth: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
              >
                <Send size={15} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
