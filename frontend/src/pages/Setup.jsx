import React, { useState, useRef, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ServerCog,
  Briefcase,
  Code,
  Globe,
  Link2,
  Copy,
  UserCheck,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Check,
  Ban,
  Stethoscope,
  Scale,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import LinkExpiryPicker from '../components/LinkExpiryPicker'
import { useToast } from '../components/ui/Toast'

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
      id: 'clinical_health',
      title: 'Clinical healthcare & medical specialist screening',
      subtitle: 'Oral diagnostic reasoning & patient communication',
      description: 'Evaluate clinical symptom triage, differential diagnosis justification, pharmacology protocol, and bedside communication.',
      icon: Stethoscope,
      badge: 'Clinical / Medical',
      defaultRoleTitle: 'Clinical Healthcare Specialist Screening',
      presetTitle: 'Apply clinical healthcare rubric',
      backendTrack: 'bda',
      presetJd: `Role: Clinical Healthcare Specialist / Medical Officer
Key Evaluation Competencies:
- Systematic clinical inquiry, chief complaint triage, and differential diagnosis formulation.
- Pharmacology safety: drug-drug interactions, contraindications, and emergency dosage protocols.
- Patient-centric communication: explaining complex conditions with empathy in regional languages.
- Ethical compliance, patient privacy (HIPAA/DISHA guidelines), and evidence-based medicine justification.`,
    },
    {
      id: 'legal_counsel',
      title: 'Corporate legal counsel & compliance screening',
      subtitle: 'Statutory interpretation & regulatory oral defense',
      description: 'Assess dispute mitigation, contract liability analysis, statutory compliance, and persuasive oral advocacy.',
      icon: Scale,
      badge: 'Legal / Regulatory',
      defaultRoleTitle: 'Corporate Legal Counsel Screening',
      presetTitle: 'Apply legal counsel rubric',
      backendTrack: 'bda',
      presetJd: `Role: Corporate Legal Counsel & Compliance Lead
Key Evaluation Competencies:
- Commercial contract risk analysis: indemnity clauses, liability caps, and termination provisions.
- Statutory regulatory compliance: Companies Act, arbitration frameworks, and data protection law.
- Rapid oral issue spotting, persuasive argument structuring, and cross-examination resilience.
- Clear stakeholder advisory: translating complex legal jargon into decisive executive counsel.`,
    },
    {
      id: 'bda',
      title: 'Enterprise BDA & corporate sales screening',
      subtitle: 'Consultative pitch & objection handling',
      description: 'Prospective buyer simulation evaluating discovery, pricing pushback, and closing clarity.',
      icon: Briefcase,
      badge: 'Enterprise Sales',
      defaultRoleTitle: 'Enterprise BDA Sales & Pitch Screening',
      presetTitle: 'Apply standard BDA sales rubric',
      backendTrack: 'bda',
      presetJd: `Role: Business Development Associate (BDA) / Enterprise Sales Representative
Key Requirements:
- Consultative selling, customer pain-point discovery, and value articulation.
- High-stakes objection handling (budget freezes, competitor comparison, ROI skepticism).
- Fluent multi-turn rapport building in Hinglish or regional Indian languages.
- Clear closing methodology, contract pilot proposal, and follow-up urgency.`,
    },
    {
      id: 'tech',
      title: 'Technical software engineer (SDE) screening',
      subtitle: 'Live code editor + oral defense',
      description: 'Assess algorithmic problem-solving, Python/C/C++/Java implementation, and verbal explanation.',
      icon: Code,
      badge: 'Software Engineering',
      defaultRoleTitle: 'Technical Software Engineer (SDE) Screening',
      presetTitle: 'Apply standard SDE rubric',
      backendTrack: 'tech',
      presetJd: `Role: Full Stack / Backend Software Engineer (SDE)
Key Requirements:
- Strong algorithmic problem solving in Python, Data Structures (Hash Maps, Trees, Graphs, Sorting).
- Ability to explain time and space complexity (Big-O) aloud clearly.
- RESTful API design, database querying, and debugging skills.
- Clean code readability, edge case handling, and modular architecture.`,
    },
  ],
  teacher: [
    {
      id: 'med_viva',
      title: 'MBBS clinical case presentation & pharmacology viva',
      subtitle: 'Oral diagnostic reasoning & clinical protocol defense',
      description: 'Medical students present patient case histories, defend diagnostic tests, and explain pharmacotherapy aloud.',
      icon: Stethoscope,
      badge: 'Medical viva',
      defaultRoleTitle: 'MBBS Clinical Medicine Oral Viva',
      presetTitle: 'Apply clinical medicine viva syllabus',
      backendTrack: 'bda',
      presetJd: `Academic Assessment: MBBS Clinical Medicine & Pharmacology Oral Viva
Examination Syllabus:
- Comprehensive case history presentation, vital sign interpretation, and differential diagnostic tree.
- Pharmacology rationale: first-line therapeutics, adverse drug reactions, and contraindications.
- Pathophysiology oral defense: articulating disease mechanism and diagnostic laboratory findings.
- Clinical ethics, medical jurisprudence, and emergency triage response protocols.`,
    },
    {
      id: 'law_moot',
      title: 'Constitutional law & moot court oral defense',
      subtitle: 'Appellate advocacy & judicial inquiry simulation',
      description: 'Law students present legal arguments, cite landmark precedents, and answer probing judicial questions.',
      icon: Scale,
      badge: 'Law moot viva',
      defaultRoleTitle: 'Constitutional Law & Moot Court Oral Defense',
      presetTitle: 'Apply constitutional law moot rubric',
      backendTrack: 'bda',
      presetJd: `Academic Assessment: Constitutional Law & Moot Court Oral Defense
Examination Rubric:
- Sound invocation of statutory provisions, constitutional articles, and binding appellate precedents.
- Clear framing of propositions, jurisdictional standing, and balance of convenience.
- Composure under direct judicial questioning and ability to rebut adversarial arguments.
- Professional courtroom decorum, oral clarity, and precise legal terminology in English and regional languages.`,
    },
    {
      id: 'lab_viva',
      title: 'CS practical coding & lab oral viva',
      subtitle: 'Live code editor + lab rubric defense',
      description: 'Students implement data structures in the editor and orally explain time complexity and edge cases.',
      icon: Code,
      badge: 'CS practical viva',
      defaultRoleTitle: 'CS Practical Coding & Lab Oral Viva',
      presetTitle: 'Apply standard Python lab rubric',
      backendTrack: 'tech',
      presetJd: `Academic Course: CS301 Data Structures & Algorithms Practical Viva
Lab Rubric:
- Practical coding in Python: Lists, Stacks, Queues, Binary Trees, Hash Tables, Recursion.
- Oral viva defense: Explain line-by-line code logic, time complexity O(n), and space complexity.
- Edge case handling: Empty inputs, null pointers, and boundary conditions.
- Adherence to academic integrity and anti-cheat voice defense.`,
    },
    {
      id: 'capstone',
      title: 'Interdisciplinary capstone thesis oral defense',
      subtitle: 'Methodology, research rigor & outcomes defense',
      description: 'Students across all disciplines defend their research methodology, analysis, and conclusions.',
      icon: GraduationCap,
      badge: 'Thesis defense',
      defaultRoleTitle: 'Final Year Capstone Project Defense',
      presetTitle: 'Apply capstone defense rubric',
      backendTrack: 'bda',
      presetJd: `Academic Assessment: Final Year Capstone Project & Thesis Oral Defense
Defense Criteria:
- Clear articulation of research hypothesis, problem statement, and real-world significance.
- Defense of methodology, data collection integrity, experimental controls, and analytical validity.
- Critical evaluation of study limitations, comparative literature review, and ethical considerations.
- Coherent multi-turn oral presentation and composure during professor Q&A inquiry.`,
    },
  ],
  student: [
    {
      id: 'student_med',
      title: 'Clinical case study & medical viva prep',
      subtitle: 'Oral diagnostic reasoning & pharmacology practice',
      description: 'Practice walking through patient symptoms, formulating differential diagnoses, and defending prescriptions aloud.',
      icon: Stethoscope,
      badge: 'Medical prep',
      defaultRoleTitle: 'Medical Case Study Viva Practice',
      presetTitle: 'Load medical viva practice rubric',
      backendTrack: 'bda',
      presetJd: `Practice Topic: Clinical Case Presentation & Pharmacology Viva Practice
Focus Areas:
- Explaining symptom etiology, disease pathogenesis, and vital signs interpretation aloud.
- Defending medication choices, contraindications, and emergency treatment steps.
- Practicing patient consultation and clear clinical articulation in English or regional languages.`,
    },
    {
      id: 'student_law',
      title: 'Law moot court & precedent argument prep',
      subtitle: 'Oral advocacy & case law defense',
      description: 'Practice citing legal precedents, formulating arguments under bench questioning, and answering tough judge queries.',
      icon: Scale,
      badge: 'Law prep',
      defaultRoleTitle: 'Moot Court Oral Defense Practice',
      presetTitle: 'Load moot court practice rubric',
      backendTrack: 'bda',
      presetJd: `Practice Topic: Constitutional Law & Moot Court Advocacy Practice
Focus Areas:
- Presenting legal propositions clearly within time constraints.
- Citing relevant landmark judgments and defending against judicial skepticism.
- Rebutting counter-arguments calmly with professional legal composure.`,
    },
    {
      id: 'student_lab',
      title: 'CS practical lab exam & coding viva prep',
      subtitle: 'Live code editor + oral defense',
      description: 'Practice solving programming problems and defending your code aloud before your course viva.',
      icon: Code,
      badge: 'CS lab prep',
      defaultRoleTitle: 'Python Data Structures Lab Viva Practice',
      presetTitle: 'Load lab viva practice rubric',
      backendTrack: 'tech',
      presetJd: `Practice Topic: Data Structures & Python Viva Practice
Focus Areas:
- Writing clean Python functions for arrays, linked lists, trees, and hashing.
- Speaking fluently about time/space complexity in English or Hinglish.
- Answering follow-up questions from the AI professor on edge cases.`,
    },
    {
      id: 'student_mgmt',
      title: 'MBA case study & strategy viva prep',
      subtitle: 'Business framework & oral analysis practice',
      description: 'Practice defending market entry, unit economics, financial trade-offs, and strategic decision trees.',
      icon: Briefcase,
      badge: 'Business prep',
      defaultRoleTitle: 'MBA Strategy Case Defense Practice',
      presetTitle: 'Load business case practice rubric',
      backendTrack: 'bda',
      presetJd: `Practice Topic: MBA Case Analysis & Business Strategy Viva Practice
Focus Areas:
- Structuring qualitative and quantitative insights using standard management frameworks.
- Articulating unit economics, competitive moat, and revenue model defensibility aloud.
- Handling follow-up probing questions with executive poise and data backing.`,
    },
  ],
  candidate: [
    {
      id: 'cand_med',
      title: 'Healthcare & clinical specialist interview prep',
      subtitle: 'Clinical protocols & patient triage simulation',
      description: 'Practice answering clinical case questions, patient communication, and hospital protocols.',
      icon: Stethoscope,
      badge: 'Clinical prep',
      defaultRoleTitle: 'Clinical Specialist Practice Interview',
      presetTitle: 'Load clinical practice rubric',
      backendTrack: 'bda',
      presetJd: `Target Role: Clinical Specialist / Medical Officer
Practice Goals:
- Explain diagnostic steps and clinical workflow clearly under pressure.
- Demonstrate patient-first bedside communication and de-escalation in Indian languages.
- Defend protocol choices, emergency triage priorities, and safety standards.`,
    },
    {
      id: 'cand_legal',
      title: 'Legal counsel & compliance interview prep',
      subtitle: 'Regulatory advisory & risk negotiation role-play',
      description: 'Practice answering legal scenario questions, contract dispute handling, and compliance defense.',
      icon: Scale,
      badge: 'Legal prep',
      defaultRoleTitle: 'Legal Counsel Practice Interview',
      presetTitle: 'Load legal practice rubric',
      backendTrack: 'bda',
      presetJd: `Target Role: Corporate Legal Counsel / Compliance Associate
Practice Goals:
- Deliver crisp verbal analysis of commercial contract clauses and risk allocations.
- Explain compliance implications in plain business terms to non-legal stakeholders.
- Maintain professional composure during adversarial questioning.`,
    },
    {
      id: 'cand_bda',
      title: 'Enterprise BDA & sales pitch interview prep',
      subtitle: 'Voice pitching & negotiation role-play',
      description: 'Practice product pitches and price objection handling in 10+ Indian languages.',
      icon: Briefcase,
      badge: 'Sales prep',
      defaultRoleTitle: 'BDA Sales Pitch & Objection Handling Prep',
      presetTitle: 'Load BDA sales practice rubric',
      backendTrack: 'bda',
      presetJd: `Target Role: Business Development Associate (BDA)
Practice Goals:
- Master cold pitch opening and value proposition in Hinglish or regional languages.
- Handle tough price and timing objections persuasively without sounding defensive.
- Secure customer commitment and close next steps.`,
    },
    {
      id: 'cand_tech',
      title: 'Software engineer (SDE) technical prep',
      subtitle: 'Live code editor + system defense',
      description: 'Solve coding problems and practice explaining algorithmic trade-offs.',
      icon: Code,
      badge: 'SDE prep',
      defaultRoleTitle: 'Software Engineer (SDE) Practice Interview',
      presetTitle: 'Load SDE technical practice rubric',
      backendTrack: 'tech',
      presetJd: `Target Role: Software Development Engineer (SDE)
Practice Goals:
- Write optimal Python code under time constraints.
- Defend space and time complexity trade-offs aloud.
- Walk through edge cases, test inputs, and system scalability.`,
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
  const [createdAssessmentId, setCreatedAssessmentId] = useState('')
  const [linkStatus, setLinkStatus] = useState('active')
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
      triggerAuthRequired('Sign in with Google is required to generate live assessment links or start voice sessions.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    const finalTitle = (customTitle || roleTitle || activeTrackConfig.defaultRoleTitle).trim()
    const finalJd = customJdText !== null ? customJdText : jdText || activeTrackConfig.presetJd
    const backendTrack = activeTrackConfig.backendTrack

    try {
      if (mode === 'assign' && isAssessor) {
        const res = await fetch(`${getBaseUrl()}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
        setCreatedAssessmentId(data.assessment_id || '')
        setLinkStatus('active')
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
        toast({
          title: 'Assessment link generated',
          message: `Extracted ${data.keywords?.length || 0} domain terms.`,
          type: 'success',
        })
      } else {
        const res = await fetch(`${getBaseUrl()}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
        toast({
          title: 'Practice session ready',
          message: `Configured ${data.keywords?.length || 0} domain terms.`,
          type: 'success',
        })
      }
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  const handleToggleGeneratedLinkRevoke = async () => {
    if (!createdAssessmentId || !token) return
    const nextStatus = linkStatus === 'active' ? 'revoked' : 'active'
    try {
      const res = await fetch(`${getBaseUrl()}/api/assessments/${createdAssessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setLinkStatus(nextStatus)
        toast({
          title: nextStatus === 'revoked' ? 'Link revoked' : 'Link reactivated',
          message: nextStatus === 'revoked' ? 'Candidates can no longer claim this link.' : 'Link is active again.',
          type: 'info',
        })
      }
    } catch (err) {
      console.error(err)
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
          Authorization: `Bearer ${token}`,
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
    navigate(
      `/interview?session=${sessionId}&secret=${encodeURIComponent(sessionSecret)}&track=${backendTrack}&lang=${language}`
    )
  }

  const shareableUrl = `${window.location.origin}/assess/${shareToken}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    toast({ title: 'Link copied', message: 'Shareable assessment URL copied to clipboard.', type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pn-container" style={{ maxWidth: '880px', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
          {isAssessor ? (effectiveRole === 'teacher' ? 'Faculty assessment setup' : 'Recruiter screening setup') : 'Candidate practice setup'}
        </div>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '4px' }}>
          {isAssessor
            ? effectiveRole === 'teacher'
              ? 'Create academic viva assessment'
              : 'Create candidate screening link'
            : 'Configure practice session'}
        </h1>
        <p style={{ margin: 0 }}>
          {isAssessor
            ? 'Configure track, language, rubric terms, and single-claimer access parameters.'
            : 'Select a track and language to practice with live voice prompts.'}
        </p>
      </div>

      {/* Quick Join Bar for Students / Candidates */}
      {!isAssessor && (
        <div
          className="panel"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link2 size={16} strokeWidth={1.5} color="var(--text-secondary)" />
              <span>Have an assigned link from your {effectiveRole === 'student' ? 'teacher' : 'recruiter'}?</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
              Paste the URL or token to go directly to the consent and claim screen.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const raw = assignedLinkInput.trim()
              if (!raw) return
              const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
              navigate(`/assess/${match ? match[1] : raw}`)
            }}
            style={{ display: 'flex', gap: '8px', flex: '1 1 260px' }}
          >
            <input
              type="text"
              value={assignedLinkInput}
              onChange={(e) => setAssignedLinkInput(e.target.value)}
              placeholder="Paste /assess/... link or token"
            />
            <button type="submit" className="btn-secondary">
              Open link
            </button>
          </form>
        </div>
      )}

      {/* Main Form Container */}
      <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Assessor Mode Switcher */}
        {isAssessor && (
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--surface-subtle)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              alignSelf: 'flex-start',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('assign')
                setStatus('idle')
              }}
              className="pn-btn-sm"
              style={{
                backgroundColor: mode === 'assign' ? 'var(--surface)' : 'transparent',
                color: mode === 'assign' ? 'var(--text)' : 'var(--text-secondary)',
                border: mode === 'assign' ? '1px solid var(--border-strong)' : '1px solid transparent',
                fontWeight: mode === 'assign' ? 600 : 500,
              }}
            >
              <Link2 size={14} strokeWidth={1.5} />
              <span>{effectiveRole === 'teacher' ? 'Assign viva link' : 'Assign screening link'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('practice')
                setStatus('idle')
              }}
              className="pn-btn-sm"
              style={{
                backgroundColor: mode === 'practice' ? 'var(--surface)' : 'transparent',
                color: mode === 'practice' ? 'var(--text)' : 'var(--text-secondary)',
                border: mode === 'practice' ? '1px solid var(--border-strong)' : '1px solid transparent',
                fontWeight: mode === 'practice' ? 600 : 500,
              }}
            >
              <UserCheck size={14} strokeWidth={1.5} />
              <span>Self-test session</span>
            </button>
          </div>
        )}

        {/* Group 1: Track Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <label style={{ margin: 0, fontWeight: 600 }}>1. Assessment track</label>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Role: <span style={{ textTransform: 'capitalize' }}>{effectiveRole}</span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {currentRoleTracks.map((item) => {
              const isSelected = selectedTrackId === item.id
              const IconComp = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTrack(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectTrack(item)
                    }
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--bg)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <IconComp size={18} strokeWidth={1.5} color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <span className={`pn-badge ${isSelected ? 'pn-badge-primary' : ''}`}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '2px' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Group 2: Title & Language */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label htmlFor="setup-role-title" style={{ fontWeight: 600 }}>
              2. {effectiveRole === 'teacher' ? 'Viva exam title' : effectiveRole === 'recruiter' ? 'Screening role title' : 'Session title'}
            </label>
            <input
              id="setup-role-title"
              type="text"
              value={roleTitle}
              onChange={(e) => {
                setRoleTitle(e.target.value)
                if (status === 'ready') setStatus('idle')
              }}
              placeholder={activeTrackConfig.defaultRoleTitle}
            />
          </div>

          <div>
            <label htmlFor="setup-lang-select" style={{ fontWeight: 600 }}>
              <Globe size={14} strokeWidth={1.5} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Conversation language
            </label>
            <select
              id="setup-lang-select"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                if (status === 'ready') setStatus('idle')
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

        {/* Group 3: Link Settings (Assessors Only) */}
        {isAssessor && mode === 'assign' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>
              <div>
                <label htmlFor="setup-max-attempts" style={{ fontWeight: 600 }}>
                  <ShieldCheck size={14} strokeWidth={1.5} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  3. Attempt limit
                </label>
                <select
                  id="setup-max-attempts"
                  value={maxAttempts}
                  onChange={(e) => {
                    setMaxAttempts(e.target.value)
                    if (status === 'ready') setStatus('idle')
                  }}
                >
                  <option value={1}>1 attempt (single-use exam)</option>
                  <option value={2}>2 attempts</option>
                  <option value={3}>3 attempts</option>
                </select>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>
                    Share scorecard with {effectiveRole === 'teacher' ? 'student' : 'candidate'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {effectiveRole === 'teacher'
                      ? 'Enabled by default for academic feedback.'
                      : 'Disabled by default for corporate screening.'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={shareWithTaker}
                  onChange={(e) => {
                    setShareWithTaker(e.target.checked)
                    if (status === 'ready') setStatus('idle')
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <LinkExpiryPicker
              totalHours={expiresHours}
              onChangeHours={(h) => {
                setExpiresHours(h)
                if (status === 'ready') setStatus('idle')
              }}
            />
          </div>
        )}

        {/* Group 4: Role / Rubric Context */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <label style={{ fontWeight: 600, marginBottom: '10px' }}>
            {isAssessor && mode === 'assign' ? '4.' : '3.'}{' '}
            {effectiveRole === 'teacher'
              ? 'Viva syllabus or lab rubric'
              : effectiveRole === 'recruiter'
              ? 'Job description or evaluation rubric'
              : 'Practice topic & rubric'}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>
                  Standard preset rubric
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Initialize immediately with curated questions and domain terms for {activeTrackConfig.title.toLowerCase()}.
                </div>
              </div>
              <button
                type="button"
                className={status === 'ready' ? 'btn-secondary' : 'btn-primary'}
                disabled={status === 'uploading'}
                onClick={() => initializeContext(activeTrackConfig.presetJd, null, roleTitle || activeTrackConfig.defaultRoleTitle)}
              >
                {status === 'uploading' ? 'Preparing...' : activeTrackConfig.presetTitle}
              </button>
            </div>

            <div
              className={`dropzone ${dragActive ? 'active' : ''} ${status === 'uploading' ? 'uploading' : ''}`}
              onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt"
                style={{ display: 'none' }}
              />

              {status === 'idle' && (
                <div>
                  <UploadCloud size={24} strokeWidth={1.5} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>
                    Or upload custom syllabus / job description (PDF or TXT)
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Domain vocabulary is extracted automatically to improve speech recognition accuracy.
                  </p>
                </div>
              )}

              {status === 'uploading' && (
                <div>
                  <ServerCog size={24} strokeWidth={1.5} color="var(--primary)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    Extracting rubric terms and configuring session...
                  </div>
                </div>
              )}

              {status === 'ready' && (
                <div>
                  <CheckCircle2 size={24} strokeWidth={1.5} color="var(--success-text)" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success-text)' }}>
                    Configuration ready ({keywordsCount} domain terms indexed)
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Click to upload a different file if needed.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div>
                  <AlertTriangle size={24} strokeWidth={1.5} color="var(--danger-text)" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--danger-text)' }}>
                    Setup error
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-text)', margin: '4px 0 12px 0' }}>
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    className="btn-secondary pn-btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStatus('idle')
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Output / Action Section */}
        {status === 'ready' && (mode === 'practice' || !isAssessor) && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-primary" onClick={handleStartPractice}>
              <span>Start live voice session</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {status === 'ready' && mode === 'assign' && isAssessor && (
          <div
            style={{
              backgroundColor: 'var(--bg)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Generated single-claimer link ({effectiveRole === 'teacher' ? 'share with student' : 'share with candidate'})
              </label>
              <span className={`pn-badge ${linkStatus === 'active' ? 'pn-badge-success' : 'pn-badge-danger'}`}>
                {linkStatus === 'active' ? 'Active' : 'Revoked'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="mono-font"
                style={{ flex: 1, minWidth: '220px', backgroundColor: 'var(--surface)' }}
              />
              <button type="button" className="btn-primary" onClick={handleCopyLink}>
                {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
              {createdAssessmentId && (
                <button
                  type="button"
                  className={linkStatus === 'active' ? 'btn-danger' : 'btn-secondary'}
                  onClick={handleToggleGeneratedLinkRevoke}
                >
                  <Ban size={16} strokeWidth={1.5} />
                  <span>{linkStatus === 'active' ? 'Revoke link' : 'Reactivate'}</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
              Valid for {expiresHours >= 24 && expiresHours % 24 === 0 ? `${expiresHours / 24} day(s)` : `${expiresHours} hour(s)`} • Max {maxAttempts} attempt(s). Locked to the first claimer on submission.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
