"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { streamCoach } from "@/lib/api-client";

const SUGGESTED_CHIPS = [
  "What's my fastest win? 🚀",
  "How can I cut transport emissions? 🚲",
  "Best food swap for impact? 🥦",
  "Explain my GreenScore 📊",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function FloatingCoach() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your EcoCoach 🌿 I know your full carbon footprint and I'm here to help you reduce it. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setOrbPulse((p) => !p), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      let accumulated = "";
      for await (const chunk of streamCoach(text)) {
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: true };
          return updated;
        });
      }
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: false };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I'm having trouble connecting. Check your internet and try again.",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating orb */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, #34d399, #10b981)",
          boxShadow: open
            ? "0 0 0 4px rgba(52,211,153,0.2), 0 8px 32px rgba(52,211,153,0.4)"
            : "0 0 30px rgba(52,211,153,0.3)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        animate={{ y: orbPulse && !open ? [0, -5, 0] : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open EcoCoach"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? "close" : "leaf"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? "✕" : "🌿"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Coach panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 flex w-80 flex-col overflow-hidden rounded-2xl shadow-2xl md:w-96"
            style={{
              background: "rgba(10,18,16,0.96)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(52,211,153,0.2)",
              height: 480,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full animate-pulse"
                  style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }}
                />
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  EcoCoach™
                </span>
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  Gemini 3.5 Flash
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: "var(--text-dim)" }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, #34d399, #10b981)", color: "#fff" }
                        : { background: "rgba(255,255,255,0.06)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.07)" }
                    }
                  >
                    {msg.content}
                    {msg.streaming && (
                      <span className="ml-1 inline-block h-3 w-0.5 animate-pulse rounded-full bg-current opacity-70" />
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggested chips */}
            {messages.length <= 2 && !streaming && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTED_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => send(chip)}
                    className="rounded-full border px-3 py-1 text-xs transition-all hover:bg-white/10"
                    style={{
                      borderColor: "rgba(52,211,153,0.25)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="flex items-center gap-2 p-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask EcoCoach anything..."
                disabled={streaming}
                className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm outline-none transition-all placeholder:text-white/25"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-primary)",
                }}
                aria-label="Message EcoCoach"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
                aria-label="Send message"
              >
                {streaming ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
