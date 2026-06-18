'use client';

import { useEffect } from 'react';
import { useVerdantStore } from '@/lib/store';
import { api } from '@/lib/api';
import OnboardingFlow from '@/components/OnboardingFlow';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { onboardingComplete, setProfile, setScore, setOnboardingComplete } = useVerdantStore();

  useEffect(() => {
    if (onboardingComplete) {
      // Refresh profile and score on mount
      api.getProfile().then((p: any) => {
        setProfile(p);
        if (p.carbon_dna) setOnboardingComplete(true);
      }).catch(() => {});
      api.getScore().then((s: any) => setScore(s)).catch(() => {});
    }
  }, []);

  return (
    <main className="gradient-bg" style={{ minHeight: '100vh' }}>
      {!onboardingComplete ? (
        <OnboardingFlow />
      ) : (
        <Dashboard />
      )}
    </main>
  );
}
