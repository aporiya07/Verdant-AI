'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, ScanSearch, Trophy,
  BarChart2, Calendar, Zap, Award,
  Star, Shield, RotateCcw, TrendingDown, TrendingUp,
} from 'lucide-react';
import { useVerdantStore } from '@/lib/store';
import { api } from '@/lib/api';
import ScoreRing from './ScoreRing';
import EarthTwin from './EarthTwin';
import EcoCoach from './EcoCoach';
import ImpactLens from './ImpactLens';
import GreenQuest from './GreenQuest';
import LogActivity from './LogActivity';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const LEVEL_NAMES = ['Seed', 'Sapling', 'Forest Guardian', 'Earth Protector', 'Climate Champion'];

const TABS = [
  { id: 'dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'log',       label: 'Log Activity', Icon: PlusCircle },
  { id: 'impact',    label: 'ImpactLens',   Icon: ScanSearch },
  { id: 'quests',    label: 'GreenQuest',   Icon: Trophy },
];

/* Inline SVG leaf for the nav logo */
function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"
        fill="url(#leafGrad)"
      />
      <defs>
        <linearGradient id="leafGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Hero SVG illustration — stylised plant/leaf */
function HeroIllustration() {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-illustration">
      {/* Ground circle */}
      <ellipse cx="70" cy="108" rx="38" ry="6" fill="rgba(16,185,129,0.12)" />
      {/* Stem */}
      <path d="M70 108 Q70 80 70 55" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      {/* Left leaf */}
      <path d="M70 75 Q50 60 38 65 Q48 80 70 75Z" fill="url(#leafL)" opacity="0.85" />
      {/* Right leaf */}
      <path d="M70 65 Q90 50 102 55 Q92 70 70 65Z" fill="url(#leafR)" opacity="0.85" />
      {/* Top leaf */}
      <path d="M70 55 Q60 35 65 22 Q78 32 70 55Z" fill="url(#leafT)" />
      {/* Sparkles */}
      <circle cx="108" cy="30" r="3" fill="#f59e0b" opacity="0.7" />
      <circle cx="118" cy="48" r="2" fill="#0ea5e9" opacity="0.6" />
      <circle cx="24" cy="45" r="2.5" fill="#10b981" opacity="0.6" />
      <circle cx="32" cy="28" r="2" fill="#f59e0b" opacity="0.5" />
      <defs>
        <linearGradient id="leafL" x1="38" y1="60" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="leafR" x1="102" y1="50" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="leafT" x1="65" y1="22" x2="75" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Custom tooltip for chart */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '0.6rem 0.9rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontSize: '0.82rem',
      }}>
        <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#10b981' }}>{payload[0].value} kg CO₂e</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { profile, score, setScore, setProfile, activeTab, setActiveTab, setOnboardingComplete } = useVerdantStore();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const [p, s] = await Promise.all([api.getProfile(), api.getScore()]);
      setProfile(p as any);
      setScore(s as any);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  useEffect(() => { refresh(); }, []);

  const breakdownData = score?.breakdown
    ? Object.entries(score.breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        kg: Number((value as number).toFixed(1)),
      }))
    : [];

  const levelName = LEVEL_NAMES[(profile?.current_level ?? 1) - 1] || 'Seed';

  const statCards = [
    {
      label: 'Monthly Footprint',
      value: `${score?.total_monthly_kg?.toFixed(1) ?? '--'}`,
      unit: 'kg CO₂e',
      sub: 'this month',
      Icon: BarChart2,
      colorClass: 'icon-box-green',
      trend: null,
    },
    {
      label: 'Daily Average',
      value: `${score?.daily_kg_avg?.toFixed(1) ?? '--'}`,
      unit: 'kg / day',
      sub: 'CO₂ equivalent',
      Icon: Calendar,
      colorClass: 'icon-box-blue',
      trend: null,
    },
    {
      label: 'XP Earned',
      value: `${profile?.total_xp ?? 0}`,
      unit: 'XP',
      sub: 'total experience',
      Icon: Zap,
      colorClass: 'icon-box-amber',
      trend: null,
    },
    {
      label: 'Achievements',
      value: `${profile?.achievements?.length ?? 0}`,
      unit: 'badges',
      sub: 'unlocked',
      Icon: Award,
      colorClass: 'icon-box-purple',
      trend: null,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top nav ── */}
      <nav style={{
        padding: '0.875rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '1rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LeafIcon />
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Verdant AI
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* XP badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.8rem',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.06))',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 999,
            fontSize: '0.78rem', fontWeight: 700, color: '#b45309',
          }}>
            <Star size={12} strokeWidth={2.5} />
            {profile?.total_xp ?? 0} XP
          </div>
          {/* Level badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.8rem',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.06))',
            border: '1px solid rgba(14,165,233,0.25)',
            borderRadius: 999,
            fontSize: '0.78rem', fontWeight: 700, color: '#0369a1',
          }}>
            <Shield size={12} strokeWidth={2.5} />
            {levelName}
          </div>
          {/* Reset icon button */}
          <button
            className="nav-icon-btn"
            onClick={() => setOnboardingComplete(false)}
            title="Reset onboarding"
          >
            <RotateCcw size={15} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.65rem 2rem',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f1f5f9',
        overflowX: 'auto',
      }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab-btn${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: '2rem', maxWidth: 1140, margin: '0 auto', width: '100%' }}>

        {/* ════ DASHBOARD TAB ════ */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {/* Hero card */}
            <div className="glass-card" style={{
              padding: '2rem 2.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(14,165,233,0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Welcome back 👋
                </p>
                <h1 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  color: '#0f172a',
                  lineHeight: 1.2,
                  marginBottom: '0.75rem',
                }}>
                  {profile?.lifestyle_classification ?? 'Your Sustainability Journey'}
                </h1>
                {score ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <TrendingDown size={16} color="#10b981" />
                    <span style={{ fontSize: '0.95rem', color: '#64748b' }}>
                      Your footprint is{' '}
                      <strong style={{ color: '#0f172a' }}>{score.daily_kg_avg.toFixed(1)} kg CO₂e/day</strong>
                      {' '}— Grade{' '}
                      <strong style={{ color: '#10b981' }}>{score.sustainability_grade}</strong>
                    </span>
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Track your activities to get personalized insights.
                  </p>
                )}
                <button
                  className="btn-primary"
                  onClick={refresh}
                  disabled={refreshing}
                  style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <TrendingUp size={15} strokeWidth={2.5} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
              <HeroIllustration />
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              {statCards.map(({ label, value, unit, sub, Icon, colorClass }) => (
                <motion.div
                  key={label}
                  className="stat-card"
                  whileHover={{ y: -2 }}
                >
                  <div className={`icon-box ${colorClass}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      color: '#0f172a',
                      lineHeight: 1,
                    }}>
                      {value}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginLeft: '0.3rem' }}>
                        {unit}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Score ring + EarthTwin + chart */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1rem',
            }}>
              {/* Score ring card */}
              <div className="glass-card" style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <p style={{
                  fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  GreenScore™
                </p>
                <ScoreRing
                  score={score?.sustainability_score ?? 0}
                  grade={score?.sustainability_grade ?? '--'}
                />
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.55 }}>
                  Higher is better. A+ = ≤3 kg CO₂e/day.
                </p>
                {/* Grade legend */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[['A+','#10b981'],['A','#34d399'],['B','#0ea5e9'],['C','#f59e0b'],['D','#f97316'],['F','#ef4444']].map(([g, c]) => (
                    <span key={g} style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: `${c}18`,
                      color: c,
                      border: `1px solid ${c}33`,
                    }}>{g}</span>
                  ))}
                </div>
              </div>

              {/* EarthTwin */}
              <EarthTwin score={score?.sustainability_score ?? 0} level={profile?.current_level ?? 1} />

              {/* Breakdown chart */}
              {breakdownData.length > 0 ? (
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
                    color: '#0f172a', marginBottom: '1.25rem',
                  }}>
                    Emissions Breakdown
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={breakdownData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                      <Bar dataKey="kg" fill="url(#barGrad)" radius={[7, 7, 0, 0]} />
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="glass-card empty-state">
                  <BarChart2 size={36} color="#94a3b8" />
                  <p>Log activities to see your emissions breakdown chart.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ════ LOG TAB ════ */}
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <LogActivity onLogged={refresh} />
          </motion.div>
        )}

        {/* ════ IMPACT LENS TAB ════ */}
        {activeTab === 'impact' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ImpactLens />
          </motion.div>
        )}

        {/* ════ GREENQUEST TAB ════ */}
        {activeTab === 'quests' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GreenQuest profile={profile} />
          </motion.div>
        )}
      </div>

      {/* Floating EcoCoach */}
      <EcoCoach />
    </div>
  );
}
