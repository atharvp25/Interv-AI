import React, { memo } from 'react'
import { FolderOpen, Users } from 'lucide-react'

function EmptyState({ title = 'No records yet', description = '', actionLabel, onAction, variant = 'folder' }) {
  const Icon = variant === 'candidates' ? Users : FolderOpen

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '32px 24px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--surface)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: 'var(--text-secondary)',
        }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 16px auto', fontSize: 'var(--text-sm)' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default memo(EmptyState)
