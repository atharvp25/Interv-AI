import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { Eye, Link2, ArrowRight, ShieldCheck, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react'

export default function Login({ initialRegister = false }) {
  const { startGuestMode, loginWithPassword, registerWithPassword } = useContext(AuthContext)
  const navigate = useNavigate()

  // Form mode: 'google' | 'signin' | 'signup'
  const [authMethod, setAuthMethod] = useState(initialRegister ? 'password' : 'google')
  const [isRegister, setIsRegister] = useState(initialRegister)

  // Password fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Direct assessment token entry
  const [assessInput, setAssessInput] = useState('')

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await registerWithPassword({
          username: username.trim(),
          email: email.trim(),
          password,
        })
      } else {
        await loginWithPassword(username.trim(), password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAssessmentLink = (e) => {
    e.preventDefault()
    const raw = assessInput.trim()
    if (!raw) return
    const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
    const token = match ? match[1] : raw
    navigate(`/assess/${token}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2.5rem 1rem' }}>
      <div className="panel animate-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: '18px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} /> Official Google OAuth 2.0 & Secure Auth
          </span>
          <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
            {isRegister ? 'Create Your Account' : 'Welcome to IntervAI'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isRegister
              ? 'Sign up to choose your role (Teacher, Recruiter, Student, or Candidate).'
              : 'Sign in to access your assessment dashboard, reports, and voice viva sessions.'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Auth Method Selector Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-main)',
          padding: '0.35rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'google' ? 'var(--bg-surface)' : 'transparent',
              color: authMethod === 'google' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: authMethod === 'google' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={15} /> Google One-Click
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('password'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'password' ? 'var(--bg-surface)' : 'transparent',
              color: authMethod === 'password' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: authMethod === 'password' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <LogIn size={15} /> Username / Password
          </button>
        </div>

        {/* METHOD 1: Google One-Click */}
        {authMethod === 'google' ? (
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Recommended: 1-click instant login or sign-up via your Google account.
            </p>
            <GoogleSignInButton onSuccessRedirect={() => navigate('/dashboard')} />
          </div>
        ) : (
          /* METHOD 2: Username / Password (Sign-In or Sign-Up) */
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose or enter your username"
              />
            </div>

            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or name@company.com"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? 'Authenticating...' : isRegister ? <><UserPlus size={16} /> Create Account</> : <><LogIn size={16} /> Sign In</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one now"}
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR EXPLORE / TAKE EXAM</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Hackathon Judge Guest Mode */}
        <button
          type="button"
          onClick={startGuestMode}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: '10px' }}
        >
          <Eye size={17} /> Explore in Guest Mode (Preview Any Role)
        </button>

        {/* Direct Assessment Link Taker Entry */}
        <div
          style={{
            background: 'var(--bg-main)',
            padding: '1.1rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Link2 size={15} color="var(--primary)" /> Have an Assessment Link from a Teacher or Recruiter?
          </label>
          <form onSubmit={handleOpenAssessmentLink} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={assessInput}
              onChange={(e) => setAssessInput(e.target.value)}
              placeholder="Paste assessment link or token..."
              style={{ flex: 1, padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Open <ArrowRight size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
