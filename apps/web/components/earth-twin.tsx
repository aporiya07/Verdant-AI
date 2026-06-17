"use client";

import { motion, AnimatePresence } from "framer-motion";
import { gradeColor } from "@/lib/utils";

const STAGE_DATA = [
  { stage: 1, label: "Seed", color: "#78716c", paths: "seed" },
  { stage: 2, label: "Sprout", color: "#84cc16", paths: "sprout" },
  { stage: 3, label: "Sapling", color: "#22c55e", paths: "sapling" },
  { stage: 4, label: "Tree", color: "#16a34a", paths: "tree" },
  { stage: 5, label: "Forest", color: "#15803d", paths: "forest" },
];

// SVG path definitions per stage
function SeedSvg({ color }: { color: string }) {
  return (
    <g>
      <ellipse cx="50" cy="70" rx="14" ry="18" fill={color} opacity="0.9" />
      <ellipse cx="50" cy="68" rx="8" ry="10" fill="#f0fdf4" opacity="0.2" />
      <line x1="50" y1="52" x2="50" y2="45" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function SproutSvg({ color }: { color: string }) {
  return (
    <g>
      <rect x="47" y="55" width="6" height="25" rx="3" fill="#92400e" opacity="0.7" />
      <ellipse cx="50" cy="50" rx="16" ry="10" fill={color} opacity="0.9" />
      <ellipse cx="35" cy="58" rx="10" ry="6" fill={color} opacity="0.7" transform="rotate(-30 35 58)" />
      <ellipse cx="65" cy="58" rx="10" ry="6" fill={color} opacity="0.7" transform="rotate(30 65 58)" />
    </g>
  );
}

function SaplingSvg({ color }: { color: string }) {
  return (
    <g>
      <rect x="46" y="62" width="8" height="22" rx="3" fill="#92400e" opacity="0.8" />
      <circle cx="50" cy="48" r="20" fill={color} opacity="0.85" />
      <circle cx="34" cy="58" r="12" fill={color} opacity="0.7" />
      <circle cx="66" cy="58" r="12" fill={color} opacity="0.7" />
      <circle cx="50" cy="35" r="10" fill={color} opacity="0.75" />
    </g>
  );
}

function TreeSvg({ color }: { color: string }) {
  return (
    <g>
      <rect x="44" y="65" width="12" height="20" rx="4" fill="#92400e" opacity="0.9" />
      <circle cx="50" cy="46" r="24" fill={color} opacity="0.85" />
      <circle cx="30" cy="54" r="16" fill={color} opacity="0.75" />
      <circle cx="70" cy="54" r="16" fill={color} opacity="0.75" />
      <circle cx="50" cy="28" r="14" fill={color} opacity="0.8" />
      <circle cx="37" cy="38" r="10" fill={color} opacity="0.7" />
      <circle cx="63" cy="38" r="10" fill={color} opacity="0.7" />
    </g>
  );
}

function ForestSvg({ color }: { color: string }) {
  return (
    <g>
      {/* Main tree */}
      <rect x="44" y="65" width="12" height="20" rx="4" fill="#92400e" opacity="0.9" />
      <circle cx="50" cy="42" r="28" fill={color} opacity="0.9" />
      {/* Left tree */}
      <rect x="14" y="72" width="8" height="13" rx="3" fill="#92400e" opacity="0.7" />
      <circle cx="18" cy="62" r="16" fill={color} opacity="0.75" />
      {/* Right tree */}
      <rect x="78" y="72" width="8" height="13" rx="3" fill="#92400e" opacity="0.7" />
      <circle cx="82" cy="62" r="16" fill={color} opacity="0.75" />
      {/* Crown */}
      <circle cx="50" cy="22" r="15" fill={color} opacity="0.8" />
      <circle cx="34" cy="30" r="11" fill={color} opacity="0.72" />
      <circle cx="66" cy="30" r="11" fill={color} opacity="0.72" />
      {/* Ground */}
      <ellipse cx="50" cy="85" rx="35" ry="4" fill={color} opacity="0.2" />
    </g>
  );
}

function StageShape({ stage, color }: { stage: number; color: string }) {
  switch (stage) {
    case 1: return <SeedSvg color={color} />;
    case 2: return <SproutSvg color={color} />;
    case 3: return <SaplingSvg color={color} />;
    case 4: return <TreeSvg color={color} />;
    case 5: return <ForestSvg color={color} />;
    default: return <SeedSvg color={color} />;
  }
}

interface EarthTwinProps {
  stage: number;
  size?: number;
  breathe?: boolean;
  showLabel?: boolean;
  description?: string;
}

export function EarthTwin({ stage, size = 100, breathe = true, showLabel = false, description }: EarthTwinProps) {
  const data = STAGE_DATA[Math.min(Math.max(stage - 1, 0), 4)];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={breathe ? { scale: [1, 1.04, 1], opacity: [1, 0.88, 1] } : {}}
        transition={breathe ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
        style={{ width: size, height: size }}
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={stage}
            viewBox="0 0 100 100"
            width={size}
            height={size}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ filter: `drop-shadow(0 0 ${size * 0.12}px ${data.color}60)` }}
          >
            <circle cx="50" cy="50" r="48" fill="rgba(52,211,153,0.06)" />
            <StageShape stage={stage} color={data.color} />
          </motion.svg>
        </AnimatePresence>
      </motion.div>
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-sm font-semibold" style={{ color: data.color }}>
            EarthTwin — {data.label}
          </div>
          {description && (
            <div className="mt-0.5 text-xs" style={{ color: "var(--text-dim)" }}>
              {description}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Preview version for landing page — loops through stages slowly
export function EarthTwinPreview({ stage = 3, size = 100 }: { stage?: number; size?: number }) {
  return <EarthTwin stage={stage} size={size} breathe />;
}
