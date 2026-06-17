"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gradeColor, categoryEmoji, formatKg } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#f97316",
  energy: "#facc15",
  food: "#4ade80",
  shopping: "#a78bfa",
  waste: "#38bdf8",
};

interface ScoreRingProps {
  score: number;
  grade: string;
  totalKg: number;
  categoryBreakdown: Record<string, number>;
  categoryScores: Record<string, number>;
  size?: number;
  animate?: boolean;
  onSegmentClick?: (category: string) => void;
}

export function ScoreRing({
  score,
  grade,
  totalKg,
  categoryBreakdown,
  categoryScores,
  size = 240,
  animate = true,
  onSegmentClick,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(animate ? 0 : score);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setAnimatedScore(score);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    const from = 0;
    const to = score;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score, animate]);

  const center = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR - 28;
  const circumference = 2 * Math.PI * outerR;

  // Build arc segments for each category
  const categories = Object.keys(categoryBreakdown);
  const totalEmissions = Math.max(Object.values(categoryBreakdown).reduce((a, b) => a + b, 0), 1);

  let runningAngle = -90; // start at top
  const segments = categories.map((cat) => {
    const share = categoryBreakdown[cat] / totalEmissions;
    const angleDeg = share * 360;
    const startAngle = runningAngle;
    runningAngle += angleDeg;
    return { cat, startAngle, angleDeg, share };
  });

  const polarToXY = (cx: number, cy: number, r: number, angleDeg: number) => ({
    x: cx + r * Math.cos((angleDeg * Math.PI) / 180),
    y: cy + r * Math.sin((angleDeg * Math.PI) / 180),
  });

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number, innerR: number) => {
    const start = polarToXY(cx, cy, r, startDeg);
    const end = polarToXY(cx, cy, r, endDeg);
    const iStart = polarToXY(cx, cy, innerR, endDeg);
    const iEnd = polarToXY(cx, cy, innerR, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${iStart.x} ${iStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iEnd.x} ${iEnd.y}`,
      "Z",
    ].join(" ");
  };

  // Main score arc (green ring)
  const scoreArc = (animatedScore / 100) * circumference;
  const gradeCol = gradeColor(grade);
  const activeCat = hoveredCat || selectedCat;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
        {/* Outer glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="segment-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring */}
        <circle
          cx={center} cy={center} r={outerR}
          fill="none" stroke="var(--ring-track)" strokeWidth="28" opacity="0.6"
        />

        {/* Score arc */}
        <motion.circle
          cx={center} cy={center} r={outerR}
          fill="none"
          stroke={gradeCol}
          strokeWidth="28"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - scoreArc }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformOrigin: `${center}px ${center}px`, rotate: "-90deg", filter: `drop-shadow(0 0 8px ${gradeCol}80)` }}
        />

        {/* Category segments (inner ring) */}
        {segments.map(({ cat, startAngle, angleDeg }) => {
          if (angleDeg < 2) return null;
          const isActive = activeCat === cat;
          const path = describeArc(center, center, innerR, startAngle + 1, startAngle + angleDeg - 1, innerR - 18);
          return (
            <motion.path
              key={cat}
              d={path}
              fill={CATEGORY_COLORS[cat] ?? "#6ee7b7"}
              opacity={isActive ? 0.95 : 0.45}
              filter={isActive ? "url(#segment-glow)" : undefined}
              whileHover={{ opacity: 0.85 }}
              onHoverStart={() => setHoveredCat(cat)}
              onHoverEnd={() => setHoveredCat(null)}
              onClick={() => {
                setSelectedCat(selectedCat === cat ? null : cat);
                onSegmentClick?.(cat);
              }}
              style={{ cursor: "pointer" }}
              transition={{ duration: 0.15 }}
            />
          );
        })}

        {/* Center text */}
        <text
          x={center} y={center - 10}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.2} fontWeight="700"
          fill={gradeCol}
          style={{ fontFamily: "system-ui" }}
        >
          {animatedScore}
        </text>
        <text
          x={center} y={center + size * 0.12}
          textAnchor="middle"
          fontSize={size * 0.075} fontWeight="500"
          fill="rgba(240,253,244,0.45)"
          style={{ fontFamily: "system-ui" }}
        >
          GreenScore
        </text>
        {grade && (
          <text
            x={center} y={center - size * 0.23}
            textAnchor="middle"
            fontSize={size * 0.065} fontWeight="700"
            fill={gradeCol}
            style={{ fontFamily: "system-ui" }}
          >
            Grade {grade}
          </text>
        )}
      </svg>

      {/* Category tooltip */}
      <AnimatePresence>
        {activeCat && categoryBreakdown[activeCat] !== undefined && (
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute -bottom-14 glass px-4 py-2 text-center pointer-events-none"
            style={{ minWidth: 160 }}
          >
            <div className="text-xs font-semibold capitalize" style={{ color: CATEGORY_COLORS[activeCat] }}>
              {categoryEmoji(activeCat)} {activeCat}
            </div>
            <div className="mt-0.5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {formatKg(categoryBreakdown[activeCat])}/yr
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
