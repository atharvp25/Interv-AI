import React, { memo } from 'react'
import { FolderOpen, Users } from 'lucide-react'

function EmptyState({ variant = 'assessments', title, description, action, actionLabel, onAction }) {
  const Icon = variant === 'candidates' ? Users : FolderOpen

  return (
    <div
      className="panel"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface-2)',
        border: '1px dashed var(--border)',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          background: 'var(--primary-soft)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={24} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.5, margin: '0 auto 1.25rem auto' }}>
          {description}
        </p>
      )}

      {action || (actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ))}
    </div>
  )
}

export default memo(EmptyState)
