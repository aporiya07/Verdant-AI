"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api-client";
import { ScoreRing } from "@/components/score-ring";
import { EarthTwin } from "@/components/earth-twin";
import { FloatingCoach } from "@/components/floating-coach";
import { GlassCard } from "@/components/glass-card";
import { FutureCastSheet } from "@/components/futurecast-sheet";
import { categoryEmoji, formatKg } from "@/lib/utils";

interface HomeData {
  display_name: string;
  green_score: number;
  grade: string;
  total_annual_kg: number;
  category_breakdown: Record<string, number>;
  category_scores: Record<string, number>;
  carbon_story: string;
  weekly_actions: { label: string; category: string; impact: string }[];
  streak_days: number;
  hero_insight: { greeting: string; insight: string };
  hidden_impact: { title: string; insight: string; action: string; savings_kg: number };
  earth_twin: { stage: number; label: string; description: string };
}

const QUICK_CHIPS = [
  { label: "🚴 Bike today", field: "transport_mode", value: "cycling" },
  { label: "🌱 Go vegan Mon", field: "diet", value: "vegan" },
  { label: "♻️ Recycle more", field: "recycling_habit", value: "most" },
  { label: "💡 Save energy", field: "monthly_kwh", value: 200 },
];

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustingChip, setAdjustingChip] = useState<string | null>(null);
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const [previewBreakdown, setPreviewBreakdown] = useState<Record<string, number> | null>(null);
  const [futureCastOpen, setFutureCastOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }
    loadHome();
  }, []);

  const loadHome = async () => {
    setLoading(true);
    try {
      const result = await api.home.get();
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      if (msg.includes("onboarding") || msg.includes("not found")) {
        router.replace("/onboarding");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChipAdjust = async (field: string, value: string | number, label: string) => {
    setAdjustingChip(label);
    try {
      const result = await api.home.adjust(field, value);
      setData((prev) =>
        prev
          ? {
              ...prev,
              green_score: result.green_score,
              grade: result.grade,
              total_annual_kg: result.total_annual_kg,
              category_breakdown: result.category_breakdown,
              earth_twin: { ...prev.earth_twin, stage: result.earth_twin_stage },
            }
          : prev
      );
    } catch {}
    finally {
      setAdjustingChip(null);
    }
  };

  const scoreToStage = (score: number) => {
    if (score >= 85) return 5;
    if (score >= 70) return 4;
    if (score >= 55) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <EarthTwin stage={3} size={80} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass max-w-sm p-8 text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button
            onClick={loadHome}
            className="rounded-full px-6 py-2.5 text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const displayScore = previewScore ?? data.green_score;
  const displayBreakdown = previewBreakdown ?? data.category_breakdown;
  const displayStage = scoreToStage(displayScore);

  return (
    <main className="relative min-h-screen pb-28">
      {/* Header / Nav */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(5,8,7,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            Verdant AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          {data.streak_days > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}
            >
              🔥 {data.streak_days} day{data.streak_days !== 1 ? "s" : ""}
            </motion.div>
          )}
          <button
            onClick={() => router.push("/onboarding")}
            className="rounded-full border px-3 py-1 text-xs transition-all hover:bg-white/5"
            style={{ borderColor: "var(--border-glass)", color: "var(--text-secondary)" }}
          >
            Retake DNA
          </button>
        </div>
      </motion.header>

      <div className="mx-auto max-w-lg px-5 pt-6 space-y-5">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {data.hero_insight ? (
            <div>
              <h1 className="text-xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                {data.hero_insight.greeting}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {data.hero_insight.insight}
              </p>
            </div>
          ) : (
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome back, {data.display_name} 🌿
            </h1>
          )}
        </motion.div>

        {/* Score Ring + EarthTwin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 22 }}
          className="glass p-6 flex flex-col items-center gap-5"
        >
          <ScoreRing
            score={displayScore}
            grade={data.grade}
            totalKg={data.total_annual_kg}
            categoryBreakdown={displayBreakdown}
            categoryScores={data.category_scores}
            size={220}
            animate={!previewScore}
          />
          <AnimatePresence mode="wait">
            <EarthTwin
              key={displayStage}
              stage={displayStage}
              size={72}
              showLabel
              description={data.earth_twin.description}
            />
          </AnimatePresence>

          {/* Category score pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {Object.entries(displayBreakdown).map(([cat, kg]) => (
              <motion.div
                key={cat}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span>{categoryEmoji(cat)}</span>
                <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{cat}</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatKg(kg)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Carbon Story */}
        {data.carbon_story && (
          <GlassCard delay={0.3} glow>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--accent)" }}>
              ✨ Your Carbon Story — Gemini 3.5 Flash
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {data.carbon_story}
            </p>
          </GlassCard>
        )}

        {/* Hidden Impact Card */}
        {data.hidden_impact && (
          <GlassCard delay={0.4} hover>
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">💡</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {data.hidden_impact.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {data.hidden_impact.insight}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs rounded-full px-2.5 py-0.5" style={{ background: "rgba(52,211,153,0.1)", color: "var(--accent)" }}>
                    Action: {data.hidden_impact.action}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                    ~{data.hidden_impact.savings_kg} kg/yr saved
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Weekly actions */}
        {data.weekly_actions?.length > 0 && (
          <GlassCard delay={0.5}>
            <div className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              This Week · {data.weekly_actions.length} Actions
            </div>
            <div className="space-y-2.5">
              {data.weekly_actions.map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{categoryEmoji(action.category)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {action.label}
                    </div>
                    <div className="text-xs" style={{ color: "var(--accent)" }}>
                      {action.impact}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Quick adjust chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
            Quick Adjustments
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <motion.button
                key={chip.label}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChipAdjust(chip.field, chip.value, chip.label)}
                disabled={adjustingChip === chip.label}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-60"
                style={{
                  borderColor: "rgba(52,211,153,0.25)",
                  color: "var(--text-secondary)",
                  background: adjustingChip === chip.label ? "rgba(52,211,153,0.08)" : "transparent",
                }}
              >
                {adjustingChip === chip.label ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    Updating...
                  </span>
                ) : (
                  chip.label
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FutureCast CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFutureCastOpen(true)}
          className="w-full glass flex items-center justify-center gap-3 py-4 text-base font-semibold transition-all"
          style={{ borderColor: "rgba(52,211,153,0.2)", color: "var(--accent)" }}
        >
          <span>🔮</span>
          <span>FutureCast — Simulate Your Impact</span>
          <span style={{ color: "var(--text-dim)" }}>→</span>
        </motion.button>
      </div>

      {/* Floating EcoCoach */}
      <FloatingCoach />

      {/* FutureCast bottom sheet */}
      <FutureCastSheet
        open={futureCastOpen}
        onClose={() => {
          setFutureCastOpen(false);
          setPreviewScore(null);
          setPreviewBreakdown(null);
        }}
        currentScore={data.green_score}
        currentKg={data.total_annual_kg}
        onScorePreview={(score, breakdown) => {
          setPreviewScore(score);
          setPreviewBreakdown(breakdown);
        }}
      />
    </main>
  );
}
