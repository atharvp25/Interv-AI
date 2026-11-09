import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { Eye, ShieldCheck, ArrowRight, KeyRound, Sparkles, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { PLATFORM_NAME } from '../brand'

export default function Login({ initialRegister = false }) {
  const { startGuestMode } = useContext(AuthContext)
  const navigate = useNavigate()

  // Assessment Link / Invitation drawer state
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 1.25rem', minHeight: '80vh' }}>
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Sparkles size={20} />
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              margin: '0 0 0.45rem 0',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            {initialRegister ? `Create your ${PLATFORM_NAME} account` : `Sign in to ${PLATFORM_NAME}`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            AI-powered viva examination &amp; candidate screening platform.
          </p>
        </div>

        {/* Primary Action: Official Google OAuth */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GoogleSignInButton onSuccessRedirect={() => navigate('/dashboard')} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-faint)', marginTop: '0.85rem' }}>
            <ShieldCheck size={13} color="var(--primary)" />
            <span>Official Google OAuth 2.0 Security • Fast-track</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OR PREVIEW
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Hackathon Judge Guest Mode */}
        <button
          type="button"
          onClick={startGuestMode}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <Eye size={16} color="var(--primary)" />
          <span>Explore in Guest Mode (Preview Any Role)</span>
        </button>

        {/* Discreet Candidate / Student Assessment Link Entry */}
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setShowInviteDrawer(!showInviteDrawer)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '0.35rem 0',
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <KeyRound size={15} color="var(--primary)" />
              <span>Have an assessment link or exam token?</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem' }}>
              {showInviteDrawer ? 'Hide' : 'Enter'}
              {showInviteDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>

          {showInviteDrawer && (
            <form
              onSubmit={handleOpenAssessmentLink}
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: inviteError ? '0.35rem' : '0' }}>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => { setInviteInput(e.target.value); setInviteError(''); }}
                  placeholder="Paste /assess/... link or token"
                  style={{ flex: 1, padding: '0.55rem 0.75rem', fontSize: '0.84rem' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.84rem', whiteSpace: 'nowrap' }}
                >
                  Join <ArrowRight size={14} />
                </button>
              </div>

              {inviteError && (
                <span style={{ fontSize: '0.76rem', color: 'var(--error)', display: 'block', marginTop: '0.3rem' }}>
                  {inviteError}
                </span>
              )}

              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.45rem' }}>
                <Lock size={12} color="var(--primary)" /> Fast-track claim for candidates and students.
              </span>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
