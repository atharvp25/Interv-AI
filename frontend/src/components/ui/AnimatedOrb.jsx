import React, { memo } from 'react'

const PALETTE = {
  listening: { a: '#2563EB', b: '#0EA5E9', ring: 'rgba(37, 99, 235, 0.25)' },
  thinking: { a: '#4F46E5', b: '#3B82F6', ring: 'rgba(79, 70, 229, 0.25)' },
  speaking: { a: '#2563EB', b: '#10B981', ring: 'rgba(37, 99, 235, 0.3)' },
  idle: { a: '#1E293B', b: '#334155', ring: 'rgba(51, 65, 85, 0.2)' },
  offline: { a: '#1E293B', b: '#0F172A', ring: 'rgba(30, 41, 59, 0.2)' },
}

function AnimatedOrb({ state = 'idle', size = 220, bars = 5, children }) {
  const p = PALETTE[state] || PALETTE.idle
  const core = size * 0.58
  const active = state !== 'offline'

  return (
    <div
      role="img"
      aria-label={`AI interviewer is ${state}`}
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}
    >
      {/* Subtle outer breathing ring */}
      {active && (
        <span
          style={{
            position: 'absolute',
            width: core * 1.35,
            height: core * 1.35,
            borderRadius: '50%',
            border: `1px solid ${p.ring}`,
            opacity: 0.6,
          }}
        />
      )}

      {/* Core Sphere */}
      <div
        style={{
          position: 'relative',
          width: core,
          height: core,
          borderRadius: '50%',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${p.a} 0%, ${p.b} 100%)`,
          boxShadow: `0 8px 30px ${p.ring}`,
          display: 'grid',
          placeItems: 'center',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Crisp Equalizer Bars */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, height: core * 0.35 }}>
          {Array.from({ length: bars }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 4,
                height: '100%',
                borderRadius: 2,
                background: '#FFFFFF',
                transformOrigin: 'center',
                transform: state === 'speaking' ? undefined : `scaleY(${state === 'offline' ? 0.15 : 0.25 + (i % 3) * 0.1})`,
                animation: state === 'speaking'
                  ? `pn-bar ${0.6 + (i % 4) * 0.15}s ${i * 0.08}s ease-in-out infinite`
                  : state === 'listening' ? `pn-bar 2s ${i * 0.15}s ease-in-out infinite` : 'none',
                opacity: state === 'offline' ? 0.35 : 0.95,
              }}
            />
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}

export default memo(AnimatedOrb)
