'use client';

import { motion } from 'framer-motion';
import {
  Trophy, Lock, CheckCircle, Zap,
  Leaf, Train, ShoppingBag, Recycle, ClipboardList,
} from 'lucide-react';
import type { UserProfile } from '@/lib/store';

interface GreenQuestProps {
  profile: UserProfile | null;
}

const ALL_ACHIEVEMENTS = [
  { badge: 'Green Starter',       icon: '🌱', desc: 'Earn your first 50 XP',  xpRequired: 50 },
  { badge: 'Energy Saver',        icon: '⚡', desc: 'Reach 200 XP',            xpRequired: 200 },
  { badge: 'Transit Champion',    icon: '🚇', desc: 'Reach 500 XP',            xpRequired: 500 },
  { badge: 'Sustainable Shopper', icon: '🛍️', desc: 'Reach 1,000 XP',         xpRequired: 1000 },
  { badge: 'Climate Hero',        icon: '🌍', desc: 'Reach 3,000 XP',          xpRequired: 3000 },
];

const LEVELS = [
  { name: 'Seed',             minXp: 0,    icon: '🌰', short: 'Seed' },
  { name: 'Sapling',          minXp: 500,  icon: '🌱', short: 'Sapling' },
  { name: 'Forest Guardian',  minXp: 1500, icon: '🌳', short: 'Guardian' },
  { name: 'Earth Protector',  minXp: 3500, icon: '🌿', short: 'Protector' },
  { name: 'Climate Champion', minXp: 7000, icon: '🌍', short: 'Champion' },
];

const XP_GUIDE = [
  { action: 'Complete onboarding', xp: '+50 XP', LucideIcon: CheckCircle },
  { action: 'Log any activity',    xp: '+10 XP', LucideIcon: ClipboardList },
  { action: 'Log transport',       xp: '+10 XP', LucideIcon: Train },
  { action: 'Log food habits',     xp: '+10 XP', LucideIcon: Leaf },
  { action: 'Log shopping',        xp: '+10 XP', LucideIcon: ShoppingBag },
  { action: 'Log waste',           xp: '+10 XP', LucideIcon: Recycle },
];

export default function GreenQuest({ profile }: GreenQuestProps) {
  const xp       = profile?.total_xp ?? 0;
  const unlocked = new Set(profile?.achievements ?? []);

  const currentLevelIdx = [...LEVELS].reverse().findIndex((l) => xp >= l.minXp);
  const currentLevel    = LEVELS[LEVELS.length - 1 - currentLevelIdx] || LEVELS[0];
  const nextLevel       = LEVELS[LEVELS.length - currentLevelIdx]     || null;
  const progressToNext  = nextLevel
    ? Math.min(100, ((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100)
    : 100;

  const currentLevelPosition = LEVELS.findIndex((l) => l.name === currentLevel.name);

  return (
    <div>
      {/* Section header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div className="icon-box icon-box-lg icon-box-amber">
          <Trophy size={22} strokeWidth={2} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#0f172a', lineHeight: 1.25, marginBottom: '0.35rem' }}>
            GreenQuest™
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>
            Earn XP by logging activities and completing sustainability goals. Level up your impact!
          </p>
        </div>
      </div>

      {/* ── Level timeline card ── */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <p style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
          color: '#0f172a', marginBottom: '1.75rem',
        }}>
          Level Journey
        </p>

        {/* Stepper */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          {/* Connector line background */}
          <div style={{
            position: 'absolute',
            top: 17,
            left: '5%',
            right: '5%',
            height: 3,
            background: '#e2e8f0',
            borderRadius: 2,
            zIndex: 0,
          }} />
          {/* Connector line fill */}
          <motion.div
            animate={{ width: `${(currentLevelPosition / (LEVELS.length - 1)) * 90}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 17,
              left: '5%',
              height: 3,
              background: 'linear-gradient(90deg, #10b981, #0ea5e9)',
              borderRadius: 2,
              zIndex: 0,
            }}
          />

          {LEVELS.map((level, i) => {
            const isCompleted = i < currentLevelPosition;
            const isActive    = i === currentLevelPosition;
            return (
              <div key={level.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, zIndex: 1 }}>
                <motion.div
                  className={`level-step ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <span style={{ fontSize: '1rem' }}>{level.icon}</span>
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#059669' : isCompleted ? '#10b981' : '#94a3b8',
                    lineHeight: 1.3,
                  }}>
                    {level.short}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#c4cdd6', marginTop: '0.15rem' }}>
                    {level.minXp === 0 ? 'Start' : `${level.minXp} XP`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current level info */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.04))',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '2.25rem', lineHeight: 1 }}
            >
              {currentLevel.icon}
            </motion.span>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                {currentLevel.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{xp} XP total</div>
            </div>
          </div>
          {nextLevel ? (
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <div style={{ height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #0ea5e9)', borderRadius: 4 }}
                />
              </div>
              <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.35rem', textAlign: 'right' }}>
                {nextLevel.minXp - xp} XP to {nextLevel.name}
              </p>
            </div>
          ) : (
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>🎉 Max level reached!</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* ── Achievements ── */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1.25rem' }}>
            Achievements
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ALL_ACHIEVEMENTS.map((ach) => {
              const earned = unlocked.has(ach.badge);
              return (
                <motion.div
                  key={ach.badge}
                  className={`achievement-card ${earned ? 'earned' : ''}`}
                  whileHover={{ x: earned ? 4 : 2 }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    background: earned ? 'rgba(16,185,129,0.12)' : '#f1f5f9',
                    filter: earned ? 'none' : 'grayscale(1)',
                    flexShrink: 0,
                  }}>
                    {ach.icon}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: earned ? '#065f46' : '#374151', lineHeight: 1.3 }}>
                      {ach.badge}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.1rem' }}>{ach.desc}</div>
                  </div>
                  {/* Status */}
                  {earned ? (
                    <CheckCircle size={18} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                      <Lock size={13} color="#c4cdd6" strokeWidth={2} />
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{ach.xpRequired} XP</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── XP Guide ── */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div className="icon-box icon-box-amber" style={{ width: 32, height: 32, borderRadius: 8 }}>
              <Zap size={15} strokeWidth={2.5} />
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              How to Earn XP
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {XP_GUIDE.map(({ action, xp: xpLabel, LucideIcon }, i) => (
              <div
                key={action}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.7rem 0',
                  borderBottom: i < XP_GUIDE.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#374151' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <LucideIcon size={13} color="#64748b" strokeWidth={2} />
                  </div>
                  {action}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#059669',
                  background: 'rgba(16,185,129,0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 999,
                  flexShrink: 0,
                }}>
                  {xpLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
