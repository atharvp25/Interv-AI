import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Mic2, ShieldCheck, ArrowRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

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
        Production Ready Voice AI v3.0
      </span>
      
      <h1 className="home-title brand-font">
        Conduct the <br />
        <span className="text-gradient">Ultimate Interview.</span>
      </h1>
      
      <p className="home-subtitle">
        Empower your recruitment process with a highly advanced AI interviewer. 
        Upload any job description and let the agent dynamically assess candidates with real-time, low-latency voice interactions.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Deploy Interview <ArrowRight size={20} />
        </button>
      </div>

      <div className="feature-grid animate-in delay-2">
        <div className="feature-card">
          <div className="feature-icon-wrapper"><BrainCircuit size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Context-Aware Intelligence</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Generates targeted behavioral and technical questions based on custom PDFs.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper"><Mic2 size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Ultra Low-Latency Voice</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Powered by LiveKit WebRTC, Deepgram STT, and Cartesia TTS for natural conversations.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper"><ShieldCheck size={24} /></div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Enterprise Security</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Secure FastAPI backend with ephemeral file processing and robust token generation.</p>
        </div>
      </div>
    </div>
  )
}
