import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    "A+": "#34D399", A: "#34D399",
    "B+": "#6EE7B7", B: "#6EE7B7",
    "C+": "#FCD34D", C: "#FCD34D",
    D: "#F97316", F: "#EF4444",
  };
  return map[grade] ?? "#6EE7B7";
}

export function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    transport: "🚗", energy: "⚡", food: "🍽️", shopping: "🛍️", waste: "♻️",
  };
  return map[cat] ?? "🌿";
}

export function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)}kg`;
}
