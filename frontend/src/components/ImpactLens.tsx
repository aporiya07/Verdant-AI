'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanSearch, Target, Sparkles, FileText } from 'lucide-react';
import { api } from '@/lib/api';

/* Empty state illustration — magnifying glass SVG */
function EmptyIllustration({ color }: { color: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="9" fill={color} fillOpacity="0.08" />
      <path d="M36 36 L46 46" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M19 24 L22 27 L30 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

/* Skeleton line */
function SkeletonLines() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem 0' }}>
      {[100, 85, 92, 70, 80].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, borderRadius: 6 }} />
      ))}
    </div>
  );
}

export default function ImpactLens() {
  const [report,       setReport]       = useState('');
  const [goals,        setGoals]        = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingGoals,  setLoadingGoals]  = useState(false);

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const res: any = await api.getImpactLens();
      setReport(res.report);
    } catch { setReport('Unable to generate report right now.'); }
    finally { setLoadingReport(false); }
  };

  const fetchGoals = async () => {
    setLoadingGoals(true);
    try {
      const res: any = await api.getWeeklyGoals();
      setGoals(res.goals);
    } catch { setGoals('Unable to generate goals right now.'); }
    finally { setLoadingGoals(false); }
  };

  return (
    <div>
      {/* Section header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div className="icon-box icon-box-lg icon-box-blue">
          <ScanSearch size={22} strokeWidth={2} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#0f172a', lineHeight: 1.25, marginBottom: '0.35rem' }}>
            ImpactLens™
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>
            AI-powered analysis of your carbon footprint with personalised insights powered by Gemini.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* ── Monthly Impact Report ── */}
        <div className="glass-card card-accent-green" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="icon-box icon-box-lg icon-box-green">
              <FileText size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                Monthly Impact Report
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.5 }}>
                AI analysis of your biggest emission sources.
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={fetchReport}
            disabled={loadingReport}
            style={{ width: '100%', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={15} strokeWidth={2.5} />
            {loadingReport ? 'Analysing...' : 'Generate Report'}
          </button>

          {/* Loading skeleton */}
          {loadingReport && <SkeletonLines />}

          {/* Empty state */}
          {!loadingReport && !report && (
            <div className="empty-state" style={{ flex: 1 }}>
              <EmptyIllustration color="#10b981" />
              <p>Click Generate to get your personalised AI monthly impact analysis.</p>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {report && !loadingReport && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1.1rem 1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: 1.75,
                  whiteSpace: 'pre-wrap',
                  flex: 1,
                }}
              >
                {report}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Weekly Goals ── */}
        <div className="glass-card card-accent-blue" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="icon-box icon-box-lg icon-box-blue">
              <Target size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                Weekly Goals
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.5 }}>
                AI-generated goals tailored to your lifestyle.
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={fetchGoals}
            disabled={loadingGoals}
            style={{ width: '100%', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Target size={15} strokeWidth={2.5} />
            {loadingGoals ? 'Generating...' : 'Generate Goals'}
          </button>

          {/* Loading skeleton */}
          {loadingGoals && <SkeletonLines />}

          {/* Empty state */}
          {!loadingGoals && !goals && (
            <div className="empty-state" style={{ flex: 1 }}>
              <EmptyIllustration color="#0ea5e9" />
              <p>Click Generate to get personalised weekly sustainability goals.</p>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {goals && !loadingGoals && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1.1rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(14,165,233,0.04))',
                  border: '1px solid rgba(14,165,233,0.2)',
                  borderRadius: 12,
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  lineHeight: 1.75,
                  whiteSpace: 'pre-wrap',
                  flex: 1,
                }}
              >
                {goals}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
