import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { Eye, ArrowRight, KeyRound, ChevronDown, ChevronUp, Mic } from 'lucide-react'
import { PLATFORM_NAME } from '../brand'

export default function Login({ initialRegister = false }) {
  const { startGuestMode } = useContext(AuthContext)
  const navigate = useNavigate()

  const [showInviteDrawer, setShowInviteDrawer] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [inviteError, setInviteError] = useState('')

  const handleOpenAssessmentLink = (e) => {
    e.preventDefault()
    setInviteError('')
    const raw = inviteInput.trim()
    if (!raw) {
      setInviteError('Please paste an assessment link or invitation token.')
      return
    }
    const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
    const token = match ? match[1] : raw
    navigate(`/assess/${token}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '48px 20px', minHeight: '76vh' }}>
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'var(--sidebar)',
                color: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={16} strokeWidth={1.5} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{PLATFORM_NAME}</span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              margin: '0 0 6px 0',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {initialRegister ? `Create your ${PLATFORM_NAME} workspace` : `Sign in to ${PLATFORM_NAME}`}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            Structured voice viva examinations and multilingual candidate screenings.
          </p>
        </div>

        {/* Google OAuth */}
        <div style={{ marginBottom: '20px' }}>
          <GoogleSignInButton onSuccessRedirect={() => navigate('/dashboard')} />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Or preview without signing in
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Guest Mode */}
        <button
          type="button"
          onClick={startGuestMode}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '10px 16px',
            fontSize: '14px',
          }}
        >
          <Eye size={16} strokeWidth={1.5} />
          <span>Explore in guest mode (switch any role)</span>
        </button>

        {/* Assessment Link Entry */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowInviteDrawer(!showInviteDrawer)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '4px 0',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={15} strokeWidth={1.5} color="var(--text-muted)" />
              <span>Have an assessment link or exam token?</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
              {showInviteDrawer ? 'Hide' : 'Enter'}
              {showInviteDrawer ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
            </span>
          </button>

          {showInviteDrawer && (
            <form
              onSubmit={handleOpenAssessmentLink}
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => { setInviteInput(e.target.value); setInviteError(''); }}
                  placeholder="Paste /assess/... link or token"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  Open <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </div>

              {inviteError && (
                <span style={{ fontSize: '12px', color: 'var(--danger-text)', display: 'block', marginTop: '6px' }}>
                  {inviteError}
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
