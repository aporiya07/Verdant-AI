"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "@/lib/api-client";
import { OnboardingCardStack, type OnboardingAnswer } from "@/components/onboarding-card-stack";
import { ScoreRing } from "@/components/score-ring";
import { EarthTwin } from "@/components/earth-twin";

type Phase = "quiz" | "loading" | "reveal";

interface RevealData {
  green_score: number;
  grade: string;
  total_annual_kg: number;
  category_breakdown: Record<string, number>;
  carbon_story: string;
  display_name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [error, setError] = useState("");

  const handleComplete = async (answers: OnboardingAnswer) => {
    setPhase("loading");
    setError("");

    try {
      // Ensure we have a token (auto-create demo session if not)
      if (!getToken()) {
        const { access_token } = await api.auth.demo();
        setToken(access_token);
      }

      const result = await api.onboarding.submit(answers as unknown as Record<string, unknown>);
      setRevealData(result);
      setPhase("reveal");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("quiz");
    }
  };

  const scoreToStage = (score: number) => {
    if (score >= 85) return 5;
    if (score >= 70) return 4;
    if (score >= 55) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 70%)",
      }}
    >
      {/* Back to landing */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.push("/")}
        className="fixed left-5 top-5 z-10 flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all hover:bg-white/5"
        style={{ borderColor: "var(--border-glass)", color: "var(--text-secondary)" }}
      >
        ← Back
      </motion.button>

      <AnimatePresence mode="wait">
        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                Carbon DNA™
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                5 questions · 3 minutes · Powered by Gemini
              </p>
            </div>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <OnboardingCardStack onComplete={handleComplete} />
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <EarthTwin stage={3} size={100} breathe={false} />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Analysing your footprint...
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Gemini 3.5 Flash is generating your Carbon Story
              </p>
            </div>
            <div className="flex gap-2">
              {["Calculating CO₂e...", "Generating insights...", "Awakening EarthTwin..."].map((label, i) => (
                <motion.div
                  key={label}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "reveal" && revealData && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8 text-center max-w-sm w-full"
          >
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Welcome, {revealData.display_name || "Eco Explorer"} 🌿
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Your Carbon DNA is ready
              </p>
            </motion.div>

            {/* Score reveal */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
            >
              <ScoreRing
                score={revealData.green_score}
                grade={revealData.grade}
                totalKg={revealData.total_annual_kg}
                categoryBreakdown={revealData.category_breakdown}
                categoryScores={{}}
                size={220}
                animate
              />
            </motion.div>

            {/* EarthTwin awakens */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
            >
              <EarthTwin
                stage={scoreToStage(revealData.green_score)}
                size={80}
                showLabel
                description={`${revealData.total_annual_kg.toLocaleString()} kg CO₂e/yr`}
              />
            </motion.div>

            {/* Carbon Story */}
            {revealData.carbon_story && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="glass px-6 py-4 text-sm leading-relaxed text-left"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--accent)" }}>
                  ✨ Your Carbon Story — Gemini 3.5 Flash
                </div>
                {revealData.carbon_story}
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/home")}
              className="w-full rounded-full py-4 text-base font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981)",
                boxShadow: "0 0 30px rgba(52,211,153,0.35)",
              }}
            >
              Open My Verdant Dashboard →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
