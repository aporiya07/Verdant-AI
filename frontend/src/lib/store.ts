import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CarbonDna {
  transport: string;
  food: string;
  energy: string;
  shopping: string;
  waste: string;
}

export interface GreenScore {
  total_monthly_kg: number;
  daily_kg_avg: number;
  sustainability_grade: string;
  sustainability_score: number;
  total_xp: number;
  current_level: number;
  breakdown: Record<string, number>;
}

export interface UserProfile {
  id: string;
  email: string;
  lifestyle_classification: string | null;
  sustainability_score: number;
  total_xp: number;
  current_level: number;
  level_name: string;
  carbon_dna: CarbonDna | null;
  achievements: string[];
}

interface VerdantStore {
  profile: UserProfile | null;
  score: GreenScore | null;
  onboardingComplete: boolean;
  activeTab: string;
  setProfile: (profile: UserProfile) => void;
  setScore: (score: GreenScore) => void;
  setOnboardingComplete: (val: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useVerdantStore = create<VerdantStore>()(
  persist(
    (set) => ({
      profile: null,
      score: null,
      onboardingComplete: false,
      activeTab: 'dashboard',
      setProfile: (profile) => set({ profile }),
      setScore: (score) => set({ score }),
      setOnboardingComplete: (val) => set({ onboardingComplete: val }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: 'verdant-store' }
  )
);
