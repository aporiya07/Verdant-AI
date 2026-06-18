'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number; // 0–100
  grade: string;
  label?: string;
  size?: number;
}

export default function ScoreRing({ score, grade, label = 'GreenScore', size = 180 }: ScoreRingProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const gradeColors: Record<string, string> = {
    'A+': '#10b981',
    'A': '#34d399',
    'B': '#0ea5e9',
    'C': '#f59e0b',
    'D': '#f97316',
    'F': '#ef4444',
  };
  const color = gradeColors[grade] || '#10b981';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={12}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      </svg>
      {/* Inner content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4, type: 'spring' }}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: size * 0.22,
            color,
            lineHeight: 1,
          }}
        >
          {grade}
        </motion.div>
        <div style={{ fontSize: size * 0.075, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
          {score}/100
        </div>
        <div style={{ fontSize: size * 0.065, color: '#94a3b8', marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}
