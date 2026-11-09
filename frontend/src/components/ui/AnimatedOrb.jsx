import React, { memo } from 'react'

const STATE_META = {
  listening: {
    label: 'Listening',
    badgeClass: 'pn-badge-success',
    barColor: 'var(--success-text)',
    active: true,
  },
  thinking: {
    label: 'Thinking',
    badgeClass: 'pn-badge-warning',
    barColor: 'var(--accent)',
    active: true,
  },
  speaking: {
    label: 'Speaking',
    badgeClass: 'pn-badge-primary',
    barColor: 'var(--primary)',
    active: true,
  },
  idle: {
    label: 'Ready',
    badgeClass: 'pn-badge',
    barColor: 'var(--border-strong)',
    active: false,
  },
  offline: {
    label: 'Disconnected',
    badgeClass: 'pn-badge-danger',
    barColor: 'var(--border)',
    active: false,
  },
}

function AnimatedOrb({ state = 'idle', bars = 12, children }) {
  const meta = STATE_META[state] || STATE_META.idle

  return (
    <div
      role="status"
      aria-label={`Interviewer status: ${meta.label}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        minWidth: '240px',
      }}
    >
      <style>{`
        @keyframes b2b-meter {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Audio channel
        </span>
        <span className={`pn-badge ${meta.badgeClass}`}>
          <span className="pn-dot" />
          {meta.label}
        </span>
      </div>

      {/* Subtle Horizontal Level Meter */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          height: '28px',
          width: '100%',
          padding: '4px 8px',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {Array.from({ length: bars }).map((_, i) => {
          const isSpeaking = state === 'speaking'
          const isListening = state === 'listening'
          const isThinking = state === 'thinking'
          const baseScale = isSpeaking ? 0.85 : isListening ? 0.55 : isThinking ? 0.35 : 0.2
          return (
            <span
              key={i}
              style={{
                flex: 1,
                maxWidth: '6px',
                height: '18px',
                borderRadius: '2px',
                backgroundColor: meta.barColor,
                transformOrigin: 'center',
                transform: `scaleY(${baseScale})`,
                animation: meta.active
                  ? `b2b-meter ${isSpeaking ? 0.55 + (i % 3) * 0.12 : 1.1 + (i % 4) * 0.15}s ${(i * 0.07).toFixed(2)}s ease-in-out infinite`
                  : 'none',
                opacity: meta.active ? 0.9 : 0.45,
              }}
            />
          )
        })}
      </div>

      {children}
    </div>
  )
}

export default memo(AnimatedOrb)
