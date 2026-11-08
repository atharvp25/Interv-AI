import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { Eye, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

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
      <div className="panel animate-in" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(37, 99, 235, 0.08)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={14} /> Official Google OAuth 2.0 Security
          </div>

          <h1 className="brand-font" style={{ fontSize: '2.1rem', margin: '0 0 0.5rem 0', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {initialRegister ? 'Join IntervAI' : 'Welcome to IntervAI'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
            AI-driven multilingual voice assessment platform for universities and enterprise hiring teams.
          </p>
        </div>

        {/* Primary Action: 1-Click Google OAuth */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <GoogleSignInButton onSuccessRedirect={() => navigate('/dashboard')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--success)" /> Instant 1-Click Access
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--success)" /> No Password Required
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--success)" /> Role Onboarding
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Evaluation & Judging
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
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <Eye size={17} color="#d97706" />
          <span>Explore in Guest Mode (Preview Any Role)</span>
        </button>

        {/* Professional Discreet Candidate / Student Assessment Link Entry */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setShowInviteDrawer(!showInviteDrawer)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '0.4rem 0',
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
              <span>Joining an assigned session or lab exam?</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem' }}>
              {showInviteDrawer ? 'Hide' : 'Enter Code'}
              {showInviteDrawer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </button>

          {showInviteDrawer && (
            <form
              onSubmit={handleOpenAssessmentLink}
              className="fade-in"
              style={{
                marginTop: '0.85rem',
                padding: '0.9rem',
                borderRadius: '12px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: inviteError ? '0.4rem' : '0' }}>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => { setInviteInput(e.target.value); setInviteError(''); }}
                  placeholder="Paste invitation link or token..."
                  style={{ flex: 1, padding: '0.55rem 0.75rem', fontSize: '0.84rem', borderRadius: '8px' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.84rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                >
                  Join <ArrowRight size={14} />
                </button>
              </div>

              {inviteError && (
                <span style={{ fontSize: '0.76rem', color: 'var(--error)', display: 'block', marginTop: '0.3rem' }}>
                  {inviteError}
                </span>
              )}

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.45rem' }}>
                🔒 Fast-track entry for students and candidates. No prior sign-up required.
              </span>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
