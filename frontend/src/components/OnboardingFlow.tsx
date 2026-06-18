'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, BrainCircuit, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useVerdantStore } from '@/lib/store';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Verdant AI',
    subtitle: 'Your personal AI sustainability coach. Let\'s build your Carbon DNA profile to get started.',
  },
  {
    id: 'transport',
    title: 'How do you get around?',
    subtitle: 'Your primary mode of daily transportation.',
    options: [
      { value: 'car_petrol',   label: 'Petrol Car',      icon: '🚗' },
      { value: 'car_electric', label: 'Electric Car',     icon: '⚡' },
      { value: 'bike',         label: 'Bicycle / E-Bike', icon: '🚲' },
      { value: 'train',        label: 'Train / Metro',    icon: '🚇' },
      { value: 'bus',          label: 'Bus',              icon: '🚌' },
      { value: 'walking',      label: 'Walking',          icon: '🚶' },
    ],
  },
  {
    id: 'food',
    title: 'What\'s your diet like?',
    subtitle: 'Food production is a major source of emissions.',
    options: [
      { value: 'vegan',              label: 'Vegan',           icon: '🌿' },
      { value: 'vegetarian',         label: 'Vegetarian',      icon: '🥗' },
      { value: 'pescatarian',        label: 'Pescatarian',     icon: '🐟' },
      { value: 'omnivore_low_meat',  label: 'Occasional Meat', icon: '🥩' },
      { value: 'omnivore_high_meat', label: 'Meat-Heavy',      icon: '🍔' },
    ],
  },
  {
    id: 'energy',
    title: 'How do you power your home?',
    subtitle: 'Energy use is one of the biggest footprint contributors.',
    options: [
      { value: 'kwh_renewable', label: 'Renewable Energy',  icon: '☀️' },
      { value: 'kwh_mixed',     label: 'Mixed Grid',        icon: '⚡' },
      { value: 'kwh_coal',      label: 'Coal-Heavy Grid',   icon: '🏭' },
    ],
  },
  {
    id: 'shopping',
    title: 'How do you shop?',
    subtitle: 'Your consumption habits affect your footprint.',
    options: [
      { value: 'minimal',  label: 'Minimalist — buy only what I need', icon: '✨' },
      { value: 'moderate', label: 'Moderate — occasional purchases',   icon: '🛍️' },
      { value: 'frequent', label: 'Frequent shopper',                  icon: '📦' },
    ],
  },
  {
    id: 'waste',
    title: 'How do you handle waste?',
    subtitle: 'Recycling and composting can significantly reduce emissions.',
    options: [
      { value: 'high_recycle', label: 'I recycle & compost actively', icon: '♻️' },
      { value: 'some_recycle', label: 'I recycle sometimes',           icon: '🗑️' },
      { value: 'no_recycle',   label: 'I don\'t really recycle',       icon: '📭' },
    ],
  },
  {
    id: 'complete',
    title: 'Your Carbon DNA is ready!',
    subtitle: 'Great choices! Let\'s discover your sustainability score and start your journey.',
  },
];

const FEATURES = [
  { Icon: BarChart2,    label: 'Carbon Tracking', desc: 'Measure every action', color: 'icon-box-green' },
  { Icon: BrainCircuit, label: 'AI Coaching',     desc: 'Powered by Gemini',    color: 'icon-box-blue' },
  { Icon: Trophy,       label: 'Gamification',    desc: 'Earn XP & badges',     color: 'icon-box-amber' },
  { Icon: TrendingUp,   label: 'Predictions',     desc: 'See your impact trend', color: 'icon-box-purple' },
];

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
};

/* Sprout SVG logo illustration */
function SproutLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="16" fill="url(#sproutBg)" />
      <path d="M26 40 Q26 28 26 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 30 Q18 24 13 27 Q18 34 26 30Z" fill="white" opacity="0.9" />
      <path d="M26 24 Q34 18 39 21 Q34 28 26 24Z" fill="white" />
      <path d="M26 20 Q22 12 24 8 Q30 12 26 20Z" fill="white" opacity="0.8" />
      <defs>
        <linearGradient id="sproutBg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Success check SVG */
