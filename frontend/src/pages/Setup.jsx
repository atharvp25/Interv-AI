import React, { useState, useRef, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UploadCloud, CheckCircle2, AlertTriangle, ArrowRight,
  ServerCog, Briefcase, Code, Globe, Link2, Copy, Sparkles,
  UserCheck, ShieldCheck, BookOpen, GraduationCap, Users, Check
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import LinkExpiryPicker from '../components/LinkExpiryPicker'
import { useToast } from '../components/ui/Toast'
import Badge from '../components/ui/Badge'

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

const ROLE_TRACK_CONFIGS = {
  recruiter: [
    {
      id: 'tech',
      title: 'Technical Software Engineer (SDE) Screening',
      subtitle: 'Live Python Code Editor + Complexity Defense',
      description: 'Assess algorithmic problem-solving, real-time Python implementation, and oral communication under pressure.',
      icon: Code,
      badge: 'Live Code Editor',
      badgeColor: '#7C5CFF',
      defaultRoleTitle: 'Technical Software Engineer (SDE) Screening',
      presetTitle: 'Use 1-Click SDE Technical Screening Preset',
      backendTrack: 'tech',
      presetJd: `Role: Full Stack / Backend Software Engineer (SDE)
Key Requirements:
- Strong algorithmic problem solving in Python, Data Structures (Hash Maps, Trees, Graphs, Sorting).
- Ability to explain time and space complexity (Big-O) aloud clearly.
- RESTful API design, database querying, and debugging skills.
- Clean code readability, edge case handling, and modular architecture.`,
    },
    {
      id: 'bda',
      title: 'BDA / Enterprise Sales & Pitch Screening',
      subtitle: 'Consultative Pitch & Objection Handling Role-Play',
      description: 'AI acts as a prospective client/CXO testing consultative selling, objection handling, pricing pushback, and deal closing.',
      icon: Briefcase,
      badge: 'Objection Role-Play',
      badgeColor: '#22D3B6',
      defaultRoleTitle: 'Enterprise BDA Sales & Pitch Screening',
      presetTitle: 'Use 1-Click BDA Sales Screening Preset',
      backendTrack: 'bda',
      presetJd: `Role: Business Development Associate (BDA) / Enterprise Sales Representative
Key Requirements:
- Consultative selling, customer pain-point discovery, and value articulation.
- High-stakes objection handling (budget freezes, competitor comparison, ROI skepticism).
- Fluent multi-turn rapport building in Hinglish or regional Indian languages.
- Clear closing methodology, contract pilot proposal, and follow-up urgency.`,
    },
    {
      id: 'ops',
      title: 'Operations & Customer Success Screening',
      subtitle: 'Situational Judgment & Stakeholder Communication',
      description: 'Evaluate customer empathy, conflict de-escalation, cross-functional coordination, and operational problem solving.',
      icon: Users,
      badge: 'Situational Judgment',
      badgeColor: '#FF9F43',
      defaultRoleTitle: 'Operations & Customer Success Screening',
      presetTitle: 'Use 1-Click Operations & Support Screening Preset',
      backendTrack: 'bda',
      presetJd: `Role: Operations Specialist & Customer Success Manager
Key Requirements:
- High empathy and professional de-escalation during client escalations.
- SLA adherence, root-cause incident analysis, and vendor coordination.
- Clear verbal communication in English, Hinglish, or regional languages.
- Process efficiency and analytical decision making under pressure.`,
    },
  ],
  teacher: [
    {
      id: 'lab_viva',
      title: 'CS Practical Coding & Lab Oral Viva',
      subtitle: 'Live Python Code Editor + Lab Rubric Defense',
      description: 'Students implement data structures in the live Python editor and orally defend their implementation, time complexity, and edge cases.',
      icon: Code,
      badge: 'Live Lab Editor',
      badgeColor: '#7C5CFF',
      defaultRoleTitle: 'CS Practical Coding & Lab Oral Viva',
      presetTitle: 'Use 1-Click Python Lab Viva Preset',
      backendTrack: 'tech',
      presetJd: `Academic Course: CS301 Data Structures & Algorithms Practical Viva
Lab Rubric:
- Practical coding in Python: Lists, Stacks, Queues, Binary Trees, Hash Tables, Recursion.
- Oral viva defense: Explain line-by-line code logic, time complexity O(n), and space complexity.
- Edge case handling: Empty inputs, null pointers, and boundary conditions.
- Adherence to academic integrity and anti-cheat voice defense.`,
    },
    {
      id: 'theory_viva',
      title: 'Core Engineering & DSA Theory Viva',
      subtitle: 'Oral Examination on Algorithms, OOP & OS',
      description: 'Rigorous academic oral examination evaluating theoretical mastery of algorithmic complexity, tree traversals, memory management, and OOP.',
      icon: BookOpen,
      badge: 'Oral Theory Viva',
      badgeColor: '#A78BFA',
      defaultRoleTitle: 'Core CS & DSA Theory Oral Viva',
      presetTitle: 'Use 1-Click DSA & Theory Viva Preset',
      backendTrack: 'tech',
      presetJd: `Academic Course: Core Computer Science & Algorithms Theory Viva
Viva Syllabus:
- Asymptotic notations: Big-O, Omega, Theta analysis.
- Tree and graph traversals: BFS, DFS, Dijkstra, AVL trees.
- Object-Oriented Programming (OOP): Inheritance, Polymorphism, Encapsulation, Abstraction.
- Operating Systems & Database fundamentals: Deadlocks, Paging, ACID properties, Normalization.`,
    },
    {
      id: 'capstone',
      title: 'Capstone Project Oral Defense & Architecture',
      subtitle: 'System Architecture & Implementation Defense',
      description: 'Students defend their final year engineering capstone architecture, API schemas, design patterns, and database choices.',
      icon: GraduationCap,
      badge: 'Project Defense',
      badgeColor: '#22D3B6',
      defaultRoleTitle: 'Final Year Capstone Project Defense',
      presetTitle: 'Use 1-Click Capstone Defense Preset',
      backendTrack: 'tech',
      presetJd: `Academic Assessment: Final Year Capstone Project Oral Defense
Defense Criteria:
- End-to-end system architecture and tech stack justification.
- API design, database schemas, normalization, and scaling considerations.
- Security practices, authentication flows, and automated testing.
- Individual contribution breakdown and oral technical defense.`,
    },
  ],
  student: [
    {
      id: 'student_lab',
      title: 'CS Practical Lab Exam & Coding Viva Prep',
      subtitle: 'Live Python Code Editor + Oral Defense',
      description: 'Practice solving programming problems and defending your code aloud before your professor conducts the viva.',
      icon: Code,
      badge: 'Lab Exam Prep',
      badgeColor: '#7C5CFF',
      defaultRoleTitle: 'Python Data Structures Lab Viva Practice',
      presetTitle: 'Use 1-Click Lab Viva Practice Preset',
      backendTrack: 'tech',
      presetJd: `Practice Topic: Data Structures & Python Viva Practice
Focus Areas:
- Writing clean Python functions for arrays, linked lists, trees, and hashing.
- Speaking fluently about time/space complexity in English or Hinglish.
- Answering follow-up questions from the AI professor on edge cases.`,
    },
    {
      id: 'student_theory',
      title: 'Computer Science Theory & DSA Viva Prep',
      subtitle: 'Oral Defense on Algorithms, OOP & System Fundamentals',
      description: 'Sharpen your theoretical concepts with interactive AI questioning in your preferred Indian language.',
      icon: BookOpen,
      badge: 'Oral Theory Prep',
      badgeColor: '#A78BFA',
      defaultRoleTitle: 'CS Theory & DSA Viva Prep',
      presetTitle: 'Use 1-Click CS Theory Practice Preset',
      backendTrack: 'tech',
      presetJd: `Practice Topic: CS Theory, Algorithms & OOP Viva Prep
Focus Areas:
- Explaining sorting algorithms, search complexity, and recursion trees aloud.
- Real-world examples of OOP principles (Polymorphism, Abstraction).
- Database transactions, indexing, and OS scheduling concepts.`,
    },
  ],
  candidate: [
    {
      id: 'cand_tech',
      title: 'Software Engineer (SDE) Technical Prep',
      subtitle: 'Live Python Editor + System Defense',
      description: 'Solve coding challenges in real-time and practice explaining algorithmic complexity to an AI interviewer.',
      icon: Code,
      badge: 'SDE Interview Prep',
      badgeColor: '#7C5CFF',
      defaultRoleTitle: 'Software Engineer (SDE) Practice Interview',
      presetTitle: 'Use 1-Click SDE Technical Practice Preset',
      backendTrack: 'tech',
      presetJd: `Target Role: Software Development Engineer (SDE)
Practice Goals:
- Write optimal Python code under time constraints.
- Defend space and time complexity trade-offs aloud.
- Walk through edge cases, test inputs, and system scalability.`,
    },
    {
      id: 'cand_bda',
      title: 'BDA / Sales Pitch & Objection Handling Prep',
      subtitle: 'Voice Pitching & Negotiation Role-Play',
      description: 'Practice high-conviction product pitches and price objection handling in 10+ Indian languages against an AI buyer.',
      icon: Briefcase,
      badge: 'Sales Pitch Prep',
      badgeColor: '#22D3B6',
      defaultRoleTitle: 'BDA Sales Pitch & Objection Handling Prep',
      presetTitle: 'Use 1-Click BDA Sales Pitch Practice Preset',
      backendTrack: 'bda',
      presetJd: `Target Role: Business Development Associate (BDA)
Practice Goals:
- Master cold pitch opening and value proposition in Hinglish or regional languages.
- Handle tough price and timing objections persuasively without sounding defensive.
- Secure customer commitment and close next steps.`,
    },
  ],
}

export default function Setup() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const { token, effectiveRole, isAssessor, guestMode, triggerAuthRequired } = useContext(AuthContext)

  const currentRoleTracks =
    ROLE_TRACK_CONFIGS[effectiveRole] ||
    (isAssessor ? ROLE_TRACK_CONFIGS.recruiter : ROLE_TRACK_CONFIGS.candidate)

  const [mode, setMode] = useState(isAssessor ? 'assign' : 'practice')
  const [selectedTrackId, setSelectedTrackId] = useState(currentRoleTracks[0]?.id || 'tech')
  const [language, setLanguage] = useState('hinglish')
  const [status, setStatus] = useState('idle') // idle, uploading, ready, error
  const [errorMessage, setErrorMessage] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const [roleTitle, setRoleTitle] = useState(currentRoleTracks[0]?.defaultRoleTitle || '')
  const [jdText, setJdText] = useState('')
  const [jdFileId, setJdFileId] = useState(null)
  const [expiresHours, setExpiresHours] = useState(168)
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [shareWithTaker, setShareWithTaker] = useState(effectiveRole === 'teacher')

  const [sessionId, setSessionId] = useState('')
  const [sessionSecret, setSessionSecret] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [assignedLinkInput, setAssignedLinkInput] = useState('')

  useEffect(() => {
    setMode(isAssessor ? 'assign' : 'practice')
    setShareWithTaker(effectiveRole === 'teacher')
    const tracks =
      ROLE_TRACK_CONFIGS[effectiveRole] ||
      (isAssessor ? ROLE_TRACK_CONFIGS.recruiter : ROLE_TRACK_CONFIGS.candidate)
    if (tracks.length > 0) {
      setSelectedTrackId(tracks[0].id)
      setRoleTitle(tracks[0].defaultRoleTitle)
    }
    setStatus('idle')
  }, [effectiveRole, isAssessor])

  const activeTrackConfig =
    currentRoleTracks.find((t) => t.id === selectedTrackId) || currentRoleTracks[0]

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  const handleSelectTrack = (trackItem) => {
    setSelectedTrackId(trackItem.id)
    setRoleTitle(trackItem.defaultRoleTitle)
    setJdText('')
    setJdFileId(null)
    if (status === 'ready') setStatus('idle')
  }

  const initializeContext = async (customJdText = null, customJdId = null, customTitle = null) => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to generate live assessment links or launch live voice interviews. Guest Mode is for UI exploration only.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    const finalTitle = (customTitle || roleTitle || activeTrackConfig.defaultRoleTitle).trim()
    const finalJd = customJdText !== null ? customJdText : (jdText || activeTrackConfig.presetJd)
    const backendTrack = activeTrackConfig.backendTrack

    try {
      if (mode === 'assign' && isAssessor) {
        const res = await fetch(`${getBaseUrl()}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_title: finalTitle,
            track: backendTrack,
            language,
            jd_text: finalJd,
            jd_file_id: customJdId || jdFileId,
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
        toast({ title: 'Assessment Link Generated', message: `Boosted ${data.keywords?.length || 0} domain keyterms`, type: 'success' })
      } else {
        const res = await fetch(`${getBaseUrl()}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_title: finalTitle,
            track: backendTrack,
            language,
            jd_text: finalJd,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to initialize practice session')
        setSessionId(data.session_id)
        setSessionSecret(data.session_secret || '')
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
        toast({ title: 'Practice Room Ready', message: `Injected ${data.keywords?.length || 0} keyterms into Gnani Prisma STT`, type: 'success' })
      }
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  const processUploadedFile = async (file) => {
    if (!file) return

    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to upload custom documents.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const backendTrack = activeTrackConfig.backendTrack
      const res = await fetch(`${getBaseUrl()}/api/upload-jd?track=${backendTrack}&language=${language}`, {
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

      if (mode === 'assign' && isAssessor) {
        await initializeContext(data.jd_text || '', data.jd_id, uploadedTitle)
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    await processUploadedFile(file)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    await processUploadedFile(file)
  }

  const handleStartPractice = () => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to launch a live practice interview.')
      return
    }
    const backendTrack = activeTrackConfig.backendTrack
    localStorage.setItem('intervai_session', sessionId)
    localStorage.setItem('intervai_session_secret', sessionSecret)
    localStorage.setItem('intervai_track', backendTrack)
    localStorage.setItem('intervai_lang', language)
    navigate(`/interview?session=${sessionId}&secret=${encodeURIComponent(sessionSecret)}&track=${backendTrack}&lang=${language}`)
  }

  const shareableUrl = `${window.location.origin}/assess/${shareToken}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    toast({ title: 'Link Copied to Clipboard', message: 'Ready to share with candidate or student.', type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = isAssessor && mode === 'assign'
    ? ['1. Track & Role', '2. Language & Anti-Cheat', '3. Link Expiry', '4. Keyterm Ingestion']
    : ['1. Select Track', '2. Language Selection', '3. Keyterm Ingestion & Launch']

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <Badge tone="primary" pulse icon={<Sparkles size={14} />}>
            Gnani Prisma v3.0 Keyterm Boosting Studio
          </Badge>
        </div>
        <h1 className="brand-font" style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.35rem)', marginBottom: '0.45rem', fontWeight: 800 }}>
          {isAssessor
            ? effectiveRole === 'teacher'
              ? 'Configure Academic Viva Assessment'
              : 'Configure Candidate Screening Assessment'
            : 'Configure Self-Practice Voice Assessment'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          {isAssessor
            ? effectiveRole === 'teacher'
              ? 'Select exam track, viva language, customizable link expiry, and auto-boost academic rubric keyterms.'
              : 'Select hiring track, interview language, customizable link expiry, and auto-boost technical keyterms.'
            : 'Select your practice track and train against AI voice prompts in 10+ Indian languages.'}
        </p>

        {/* Stepper Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
          {steps.map((step, i) => (
            <span
              key={step}
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                background: status === 'ready' || i === 0 ? 'rgba(124, 92, 255, 0.14)' : 'var(--bg-surface)',
                color: status === 'ready' || i === 0 ? 'var(--primary)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Jump Bar for Students/Candidates */}
      {!isAssessor && (
        <div
          className="pn-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            borderRadius: '18px',
            background: 'rgba(124, 92, 255, 0.06)',
            border: '1px solid rgba(124, 92, 255, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Link2 size={16} color="var(--primary)" /> Have an Assigned Assessment Link from your {effectiveRole === 'student' ? 'Teacher' : 'Recruiter'}?
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Paste your assessment link below to immediately enter your exam room.
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
              style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="pn-btn pn-btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
              Enter Room
            </button>
          </form>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="panel" style={{ padding: '2.2rem', borderRadius: '12px' }}>
        {/* Mode Switcher for Assessors */}
        {isAssessor && (
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', background: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => { setMode('assign'); setStatus('idle'); }}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'assign' ? 'var(--primary)' : 'transparent',
                color: mode === 'assign' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Link2 size={17} />
              {effectiveRole === 'teacher' ? 'Assign Viva Link to Students' : 'Assign Screening Link to Candidates'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('practice'); setStatus('idle'); }}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'practice' ? 'var(--primary)' : 'transparent',
                color: mode === 'practice' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <UserCheck size={17} /> Try Self-Practice Mode
            </button>
          </div>
        )}

        {/* 1. Track Selector Cards */}
        <div style={{ marginBottom: '1.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>
              1. Select {effectiveRole === 'teacher' ? 'Viva Exam Track' : effectiveRole === 'recruiter' ? 'Hiring Track' : 'Practice Track'}
            </label>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Tailored for <strong style={{ color: 'var(--primary)' }}>{effectiveRole?.toUpperCase()}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {currentRoleTracks.map((item) => {
              const isSelected = selectedTrackId === item.id
              const IconComp = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTrack(item)}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface-2)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <div style={{ padding: '0.5rem', borderRadius: '10px', background: `${item.badgeColor}18`, color: item.badgeColor }}>
                        <IconComp size={20} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: `${item.badgeColor}15`, color: item.badgeColor, border: `1px solid ${item.badgeColor}35` }}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="brand-font" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{item.title}</h3>
                    <span style={{ fontSize: '0.76rem', color: 'var(--secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      {item.subtitle}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.48, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Assessment / Session Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', fontSize: '0.92rem' }}>
            2. {effectiveRole === 'teacher' ? 'Viva Exam / Assignment Title' : effectiveRole === 'recruiter' ? 'Screening Role Title' : 'Practice Title'}
          </label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => { setRoleTitle(e.target.value); if (status === 'ready') setStatus('idle'); }}
            placeholder={activeTrackConfig.defaultRoleTitle}
          />
        </div>

        {/* 3. Interview Language & Strict Exam Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: isAssessor && mode === 'assign' ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', fontSize: '0.88rem' }}>
              <Globe size={14} style={{ verticalAlign: 'middle', marginRight: '5px', color: 'var(--secondary)' }} />
              Interview Language
            </label>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); if (status === 'ready') setStatus('idle'); }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
          </div>

          {isAssessor && mode === 'assign' && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', fontSize: '0.88rem' }}>
                <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '5px', color: 'var(--primary)' }} />
                Max Allowed Attempts (Anti-Cheat)
              </label>
              <select
                value={maxAttempts}
                onChange={(e) => { setMaxAttempts(e.target.value); if (status === 'ready') setStatus('idle'); }}
              >
                <option value={1}>1 Attempt (Strict Single-Use Exam)</option>
                <option value={2}>2 Attempts (Retake Allowed)</option>
                <option value={3}>3 Attempts</option>
              </select>
            </div>
          )}
        </div>

        {/* 4. Link Expiry Window */}
        {isAssessor && mode === 'assign' && (
          <div style={{ marginBottom: '1.75rem' }}>
            <LinkExpiryPicker
              totalHours={expiresHours}
              onChangeHours={(h) => {
                setExpiresHours(h)
                if (status === 'ready') setStatus('idle')
              }}
            />
          </div>
        )}

        {/* 5. Report Sharing Policy */}
        {isAssessor && mode === 'assign' && (
          <div
            style={{
              padding: '1rem 1.2rem',
              borderRadius: '14px',
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
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.15rem' }}>
                Release Evaluation Scorecard to {effectiveRole === 'teacher' ? 'Student' : 'Candidate'}?
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {effectiveRole === 'teacher'
                  ? 'Default ON for Professors so students view pedagogical feedback & AI grading breakdown.'
                  : 'Default OFF for Recruiters (standard corporate hiring practice). You can toggle this on your dashboard anytime.'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareWithTaker}
              onChange={(e) => { setShareWithTaker(e.target.checked); if (status === 'ready') setStatus('idle'); }}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>
        )}

        {/* 6. Context & Gnani Prisma Keyterm Ingestion */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.92rem' }}>
            {isAssessor && mode === 'assign' ? '6.' : '3.'} {effectiveRole === 'teacher' ? 'Viva Rubric / Syllabus Keyterm Ingestion' : effectiveRole === 'recruiter' ? 'Job Description / Rubric Keyterm Ingestion' : 'Practice Topic & Keyterm Ingestion'}
          </label>

          {/* 1-Click Preset Button */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className="pn-btn pn-btn-outline"
              onClick={() => initializeContext()}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '0.85rem',
                borderRadius: '12px',
                borderColor: 'rgba(124, 92, 255, 0.35)',
                background: 'rgba(124, 92, 255, 0.06)',
              }}
            >
              <Sparkles size={16} color="var(--primary)" />
              {activeTrackConfig.presetTitle}
            </button>
          </div>

          {/* Dropzone for Custom PDF / TXT Document */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{
              cursor: 'pointer',
              padding: '1.6rem',
              textAlign: 'center',
              border: `2px dashed ${dragActive ? 'var(--secondary)' : status === 'ready' ? 'var(--success)' : 'var(--border)'}`,
              borderRadius: '16px',
              background: dragActive ? 'rgba(34, 211, 182, 0.06)' : 'var(--bg-main)',
              transition: 'all 0.2s ease',
            }}
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
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.96rem' }}>
                  {effectiveRole === 'teacher'
                    ? 'Or drag & drop custom Viva Rubric / Lab Question Sheet (PDF/TXT)'
                    : effectiveRole === 'recruiter'
                    ? 'Or drag & drop custom Job Description / Hiring Matrix (PDF/TXT)'
                    : 'Or drag & drop your target syllabus / JD document (PDF/TXT)'}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  Extracts technical keyterms in &lt;1ms to boost Gnani Prisma v3.0 STT phonetic accuracy
                </p>
              </>
            )}

            {status === 'uploading' && (
              <>
                <ServerCog size={36} color="var(--secondary)" className="spin" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 700 }}>Extracting Domain Keyterms & Locking Config...</h4>
              </>
            )}

            {status === 'ready' && (
              <>
                <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: 'var(--success)' }}>
                  {roleTitle} Initialized!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  Injected <strong>{keywordsCount}</strong> domain keyterms into Gnani Prisma v3.0 WebSocket headers
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertTriangle size={36} color="var(--error)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 700, color: 'var(--error)' }}>Initialization Failed</h4>
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', margin: 0 }}>{errorMessage}</p>
              </>
            )}
          </div>
        </div>

        {/* Action Area */}
        {status === 'ready' && mode === 'practice' && (
          <button
            className="pn-btn pn-btn-primary"
            onClick={handleStartPractice}
            className="btn-primary"
            onClick={handleStartPractice}
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.96rem', justifyContent: 'center', borderRadius: '8px' }}
          >
            Launch Live Self-Practice Interview <ArrowRight size={18} />
          </button>
        )}

        {status === 'ready' && mode === 'assign' && isAssessor && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--bg-surface-2)',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              ONE-CLAIMER TOKENIZED LINK (SEND TO {effectiveRole === 'teacher' ? 'STUDENT' : 'CANDIDATE'}):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="mono-font"
                style={{ flex: 1, minWidth: '220px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', borderRadius: '6px' }}
              />
              <button
                className="btn-primary"
                onClick={handleCopyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', padding: '0.65rem 1.2rem', borderRadius: '6px' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', marginBottom: 0 }}>
              Protected by SHA-256 token hash. Expires in {expiresHours} hours ({expiresHours >= 24 && expiresHours % 24 === 0 ? `${expiresHours / 24} day(s)` : `${expiresHours} hr(s)`}). Once claimed, no other user can access it.
            </p>
          </motion.div>
        )}

        {status !== 'ready' && (
          <button
            className="btn-primary"
            disabled
            style={{ width: '100%', opacity: 0.45, cursor: 'not-allowed', padding: '0.85rem', justifyContent: 'center', borderRadius: '8px' }}
          >
            Click Preset or Upload Document Above to Initialize
          </button>
        )}
      </div>
    </div>
  )
}
