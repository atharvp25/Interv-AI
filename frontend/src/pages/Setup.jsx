import React, { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, 
  ServerCog, Briefcase, Code, Globe, Link2, Copy, Sparkles, UserCheck 
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const SUPPORTED_LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish (Hindi + English)' },
  { id: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { id: 'mr-IN', label: 'Marathi (मराठी)' },
  { id: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { id: 'te-IN', label: 'Telugu (తెలుగు)' },
  { id: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { id: 'bn-IN', label: 'Bengali (বাংলা)' },
  { id: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { id: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { id: 'ml-IN', label: 'Malayalam (മലയാളം)' },
  { id: 'en-IN', label: 'Indian English' },
]

export default function Setup() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { token } = useContext(AuthContext)

  // Configuration state
  const [mode, setMode] = useState('practice') // 'practice' | 'recruiter'
  const [track, setTrack] = useState('tech') // 'tech' | 'bda'
  const [language, setLanguage] = useState('hinglish')
  const [status, setStatus] = useState('idle') // idle, uploading, ready, error
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [roleTitle, setRoleTitle] = useState('Python & AI Engineer Viva')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const [copied, setCopied] = useState(false)

  // 1-Click Preset Selection
  const applyPreset = async (selectedTrack) => {
    setTrack(selectedTrack)
    setStatus('uploading')
    setErrorMessage('')

    const title = selectedTrack === 'tech' 
      ? 'Python & AI Engineer Viva' 
      : 'Enterprise BDA Sales & BFSI'
    setRoleTitle(title)

    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
      const res = await fetch(`${baseUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          track: selectedTrack,
          language,
          role_title: title,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to initialize preset")

      setSessionId(data.session_id)
      setKeywordsCount(data.keywords?.length || 0)
      setStatus('ready')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  // Custom JD File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
      const res = await fetch(`${baseUrl}/api/upload-jd?track=${track}&language=${language}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || "Upload failed")

      setSessionId(data.session_id)
      setRoleTitle(data.role_title || file.name)
      setKeywordsCount(data.keywords?.length || 0)
      setStatus('ready')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  // Start Candidate Interview
  const handleStartInterview = () => {
    localStorage.setItem('intervai_session', sessionId)
    localStorage.setItem('intervai_track', track)
    localStorage.setItem('intervai_lang', language)
    navigate(`/interview?session=${sessionId}&track=${track}&lang=${language}`)
  }

  // Shareable Link URL
  const shareableUrl = `${window.location.origin}/interview?session=${sessionId}&track=${track}&lang=${language}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '880px', margin: '3rem auto', padding: '0 1.5rem' }}>
      
      {/* Top Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          Configure Interview Session
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Select role track, interview language, and launch an AI-powered voice screening session.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="panel animate-in" style={{ padding: '2rem', borderRadius: '16px' }}>
        
        {/* Mode Selector (Self-Practice vs Recruiter Shareable Link) */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setMode('practice')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'practice' ? 'var(--primary)' : 'transparent',
              color: mode === 'practice' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={18} /> Candidate Self-Practice
          </button>
          <button
            type="button"
            onClick={() => setMode('recruiter')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'recruiter' ? 'var(--primary)' : 'transparent',
              color: mode === 'recruiter' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <Link2 size={18} /> Recruiter / Professor Shareable Link
          </button>
        </div>

        {/* Track Selector Cards */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            1. Select Interview Track
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            {/* Tech Track Card */}
            <div
              onClick={() => { setTrack('tech'); if (status === 'ready') setStatus('idle'); }}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: `2px solid ${track === 'tech' ? 'var(--primary)' : 'var(--border)'}`,
                background: track === 'tech' ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                  <Code size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Tech & Oral Viva Track</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Python Coding + Oral Defense</span>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Includes live split-screen Python code editor and mandatory oral viva defense to prevent AI copy-pasting.
              </p>
            </div>

            {/* BDA Track Card */}
            <div
              onClick={() => { setTrack('bda'); if (status === 'ready') setStatus('idle'); }}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: `2px solid ${track === 'bda' ? 'var(--primary)' : 'var(--border)'}`,
                background: track === 'bda' ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>BDA / Sales & BFSI Track</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Role-Play & Objection Handling</span>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                AI acts as a skeptical corporate buyer testing objection handling, consultative pitching, and closing in noisy audio.
              </p>
            </div>

          </div>
        </div>

        {/* Language Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            2. Select Conversation Language (10 Indic Languages + Hinglish)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={18} color="var(--primary)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Context Initialization: 1-Click Preset OR Custom File Upload */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            3. Initialize Context & STT Keyword Boosting
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => applyPreset(track)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            >
              <Sparkles size={16} color="var(--primary)" />
              Use 1-Click {track === 'tech' ? 'Python AI' : 'BDA Sales'} Preset
            </button>
          </div>

          {/* Drag & Drop File Upload */}
          <div 
            className={`dropzone ${status === 'uploading' ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '12px' }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.txt"
              style={{ display: 'none' }} 
            />
            
            {status === 'idle' && (
              <>
                <UploadCloud size={36} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Or upload custom Job Description (PDF/TXT)</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Automatically extracts domain terms to boost STT accuracy</p>
              </>
            )}

            {status === 'uploading' && (
              <>
                <ServerCog size={36} color="var(--secondary)" className="spin" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Analyzing JD & Extracting Keyterms...</h4>
              </>
            )}

            {status === 'ready' && (
              <>
                <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--success)' }}>
                  {roleTitle} Initialized!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                  ✅ {keywordsCount} Domain Keyterms injected for Prisma v3.0 STT boosting
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertTriangle size={36} color="var(--error)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--error)' }}>Initialization Failed</h4>
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', margin: 0 }}>{errorMessage}</p>
              </>
            )}
          </div>
        </div>

        {/* Action Area: Self-Practice vs Recruiter Link */}
        {status === 'ready' && mode === 'practice' && (
          <button 
            className="btn-primary" 
            onClick={handleStartInterview}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Launch Live Interview Now <ArrowRight size={18} />
          </button>
        )}

        {status === 'ready' && mode === 'recruiter' && (
          <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              SHAREABLE CANDIDATE LINK:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={shareableUrl} 
                style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
              />
              <button 
                className="btn-secondary" 
                onClick={handleCopyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              Send this link to candidates. They will join this exact {track.toUpperCase()} screening in {language} with domain STT boosting.
            </p>
          </div>
        )}

        {status !== 'ready' && (
          <button 
            className="btn-primary" 
            disabled 
            style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed', padding: '0.9rem' }}
          >
            Select a Preset or Upload JD to Continue
          </button>
        )}

      </div>
    </div>
  )
}
