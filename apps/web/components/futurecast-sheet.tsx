"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-client";
import { formatKg } from "@/lib/utils";

interface Preset {
  id: string;
  title: string;
  icon: string;
  field: string;
  value: string | number;
  label: string;
}

interface FutureCastSheetProps {
  open: boolean;
  onClose: () => void;
  currentScore: number;
  currentKg: number;
  onScorePreview?: (score: number, breakdown: Record<string, number>) => void;
}

export function FutureCastSheet({ open, onClose, currentScore, currentKg, onScorePreview }: FutureCastSheetProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [customSlider, setCustomSlider] = useState<number>(5);
  const [whisper, setWhisper] = useState("");
  const [result, setResult] = useState<{ savings_kg: number; savings_pct: number; projected_score: number; projected_grade: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.futurecast.presets().then((r) => setPresets(r.presets)).catch(() => {});
  }, []);

  const runSimulation = useCallback(async (preset: Preset, value?: string | number) => {
    setLoading(true);
    try {
      const r = await api.futurecast.whisper(
        preset.field,
        value ?? preset.value,
        preset.label,
      );
      setResult({ savings_kg: r.savings_kg, savings_pct: r.savings_pct, projected_score: r.projected_score, projected_grade: r.projected_grade });
      setWhisper(r.whisper);
      onScorePreview?.(r.projected_score, r.category_breakdown);
    } catch {
      setWhisper("Unable to load prediction. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [onScorePreview]);

  const handlePresetSelect = async (preset: Preset) => {
    setSelectedPreset(preset);
    setResult(null);
    setWhisper("");
    await runSimulation(preset);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl p-6 pb-10"
            style={{
              background: "rgba(8,16,12,0.97)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(52,211,153,0.15)",
              borderBottom: "none",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {/* Handle */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  🔮 FutureCast™
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Simulate lifestyle changes before making them
                </p>
              </div>
              <button onClick={onClose} style={{ color: "var(--text-dim)" }}>✕</button>
            </div>

            {/* Current vs Projected */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass mb-5 p-4"
              >
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "var(--text-dim)" }}>Current</div>
                    <div className="text-2xl font-bold" style={{ color: "var(--text-secondary)" }}>{currentScore}</div>
                    <div className="text-xs">{formatKg(currentKg)}/yr</div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl"
                  >
                    →
                  </motion.div>
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "var(--text-dim)" }}>Projected</div>
                    <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{result.projected_score}</div>
                    <div className="text-xs" style={{ color: "var(--accent)" }}>
                      -{formatKg(result.savings_kg)}/yr ({result.savings_pct.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gemini whisper */}
            <AnimatePresence>
              {whisper && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 glass px-4 py-3 text-sm italic"
                  style={{ borderColor: "rgba(52,211,153,0.2)", color: "var(--accent)" }}
                >
                  ✨ {whisper}
                </motion.div>
              )}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-5 flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-dim)" }}
                >
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  Gemini is calculating your impact...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preset scenarios */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
                Preset Scenarios
              </div>
              {presets.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full glass flex items-center gap-3 px-4 py-3 text-left transition-all"
                  style={
                    selectedPreset?.id === preset.id
                      ? { borderColor: "rgba(52,211,153,0.4)", background: "rgba(52,211,153,0.06)" }
                      : {}
                  }
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{preset.title}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{preset.label}</div>
                  </div>
                  {selectedPreset?.id === preset.id && (
                    <span className="ml-auto text-emerald-400">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
