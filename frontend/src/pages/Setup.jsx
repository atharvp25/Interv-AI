import React, { useState, useRef, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud, CheckCircle2, AlertTriangle, ArrowRight,
  ServerCog, Briefcase, Code, Globe, Link2, Copy, Sparkles, UserCheck, Clock, ShieldCheck
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
  const { token, effectiveRole, isAssessor, guestMode, triggerAuthRequired } = useContext(AuthContext)

  // Assessors default to creating assigned links; Takers only have Self-Practice
  const [mode, setMode] = useState(isAssessor ? 'recruiter' : 'practice')
  const [track, setTrack] = useState(effectiveRole === 'recruiter' ? 'bda' : 'tech')
  const [language, setLanguage] = useState('hinglish')
  const [status, setStatus] = useState('idle') // idle, uploading, ready, error
  const [errorMessage, setErrorMessage] = useState('')

  // Assessment / Session fields
  const [roleTitle, setRoleTitle] = useState('')
  const [jdText, setJdText] = useState('')
  const [jdFileId, setJdFileId] = useState(null)
  const [expiresHours, setExpiresHours] = useState(168) // 7 days
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [shareWithTaker, setShareWithTaker] = useState(effectiveRole === 'teacher')

  // Output state
  const [sessionId, setSessionId] = useState('')
  const [sessionSecret, setSessionSecret] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [assignedLinkInput, setAssignedLinkInput] = useState('')

  useEffect(() => {
    setMode(isAssessor ? 'recruiter' : 'practice')
    setShareWithTaker(effectiveRole === 'teacher')
    if (effectiveRole === 'recruiter') {
      setTrack('bda')
      setRoleTitle('Enterprise BDA Sales & BFSI Screening')
    } else if (effectiveRole === 'teacher') {
      setTrack('tech')
      setRoleTitle('CS Practical Coding & Oral Viva Exam')
    } else {
      setRoleTitle('Python & AI Engineer Practice Viva')
    }
  }, [effectiveRole, isAssessor])

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  // Initialize either an Assigned Assessment (for Recruiter/Teacher) or a Practice Session
  const initializeContext = async (selectedTrack, customJdText = jdText, customJdId = jdFileId, customTitle = roleTitle) => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to create live assessment links or start a practice voice session. Guest Mode is for UI preview only.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')
    const defaultTitle = selectedTrack === 'tech'
      ? (effectiveRole === 'teacher' ? 'CS Practical Coding & Oral Viva' : 'Python & AI Engineer Viva')
      : 'Enterprise BDA Sales & BFSI Screening'
    const finalTitle = (customTitle || defaultTitle).trim()
    setRoleTitle(finalTitle)

    try {
      if (mode === 'recruiter' && isAssessor) {
        const res = await fetch(`${getBaseUrl()}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_title: finalTitle,
            track: selectedTrack,
            language,
            jd_text: customJdText,
            jd_file_id: customJdId,
            expires_in_hours: Number(expiresHours),
            max_attempts: Number(maxAttempts),
            share_with_taker: shareWithTaker,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to create assessment')
        setShareToken(data.share_token)
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
      } else {
        const res = await fetch(`${getBaseUrl()}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_title: finalTitle,
            track: selectedTrack,
            language,
            jd_text: customJdText,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to initialize practice session')
        setSessionId(data.session_id)
        setSessionSecret(data.session_secret || '')
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
      }
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  // Custom JD File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to upload custom Job Descriptions or Viva Rubrics.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${getBaseUrl()}/api/upload-jd?track=${track}&language=${language}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')

      setJdText(data.jd_text || '')
      setJdFileId(data.jd_id)
      const uploadedTitle = roleTitle || data.role_title || file.name

      if (mode === 'recruiter' && isAssessor) {
        await initializeContext(track, data.jd_text || '', data.jd_id, uploadedTitle)
      } else {
        setSessionId(data.session_id)
        setSessionSecret(data.session_secret || '')
        setRoleTitle(uploadedTitle)
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
      }
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  const handleStartPractice = () => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to launch a live practice interview.')
      return
    }
    localStorage.setItem('intervai_session', sessionId)
    localStorage.setItem('intervai_session_secret', sessionSecret)
    localStorage.setItem('intervai_track', track)
    localStorage.setItem('intervai_lang', language)
    navigate(`/interview?session=${sessionId}&secret=${encodeURIComponent(sessionSecret)}&track=${track}&lang=${language}`)
  }

  const shareableUrl = `${window.location.origin}/assess/${shareToken}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '880px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2.1rem', marginBottom: '0.4rem', fontWeight: 700 }}>
          {isAssessor
            ? effectiveRole === 'teacher'
              ? 'Create College Viva Exam or Practice'
              : 'Create Candidate Screening or Practice'
            : 'Self-Practice Voice Assessment'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isAssessor
            ? 'Configure your track, Indian language, and tokenized link settings with automatic Gnani Prisma keyterm boosting.'
            : 'Practice explaining your code aloud or handling sales objections in 10+ Indian languages.'}
        </p>
      </div>

      {/* For Students/Candidates: Quick Box to Open an Assigned Link from Teacher/Recruiter */}
      {!isAssessor && (
        <div
          className="panel animate-in"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(37, 99, 235, 0.04)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link2 size={16} color="var(--primary)" /> Have an Assigned Assessment Link from your Teacher or Recruiter?
            </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paste the link or token below to enter your assigned exam room.
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const raw = assignedLinkInput.trim()
              if (!raw) return
              const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
              navigate(`/assess/${match ? match[1] : raw}`)
            }}
            style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}
          >
            <input
              type="text"
              value={assignedLinkInput}
              onChange={(e) => setAssignedLinkInput(e.target.value)}
              placeholder="Paste /assess/... link or token"
              style={{ flex: 1, padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
              Open Link
            </button>
          </form>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="panel animate-in" style={{ padding: '2rem', borderRadius: '16px' }}>
        {/* Mode Switcher — Only Assessors (Recruiter / Teacher) see the Assigned Link tab */}
        {isAssessor && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => { setMode('recruiter'); setStatus('idle'); }}
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
              }}
            >
              <Link2 size={18} />
              {effectiveRole === 'teacher' ? 'Assign Viva Link to Students' : 'Assign Screening Link to Candidates'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('practice'); setStatus('idle'); }}
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
              }}
            >
              <UserCheck size={18} /> Try Self-Practice Mode
            </button>
          </div>
        )}

        {/* Assessment / Session Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.92rem' }}>
            1. Assessment / Session Title
          </label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => { setRoleTitle(e.target.value); if (status === 'ready') setStatus('idle'); }}
            placeholder={
              effectiveRole === 'teacher'
                ? 'e.g. CS302 Data Structures & Python Viva — Batch B'
                : 'e.g. Enterprise BDA Sales Pitch Screening (Hinglish)'
            }
          />
        </div>

        {/* Track Selector Cards */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.92rem' }}>
            2. Select Assessment Track
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Tech Track Card */}
            <div
              onClick={() => { setTrack('tech'); if (status === 'ready') setStatus('idle'); }}
              style={{
                padding: '1.2rem',
                borderRadius: '12px',
                border: `2px solid ${track === 'tech' ? 'var(--primary)' : 'var(--border)'}`,
                background: track === 'tech' ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                  <Code size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0 }}>Practical Coding & Oral Viva</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Python Editor + Oral Defense</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                Ideal for college lab vivas & SDE screening. Candidate writes Python code and defends time complexity aloud.
              </p>
            </div>

            {/* BDA Track Card */}
            <div
              onClick={() => { setTrack('bda'); if (status === 'ready') setStatus('idle'); }}
              style={{
                padding: '1.2rem',
                borderRadius: '12px',
                border: `2px solid ${track === 'bda' ? 'var(--primary)' : 'var(--border)'}`,
                background: track === 'bda' ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0 }}>BDA / Sales & BFSI Role-Play</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Pitch & Objection Handling</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                AI acts as a skeptical buyer testing consultative pitching, price objection handling, and deal closing.
              </p>
            </div>
          </div>
        </div>

        {/* Language Selection + Assessor Link Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: isAssessor && mode === 'recruiter' ? '1fr 1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.45rem', fontSize: '0.88rem' }}>
              <Globe size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Interview Language
            </label>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); if (status === 'ready') setStatus('idle'); }}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
          </div>

          {isAssessor && mode === 'recruiter' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.45rem', fontSize: '0.88rem' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Link Expiry Window
                </label>
                <select
                  value={expiresHours}
                  onChange={(e) => { setExpiresHours(e.target.value); if (status === 'ready') setStatus('idle'); }}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                >
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>7 Days (Default)</option>
                  <option value={336}>14 Days</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.45rem', fontSize: '0.88rem' }}>
                  <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Max Attempts (One-Claimer)
                </label>
                <select
                  value={maxAttempts}
                  onChange={(e) => { setMaxAttempts(e.target.value); if (status === 'ready') setStatus('idle'); }}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                >
                  <option value={1}>1 Attempt (Strict Exam)</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Report Sharing Policy Toggle (For Assessors creating Assigned Links) */}
        {isAssessor && mode === 'recruiter' && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '10px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block' }}>
                Share Evaluation Report with {effectiveRole === 'teacher' ? 'Student' : 'Candidate'}?
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {effectiveRole === 'teacher'
                  ? 'Default ON for Teachers so students learn from feedback. You always see all reports.'
                  : 'Default OFF for Recruiters (standard hiring practice). You can toggle this anytime on your dashboard.'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareWithTaker}
              onChange={(e) => { setShareWithTaker(e.target.checked); if (status === 'ready') setStatus('idle'); }}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        )}

        {/* Context Initialization: 1-Click Preset OR Custom File Upload */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.92rem' }}>
            3. Initialize JD / Viva Rubric & Gnani Prisma Keyterm Boosting
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => initializeContext(track)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem' }}
            >
              <Sparkles size={16} color="var(--primary)" />
              Use 1-Click {track === 'tech' ? 'Python Viva & Coding' : 'BDA Sales Role-Play'} Preset
            </button>
          </div>

          <div
            className={`dropzone ${status === 'uploading' ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', padding: '1.4rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '12px' }}
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
                <UploadCloud size={34} color="var(--primary)" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 600 }}>
                  Or upload custom {effectiveRole === 'teacher' ? 'Viva Rubric / Lab Sheet' : 'Job Description'} (PDF/TXT)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  Automatically extracts domain terms in &lt;1ms to boost Gnani Prisma v3.0 STT accuracy
                </p>
              </>
            )}

            {status === 'uploading' && (
              <>
                <ServerCog size={34} color="var(--secondary)" className="spin" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 600 }}>Extracting Domain Keyterms & Locking Config...</h4>
              </>
            )}

            {status === 'ready' && (
              <>
                <CheckCircle2 size={34} color="var(--success)" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 600, color: 'var(--success)' }}>
                  {roleTitle} Ready!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  ✅ {keywordsCount} Domain Keyterms injected into Gnani Prisma v3.0 WebSocket headers
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertTriangle size={34} color="var(--error)" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 600, color: 'var(--error)' }}>Initialization Failed</h4>
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', margin: 0 }}>{errorMessage}</p>
              </>
            )}
          </div>
        </div>

        {/* Action Area */}
        {status === 'ready' && mode === 'practice' && (
          <button
            className="btn-primary"
            onClick={handleStartPractice}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center' }}
          >
            Launch Live Self-Practice Interview <ArrowRight size={18} />
          </button>
        )}

        {status === 'ready' && mode === 'recruiter' && isAssessor && (
          <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              ONE-CLAIMER TOKENIZED LINK (SEND TO {effectiveRole === 'teacher' ? 'STUDENT' : 'CANDIDATE'}):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={shareableUrl}
                style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
              />
              <button
                className="btn-primary"
                onClick={handleCopyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', padding: '0.6rem 1.1rem' }}
              >
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.55rem', marginBottom: 0 }}>
              🔒 Protected by SHA-256 token hash. Once claimed by a {effectiveRole === 'teacher' ? 'student' : 'candidate'}, no other person can reuse it. Completed reports appear automatically on your Dashboard.
            </p>
          </div>
        )}

        {status !== 'ready' && (
          <button
            className="btn-primary"
            disabled
            style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed', padding: '0.9rem', justifyContent: 'center' }}
          >
            Click Preset or Upload Document Above to Initialize
          </button>
        )}
      </div>
    </div>
  )
}
