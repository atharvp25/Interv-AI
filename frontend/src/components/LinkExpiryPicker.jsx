import React, { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

export default function LinkExpiryPicker({ totalHours, onChangeHours }) {
  const [mode, setMode] = useState('preset') // 'preset' | 'custom'
  const [customValue, setCustomValue] = useState(48)
  const [customUnit, setCustomUnit] = useState('hours') // 'hours' | 'days'

  const PRESETS = [
    { label: '24 hours', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '7 days', hours: 168 },
    { label: '14 days', hours: 336 },
  ]

  useEffect(() => {
    if (mode === 'custom') {
      const calculatedHours = customUnit === 'days' ? customValue * 24 : customValue
      onChangeHours(Math.max(1, calculatedHours))
    }
  }, [customValue, customUnit, mode])

  const handleSelectPreset = (hours) => {
    setMode('preset')
    onChangeHours(hours)
  }

  const computeExpiryDate = () => {
    const d = new Date()
    d.setHours(d.getHours() + (totalHours || 24))
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <Clock size={16} strokeWidth={1.5} color="var(--text-secondary)" /> Link expiration window
        </label>
        <span className="mono-font" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Duration: {totalHours >= 24 && totalHours % 24 === 0 ? `${totalHours / 24}d` : `${totalHours}h`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {PRESETS.map((p) => {
          const isSelected = mode === 'preset' && totalHours === p.hours
          return (
            <button
              key={p.hours}
              type="button"
              onClick={() => handleSelectPreset(p.hours)}
              className="pn-btn-sm"
              style={{
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-strong)'}`,
                backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                color: isSelected ? 'var(--accent-text)' : 'var(--text)',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              {p.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => {
            setMode('custom')
            const h = customUnit === 'days' ? customValue * 24 : customValue
            onChangeHours(h)
          }}
          className="pn-btn-sm"
          style={{
            border: `1px solid ${mode === 'custom' ? 'var(--accent)' : 'var(--border-strong)'}`,
            backgroundColor: mode === 'custom' ? 'var(--accent-soft)' : 'var(--surface)',
            color: mode === 'custom' ? 'var(--accent-text)' : 'var(--text)',
            fontWeight: mode === 'custom' ? 600 : 500,
          }}
        >
          Custom duration
        </button>
      </div>

      {mode === 'custom' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', maxWidth: '320px' }}>
          <input
            type="number"
            min="1"
            max="720"
            value={customValue}
            onChange={(e) => setCustomValue(Math.max(1, Number(e.target.value)))}
            style={{ width: '100px' }}
          />
          <select value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} style={{ width: '120px' }}>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        <Calendar size={14} strokeWidth={1.5} />
        <span>Valid until {computeExpiryDate()}</span>
      </div>
    </div>
  )
}