function SuccessCircle() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="url(#successBg)" opacity="0.12" />
      <circle cx="40" cy="40" r="30" fill="url(#successBg)" opacity="0.18" />
      <circle cx="40" cy="40" r="22" fill="url(#successBg)" />
      <path d="M28 40 L36 48 L52 32" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="successBg" x1="2" y1="2" x2="78" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { setProfile, setScore, setOnboardingComplete } = useVerdantStore();

  const currentStep = STEPS[step];
  const totalDataSteps = STEPS.length - 2; // exclude welcome & complete
  const dataStepIndex = step - 1; // 0-based index among data steps

  const handleSelect = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === STEPS.length - 2) {
      setLoading(true);
      try {
        const dnaPayload = {
          transport: answers.transport || 'car_petrol',
          food:      answers.food      || 'omnivore_low_meat',
          energy:    answers.energy    || 'kwh_mixed',
          shopping:  answers.shopping  || 'moderate',
          waste:     answers.waste     || 'some_recycle',
        };
        const profile: any = await api.saveCarbonDna(dnaPayload);
        setProfile(profile);
        await api.logCarbon({ category: 'transport', details: { mode: dnaPayload.transport, km_per_day: 15 } });
        await api.logCarbon({ category: 'food',      details: { diet_type: dnaPayload.food } });
        await api.logCarbon({ category: 'energy',    details: { kwh_per_month: 300, energy_source: dnaPayload.energy } });
        const score: any = await api.getScore();
        setScore(score);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleComplete = () => setOnboardingComplete(true);

  const isWelcome  = currentStep.id === 'welcome';
  const isComplete = currentStep.id === 'complete';
  const hasOptions = !!currentStep.options;
  const currentAnswer = answers[currentStep.id];
  const canProceed = isWelcome || isComplete || !!currentAnswer;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      {/* ── Logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}
      >
        <SproutLogo />
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '1.4rem',
          background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Verdant AI
        </span>
      </motion.div>

      {/* ── Progress bar + step dots ── */}
      {!isWelcome && (
        <div style={{ width: '100%', maxWidth: 520, marginBottom: '1.5rem' }}>
          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(dataStepIndex / totalDataSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #0ea5e9)',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            {Array.from({ length: totalDataSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === dataStepIndex ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i < dataStepIndex
                    ? 'linear-gradient(90deg, #10b981, #0ea5e9)'
                    : i === dataStepIndex
                      ? 'linear-gradient(90deg, #10b981, #0ea5e9)'
                      : '#e2e8f0',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
            Step {dataStepIndex + 1} of {totalDataSteps}
          </p>
        </div>
      )}

      {/* ── Card ── */}
      <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: '2.5rem', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Step header */}
            <div style={{ marginBottom: hasOptions ? '1.75rem' : '0', textAlign: isWelcome || isComplete ? 'center' : 'left' }}>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '1.55rem',
                color: '#0f172a',
                marginBottom: '0.6rem',
                lineHeight: 1.3,
              }}>
                {currentStep.title}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.65 }}>
                {currentStep.subtitle}
              </p>
            </div>

            {/* Welcome screen — feature grid */}
            {isWelcome && (
              <div style={{ margin: '2rem 0' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.85rem',
                }}>
                  {FEATURES.map(({ Icon, label, desc, color }) => (
                    <div key={label} style={{
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}>
                      <div className={`icon-box ${color}`}>
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.1rem' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Option buttons */}
            {hasOptions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
                {currentStep.options!.map((opt) => {
                  const isSelected = currentAnswer === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(currentStep.id, opt.value)}
                    >
                      <span style={{
                        fontSize: '1.25rem',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? 'rgba(16,185,129,0.15)' : '#f1f5f9',
                        borderRadius: 8,
                        flexShrink: 0,
                      }}>
                        {opt.icon}
                      </span>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {isSelected && (
                        <CheckCircle2 size={18} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Complete screen */}
            {isComplete && (
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ display: 'inline-block', marginBottom: '1rem' }}
                >
                  <SuccessCircle />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 1rem',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 999,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#b45309',
                    marginBottom: '0.5rem',
                  }}>
                    🎉 +50 XP earned!
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Your Carbon DNA profile is all set.
                  </p>
                </motion.div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: isWelcome || isComplete ? 'center' : 'space-between',
              marginTop: isWelcome ? '0' : undefined,
            }}>
              {!isWelcome && !isComplete && (
                <button className="btn-secondary" onClick={handleBack} style={{ flex: 1 }}>
                  ← Back
                </button>
              )}
              {!isComplete ? (
                <button
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!canProceed || loading}
                  style={{ flex: isWelcome ? undefined : 2, minWidth: 148 }}
                >
                  {loading
                    ? 'Calculating...'
                    : isWelcome
                      ? 'Get Started →'
                      : step === STEPS.length - 2
                        ? 'Calculate Score →'
                        : 'Continue →'}
                </button>
              ) : (
                <button className="btn-primary" onClick={handleComplete} style={{ minWidth: 200 }}>
                  Open My Dashboard 🚀
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
