import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { Eye, Link2, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Login() {
  const { startGuestMode } = useContext(AuthContext)
  const navigate = useNavigate()
  const [assessInput, setAssessInput] = useState('')

  const handleOpenAssessmentLink = (e) => {
    e.preventDefault()
    const raw = assessInput.trim()
    if (!raw) return
    // Extract token if full URL was pasted
    const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
    const token = match ? match[1] : raw
    navigate(`/assess/${token}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem' }}>
      <div className="panel animate-in" style={{ width: '100%', maxWidth: '460px', padding: '2.25rem' }}>
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
            <ShieldCheck size={14} /> Official Google OAuth 2.0
          </span>
          <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            Welcome to IntervAI
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Sign in or sign up with Google to choose your role (Teacher, Recruiter, Student, or Candidate) and access live voice assessments.
          </p>
        </div>

        {/* Primary Auth: Google Sign-In / Sign-Up */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleSignInButton onSuccessRedirect={() => navigate('/dashboard')} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR EXPLORE UI</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Hackathon Judge Guest Mode */}
        <button
          type="button"
          onClick={startGuestMode}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginBottom: '1.5rem' }}
        >
          <Eye size={18} /> Explore in Guest Mode (Pick Any Role)
        </button>

        {/* Hybrid Taker Entry Shortcut */}
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
            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}>
              Open <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
