import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { Lock, X } from 'lucide-react';

export default function RoleSelectionModal() {
  const { authPromptModal, closeAuthPrompt } = useContext(AuthContext);

  if (!authPromptModal?.open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28, 25, 23, 0.75)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '28px',
          textAlign: 'center',
          position: 'relative',
          boxShadow: 'var(--shadow-overlay)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <button
          type="button"
          onClick={closeAuthPrompt}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
          }}
          className="btn-ghost"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-btn)',
            background: 'var(--accent-soft)',
            color: 'var(--accent-soft-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            border: '1px solid var(--border-strong)',
          }}
        >
          <Lock size={18} strokeWidth={1.5} />
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '6px', fontWeight: 600, color: 'var(--text)' }}>
          Sign in required
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
          {authPromptModal.reason}
        </p>

        <GoogleSignInButton />

        <button
          type="button"
          onClick={closeAuthPrompt}
          className="btn-secondary"
          style={{ marginTop: '12px', width: '100%' }}
        >
          Continue exploring as guest
        </button>
      </div>
    </div>
  );
}
