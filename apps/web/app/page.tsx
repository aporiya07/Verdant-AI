"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api-client";
import { EarthTwinPreview } from "@/components/earth-twin";

const FEATURES = [
  { icon: "🧬", name: "Carbon DNA™", desc: "5-question lifestyle analysis" },
  { icon: "💚", name: "GreenScore™", desc: "Real-time sustainability rating" },
  { icon: "🔍", name: "ImpactLens™", desc: "Hidden emission insights" },
  { icon: "🤖", name: "EcoCoach™", desc: "Gemini-powered AI advisor" },
  { icon: "🔮", name: "FutureCast™", desc: "Carbon reduction simulator" },
  { icon: "🌍", name: "EarthTwin™", desc: "Your living eco-avatar" },
];

export default function Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -60]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const handleDemo = async () => {
    setLoading(true);
    try {
      const { access_token } = await api.auth.demo();
      setToken(access_token);
      // Check if demo user already has a profile
      const me = await api.auth.me();
      router.push(me.has_onboarded ? "/home" : "/onboarding");
    } catch {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Dynamic background orbs */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-transform duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${40 + mousePos.x * 20}% ${30 + mousePos.y * 20}%, rgba(52,211,153,0.10) 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${4 + i * 3}px`,
            height: `${4 + i * 3}px`,
            left: `${10 + i * 11}%`,
            top: `${20 + ((i * 17) % 60)}%`,
            "--duration": `${3 + i * 0.7}s`,
            "--delay": `${i * 0.4}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
            Verdant AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/onboarding")}
            className="text-sm px-4 py-2 rounded-full border transition-all duration-200 hover:bg-white/5"
            style={{ borderColor: "var(--border-glass)", color: "var(--text-secondary)" }}
          >
            Register
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center md:pt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          <EarthTwinPreview stage={3} size={120} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            <span style={{ color: "var(--text-primary)" }}>Know Your </span>
            <span
              className="glow-text"
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #6ee7b7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Carbon.
            </span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>Change Your </span>
            <span
              style={{
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              World.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          5-minute Carbon DNA analysis. AI-powered insights. A living EarthTwin that evolves
          as you reduce your footprint. Powered by Gemini 3.5 Flash.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDemo}
            disabled={loading}
            className="relative overflow-hidden rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              boxShadow: "0 0 30px rgba(52,211,153,0.4)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Entering...
              </span>
            ) : (
              "✨ Try Demo — No Signup"
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/onboarding")}
            className="rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 glass"
            style={{ color: "var(--accent)" }}
          >
            Start Carbon DNA →
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 text-xs"
          style={{ color: "var(--text-dim)" }}
        >
          Individual / Eco-conscious consumer · Hack2Skill PromptWars 2026
        </motion.p>
      </motion.section>

      {/* Feature Grid */}
      <section className="relative z-10 px-6 pb-24 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--text-primary)" }}>
            7 AI modules. One coherent experience.
          </h2>
          <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
            Gemini 3.5 Flash powers every insight, recommendation, and simulation.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="glass p-5 text-center cursor-default"
            >
              <div className="mb-2 text-3xl">{f.icon}</div>
              <div className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                {f.name}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack footer */}
      <footer
        className="relative z-10 border-t px-6 py-8 text-center text-xs"
        style={{ borderColor: "var(--border-glass)", color: "var(--text-dim)" }}
      >
        <p>
          Built with{" "}
          <span style={{ color: "var(--accent)" }}>
            Next.js · FastAPI · Supabase · Gemini 3.5 Flash · GCP Cloud Run
          </span>
        </p>
        <p className="mt-1">
          Emission estimates use simplified DEFRA/EPA factors — for educational purposes only.
        </p>
      </footer>
    </main>
  );
}
