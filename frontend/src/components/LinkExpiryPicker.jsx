import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

export default function LinkExpiryPicker({ totalHours, onChangeHours }) {
  const [mode, setMode] = useState('preset'); // 'preset' | 'custom'
  const [customValue, setCustomValue] = useState(48);
  const [customUnit, setCustomUnit] = useState('hours'); // 'hours' | 'days'

  const PRESETS = [
    { label: '24 Hours', hours: 24 },
    { label: '3 Days', hours: 72 },
    { label: '7 Days', hours: 168 },
    { label: '14 Days', hours: 336 },
  ];

  useEffect(() => {
    if (mode === 'custom') {
      const calculatedHours = customUnit === 'days' ? customValue * 24 : customValue;
      onChangeHours(Math.max(1, calculatedHours));
    }
  }, [customValue, customUnit, mode]);

  const handleSelectPreset = (hours) => {
    setMode('preset');
    onChangeHours(hours);
  };

  const computeExpiryDate = () => {
    const d = new Date();
    d.setHours(d.getHours() + (totalHours || 24));
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <Clock size={15} color="var(--primary)" /> Customizable Link Expiry Window
        </label>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Active for: <strong>{totalHours >= 24 && totalHours % 24 === 0 ? `${totalHours / 24} Day(s)` : `${totalHours} Hour(s)`}</strong>
        </span>
      </div>

      {/* Preset Pills + Custom Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {PRESETS.map((p) => {
          const isSelected = mode === 'preset' && totalHours === p.hours;
          return (
            <button
              key={p.hours}
              type="button"
              onClick={() => handleSelectPreset(p.hours)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                color: isSelected ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setMode('custom');
            const h = customUnit === 'days' ? customValue * 24 : customValue;
            onChangeHours(h);
          }}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: `1px solid ${mode === 'custom' ? 'var(--primary)' : 'var(--border)'}`,
            background: mode === 'custom' ? 'var(--primary)' : 'var(--bg-surface)',
            color: mode === 'custom' ? '#fff' : 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Sparkles size={13} /> Custom Duration
        </button>
      </div>

      {/* Custom Duration Inputs (When Custom mode is active) */}
      {mode === 'custom' && (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="number"
            min={1}
            max={720}
            value={customValue}
            onChange={(e) => setCustomValue(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: '110px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: '8px', background: 'var(--bg-surface)' }}
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            (Type any value e.g. 36 hours, 5 days, 10 days)
          </span>
        </div>
      )}

      {/* Live Calculated Expiry Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(37, 99, 235, 0.05)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
        <Calendar size={13} color="var(--primary)" />
        <span>Link expires on: <strong>{computeExpiryDate()}</strong></span>
      </div>
    </div>
  );
}

