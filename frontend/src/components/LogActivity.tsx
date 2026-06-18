'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, UtensilsCrossed, Zap, ShoppingBag, Recycle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface LogActivityProps {
  onLogged: () => void;
}

const CATEGORIES = [
  {
    id: 'transport',
    label: 'Transport',
    Icon: Car,
    color: 'icon-box-blue',
    fields: [
      { key: 'mode', label: 'Mode of Transport', hint: 'Your primary way of travelling', type: 'select', options: [
        { value: 'car_petrol',    label: 'Petrol Car' },
        { value: 'car_diesel',    label: 'Diesel Car' },
        { value: 'car_electric',  label: 'Electric Car' },
        { value: 'motorcycle',    label: 'Motorcycle' },
        { value: 'bus',           label: 'Bus' },
        { value: 'train',         label: 'Train' },
        { value: 'bike',          label: 'Bicycle' },
        { value: 'walking',       label: 'Walking' },
        { value: 'flight_short',  label: 'Short Flight' },
        { value: 'flight_long',   label: 'Long Flight' },
        { value: 'rideshare',     label: 'Rideshare' },
      ]},
      { key: 'km_per_day', label: 'Distance (km/day)', hint: 'Approximate km travelled today', type: 'number', placeholder: '15' },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    Icon: UtensilsCrossed,
    color: 'icon-box-green',
    fields: [
      { key: 'diet_type', label: 'Diet Type', hint: 'Your general eating pattern', type: 'select', options: [
        { value: 'vegan',              label: 'Vegan' },
        { value: 'vegetarian',         label: 'Vegetarian' },
        { value: 'pescatarian',        label: 'Pescatarian' },
        { value: 'omnivore_low_meat',  label: 'Low Meat' },
        { value: 'omnivore_high_meat', label: 'High Meat' },
      ]},
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    Icon: Zap,
    color: 'icon-box-amber',
    fields: [
      { key: 'kwh_per_month', label: 'Usage (kWh/month)', hint: 'Check your electricity bill', type: 'number', placeholder: '300' },
      { key: 'energy_source', label: 'Energy Source', hint: 'Where your electricity comes from', type: 'select', options: [
        { value: 'kwh_renewable', label: 'Renewable' },
        { value: 'kwh_mixed',     label: 'Mixed Grid' },
        { value: 'kwh_coal',      label: 'Coal Grid' },
      ]},
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    Icon: ShoppingBag,
    color: 'icon-box-purple',
    fields: [
      { key: 'fashion_items',   label: 'Fashion items this month', hint: 'Clothing, accessories, etc.', type: 'number', placeholder: '0' },
      { key: 'online_parcels',  label: 'Online deliveries',        hint: 'Parcels received this month', type: 'number', placeholder: '0' },
    ],
  },
  {
    id: 'waste',
    label: 'Waste',
    Icon: Recycle,
    color: 'icon-box-rose',
    fields: [
      { key: 'waste_kg',    label: 'Waste produced (kg)', hint: 'Total waste generated', type: 'number', placeholder: '5' },
      { key: 'recycled_kg', label: 'Amount recycled (kg)', hint: 'How much you recycled',  type: 'number', placeholder: '2' },
    ],
  },
];

export default function LogActivity({ onLogged }: LogActivityProps) {
  const [selected, setSelected]   = useState(CATEGORIES[0]);
  const [values, setValues]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{ message: string; emissions_kg: number } | null>(null);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res: any = await api.logCarbon({ category: selected.id, details: values });
      setResult(res);
      setValues({});
      onLogged();
    } catch {
      setError('Failed to log activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Pair fields side-by-side when there are exactly 2 number inputs */
  const fields = selected.fields as any[];
  const twoNumbers = fields.length === 2 && fields.every((f: any) => f.type === 'number');

  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <h2>Log Activity</h2>
        <p>Track your daily activities to measure and improve your carbon footprint.</p>
      </div>

      {/* Category selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => {
          const active = selected.id === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-card ${active ? 'active' : ''}`}
              onClick={() => { setSelected(cat); setValues({}); setResult(null); setError(''); }}
            >
              <div className={`icon-box ${active ? cat.color : 'icon-box-green'}`} style={{ width: 36, height: 36, borderRadius: 9 }}>
                <cat.Icon size={16} strokeWidth={2} />
              </div>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Form card */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card"
        style={{ padding: '2rem', maxWidth: 640 }}
      >
        {/* Card title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
          <div className={`icon-box icon-box-lg ${selected.color}`}>
            <selected.Icon size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>
              {selected.label} Details
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              Fill in the details below to calculate your emissions.
            </p>
          </div>
        </div>

        {/* Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: twoNumbers ? '1fr 1fr' : '1fr',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          {fields.map((field: any) => (
            <div key={field.key}>
              <label style={{
                display: 'block',
                fontSize: '0.83rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.4rem',
              }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  className="input"
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                >
                  <option value="">Select...</option>
                  {field.options.map((o: any) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              )}
              {field.hint && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* XP tip banner */}
        <div className="xp-banner">
          <Sparkles size={14} strokeWidth={2.5} />
          <span>+10 XP for every log — keep the streak going!</span>
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Calculating...' : 'Log Activity +10 XP →'}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                background: '#f0fdf4',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <CheckCircle size={18} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#065f46', marginBottom: '0.2rem' }}>
                  Activity logged!
                </div>
                <div style={{ fontSize: '0.82rem', color: '#047857', lineHeight: 1.5 }}>
                  {result.message}
                </div>
                {result.emissions_kg !== undefined && (
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.65rem',
                    background: 'rgba(16,185,129,0.12)',
                    borderRadius: 999,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#059669',
                  }}>
                    {result.emissions_kg.toFixed(2)} kg CO₂e recorded
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                background: '#fef2f2',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <XCircle size={18} color="#ef4444" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
