import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Mic2, ShieldCheck, ArrowRight, Eye } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { token, startGuestMode } = useContext(AuthContext)

  return (
    <div className="home-container animate-in">
      <span style={{ 
        display: 'inline-block', 
        padding: '0.25rem 1rem', 
        background: 'rgba(37, 99, 235, 0.1)', 
        color: 'var(--primary)', 
        borderRadius: '20px',
        fontWeight: 600,
        fontSize: '0.875rem',
        marginBottom: '2rem',
        border: '1px solid rgba(37, 99, 235, 0.2)'
      }}>
        Gnani Prisma v3.0 STT + Timbre v2.5 TTS • 10+ Indian Languages
      </span>
      
      <h1 className="home-title brand-font">
        Multilingual Voice Viva & <br />
        <span className="text-gradient">AI Role-Play Screening.</span>
      </h1>
      
      <p className="home-subtitle">
        Built for both <strong>Education</strong> (Teachers conducting live Python coding & oral defense vivas) and <strong>Hiring</strong> (Recruiters running BDA sales & technical screenings in Hinglish, Hindi, Marathi, and 8 more Indic languages).
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <button
          className="btn-primary"
          onClick={() => navigate(token ? '/dashboard' : '/login')}
          style={{ fontSize: '1.05rem', padding: '0.95rem 1.85rem' }}
        >
          {token ? 'Go to Dashboard' : 'Get Started with Google'} <ArrowRight size={20} />
        </button>
        {!token && (
          <button
            className="btn-secondary"
            onClick={startGuestMode}
            style={{ fontSize: '1.05rem', padding: '0.95rem 1.75rem' }}
          >
            <Eye size={20} /> Explore in Guest Mode
          </button>
        )}
      </div>

      <div className="feature-grid animate-in delay-2">
        <div className="feature-card">
          <div className="feature-icon-wrapper"><BrainCircuit size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Anti-Cheat Oral Viva & Coding</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Students write Python code in a live split-screen editor and defend their logic aloud in English or Hinglish.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper"><Mic2 size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Gnani Prisma v3.0 + Timbre TTS</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Sub-600ms code-mixed STT with automatic JD keyterm boosting and natural Indian voices over LiveKit WebRTC.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper"><ShieldCheck size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Role-Based Access & Token Links</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Dedicated workflows for Teachers, Recruiters, Students, and Candidates with one-claimer tokenized links.</p>
        </div>
      </div>
    </div>
  )
}
