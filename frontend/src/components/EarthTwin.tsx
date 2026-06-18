'use client';

import { motion } from 'framer-motion';

interface EarthTwinProps {
  score: number; // 0–100
  level: number;
}

const STATES = [
  { minScore: 0,  emoji: '🏭', bg: '#fef2f2', ring: '#fca5a5', badge: { label: 'Needs Work',  bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' } },
  { minScore: 25, emoji: '🌫️', bg: '#fefce8', ring: '#fde68a', badge: { label: 'Developing',  bg: '#fefce8', border: '#fde68a', text: '#d97706' } },
  { minScore: 45, emoji: '🌱', bg: '#f0fdf4', ring: '#86efac', badge: { label: 'Growing',      bg: '#f0fdf4', border: '#86efac', text: '#16a34a' } },
  { minScore: 65, emoji: '🌳', bg: '#d1fae5', ring: '#6ee7b7', badge: { label: 'Thriving',     bg: '#d1fae5', border: '#6ee7b7', text: '#059669' } },
  { minScore: 85, emoji: '🌍', bg: '#a7f3d0', ring: '#34d399', badge: { label: 'Flourishing',  bg: '#a7f3d0', border: '#34d399', text: '#047857' } },
];

function getState(score: number) {
  return [...STATES].reverse().find((s) => score >= s.minScore) || STATES[0];
}

/* Concentric rings decoration */
function ConcentricRings({ color }: { color: string }) {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
    >
      <circle cx="90" cy="90" r="80" stroke={color} strokeWidth="1.5" opacity="0.18" />
      <circle cx="90" cy="90" r="62" stroke={color} strokeWidth="1.5" opacity="0.25" />
      <circle cx="90" cy="90" r="44" stroke={color} strokeWidth="2"   opacity="0.3"  />
    </svg>
  );
}

export default function EarthTwin({ score, level }: EarthTwinProps) {
  const state = getState(score);

  return (
    <div style={{
      background: state.bg,
      borderRadius: 20,
      padding: '1.75rem',
      textAlign: 'center',
      border: `1px solid ${state.ring}55`,
      transition: 'background 0.8s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Label */}
      <p style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#64748b',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        EarthTwin™
      </p>

      {/* Rings + emoji container */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
        <ConcentricRings color={state.ring} />
        <motion.div
          key={state.emoji}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '4.5rem', lineHeight: 1, display: 'inline-block', padding: '1.5rem 1rem' }}
          >
            {state.emoji}
          </motion.div>
        </motion.div>
      </div>

      {/* State badge */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <span style={{
          padding: '0.3rem 0.9rem',
          borderRadius: 999,
          fontSize: '0.8rem',
          fontWeight: 700,
          background: state.badge.bg,
          border: `1.5px solid ${state.badge.border}`,
          color: state.badge.text,
          boxShadow: `0 0 0 3px ${state.badge.border}44`,
        }}>
          {state.badge.label}
        </span>
      </div>

      {/* Score bar */}
      <div style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
          <span>0</span>
          <span style={{ fontWeight: 600, color: state.badge.text }}>{score}/100</span>
          <span>100</span>
        </div>
        <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${state.ring}, ${state.badge.border})`,
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Level indicator */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.22)',
        borderRadius: 999,
        padding: '0.3rem 0.9rem',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#059669',
      }}>
        <span>⭐</span>
        <span>Level {level}</span>
      </div>
    </div>
  );
}
