"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OnboardingAnswer {
  transport_mode: string;
  commute_km: number;
  commute_days: number;
  annual_flights_short: number;
  annual_flights_long: number;
  monthly_kwh: number;
  renewable_pct: number;
  diet: string;
  meals_out_per_week: number;
  monthly_spend_usd: number;
  recycling_habit: string;
  waste_kg_per_week: number;
  display_name: string;
}

const DEFAULT_ANSWERS: OnboardingAnswer = {
  transport_mode: "car_petrol",
  commute_km: 15,
  commute_days: 5,
  annual_flights_short: 1,
  annual_flights_long: 0,
  monthly_kwh: 300,
  renewable_pct: 0,
  diet: "omnivore",
  meals_out_per_week: 3,
  monthly_spend_usd: 200,
  recycling_habit: "some",
  waste_kg_per_week: 2,
  display_name: "",
};

function OptionButton({ label, icon, selected, onClick }: { label: string; icon: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-150 w-full",
        selected
          ? "border-transparent text-white"
          : "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/5"
      )}
      style={selected ? { background: "linear-gradient(135deg, #34d399, #10b981)", border: "none" } : {}}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
      {selected && <span className="ml-auto text-white/80">✓</span>}
    </motion.button>
  );
}

function SliderInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  unit: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="font-bold" style={{ color: "var(--accent)" }}>
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400"
        aria-label={label}
      />
      <div className="flex justify-between text-xs" style={{ color: "var(--text-dim)" }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

const STEPS = [
  { id: "name", title: "Welcome to Verdant AI 🌿", subtitle: "What shall we call you?" },
  { id: "transport", title: "How do you get around? 🚗", subtitle: "Your main commute mode" },
  { id: "energy", title: "Power your home ⚡", subtitle: "Monthly electricity usage" },
  { id: "food", title: "What's on your plate? 🍽️", subtitle: "Your typical diet" },
  { id: "shopping", title: "Shopping & waste ♻️", subtitle: "Monthly spend and recycling habits" },
];

interface Props {
  onComplete: (answers: OnboardingAnswer) => void;
}

export function OnboardingCardStack({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswer>(DEFAULT_ANSWERS);

  const set = <K extends keyof OnboardingAnswer>(key: K, value: OnboardingAnswer[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const next = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      onComplete(answers);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-40%" : "40%", opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="w-full max-w-md">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              className="flex items-center"
              initial={false}
            >
              <motion.div
                animate={{
                  background: i <= step ? "linear-gradient(135deg, #34d399, #10b981)" : "rgba(255,255,255,0.1)",
                  scale: i === step ? 1.2 : 1,
                }}
                className="h-2.5 w-2.5 rounded-full"
                transition={{ duration: 0.3 }}
              />
              {i < STEPS.length - 1 && (
                <motion.div
                  animate={{ background: i < step ? "var(--accent)" : "rgba(255,255,255,0.1)" }}
                  className="h-0.5 w-12 mx-1"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <div className="text-xs" style={{ color: "var(--text-dim)" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass p-8 w-full"
          >
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {STEPS[step].title}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              {STEPS[step].subtitle}
            </p>

            {/* Step content */}
            {step === 0 && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your first name or nickname"
                  value={answers.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-base outline-none transition-all focus:border-emerald-400/50"
                  style={{ color: "var(--text-primary)" }}
                  aria-label="Your name"
                />
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  EcoCoach will use your name to personalise its advice.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                {[
                  { v: "car_petrol", label: "Petrol/Gas Car", icon: "🚗" },
                  { v: "car_ev", label: "Electric Car", icon: "⚡" },
                  { v: "public_bus", label: "Bus / Metro", icon: "🚌" },
                  { v: "public_train", label: "Train", icon: "🚆" },
                  { v: "cycling", label: "Bicycle", icon: "🚴" },
                  { v: "walking", label: "Walk", icon: "🚶" },
                ].map((o) => (
                  <OptionButton key={o.v} label={o.label} icon={o.icon} selected={answers.transport_mode === o.v} onClick={() => set("transport_mode", o.v)} />
                ))}
                <SliderInput value={answers.commute_km} min={0} max={80} onChange={(v) => set("commute_km", v)} label="One-way commute" unit="km" />
                <SliderInput value={answers.commute_days} min={0} max={7} onChange={(v) => set("commute_days", v)} label="Days per week" unit="days" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <SliderInput value={answers.monthly_kwh} min={50} max={800} step={10} onChange={(v) => set("monthly_kwh", v)} label="Monthly electricity" unit="kWh" />
                <SliderInput value={answers.renewable_pct} min={0} max={100} step={5} onChange={(v) => set("renewable_pct", v)} label="Renewable energy %" unit="%" />
                <SliderInput value={answers.annual_flights_short} min={0} max={20} onChange={(v) => set("annual_flights_short", v)} label="Short-haul flights/yr" unit="flights" />
                <SliderInput value={answers.annual_flights_long} min={0} max={10} onChange={(v) => set("annual_flights_long", v)} label="Long-haul flights/yr" unit="flights" />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {[
                  { v: "omnivore", label: "Omnivore (meat daily)", icon: "🥩" },
                  { v: "flexitarian", label: "Flexitarian (meat sometimes)", icon: "🥗" },
                  { v: "vegetarian", label: "Vegetarian", icon: "🥦" },
                  { v: "vegan", label: "Vegan", icon: "🌱" },
                ].map((o) => (
                  <OptionButton key={o.v} label={o.label} icon={o.icon} selected={answers.diet === o.v} onClick={() => set("diet", o.v)} />
                ))}
                <SliderInput value={answers.meals_out_per_week} min={0} max={21} onChange={(v) => set("meals_out_per_week", v)} label="Meals out per week" unit="meals" />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <SliderInput value={answers.monthly_spend_usd} min={0} max={2000} step={25} onChange={(v) => set("monthly_spend_usd", v)} label="Monthly shopping spend" unit="USD" />
                <div className="space-y-2">
                  <div className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Recycling habits</div>
                  {[
                    { v: "none", label: "None / Minimal", icon: "🗑️" },
                    { v: "some", label: "Some items", icon: "♻️" },
                    { v: "most", label: "Most items", icon: "💚" },
                    { v: "all", label: "Everything possible", icon: "🌍" },
                  ].map((o) => (
                    <OptionButton key={o.v} label={o.label} icon={o.icon} selected={answers.recycling_habit === o.v} onClick={() => set("recycling_habit", o.v)} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {step > 0 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={prev}
            className="rounded-full border px-6 py-3 text-sm font-medium transition-all"
            style={{ borderColor: "var(--border-glass)", color: "var(--text-secondary)" }}
          >
            ← Back
          </motion.button>
        ) : (
          <div />
        )}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="flex-1 rounded-full py-3.5 text-base font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #34d399, #10b981)",
            boxShadow: "0 0 20px rgba(52,211,153,0.3)",
          }}
        >
          {step === STEPS.length - 1 ? "🌿 Calculate My Footprint" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}
