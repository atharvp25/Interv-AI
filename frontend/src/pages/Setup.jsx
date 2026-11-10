import React, { useState, useRef, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
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
  Plus,
  Trash2,
  Cpu,
  FileText,
  Eye,
  HelpCircle,
  Building2,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import LinkExpiryPicker from '../components/LinkExpiryPicker'
import { useToast } from '../components/ui/Toast'

const SUPPORTED_LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish (Hindi + English)', script: 'Hinglish' },
  { id: 'hi-IN', label: 'Hindi (हिन्दी)', script: 'हिन्दी' },
  { id: 'mr-IN', label: 'Marathi (मराठी)', script: 'मराठी' },
  { id: 'ta-IN', label: 'Tamil (தமிழ்)', script: 'தமிழ்' },
  { id: 'te-IN', label: 'Telugu (తెలుగు)', script: 'తెలుగు' },
  { id: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)', script: 'ಕನ್ನಡ' },
  { id: 'bn-IN', label: 'Bengali (বাংলা)', script: 'বাংলা' },
  { id: 'gu-IN', label: 'Gujarati (ગુજરાતી)', script: 'ગુજરાતી' },
  { id: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)', script: 'ਪੰਜਾਬੀ' },
  { id: 'ml-IN', label: 'Malayalam (മലയാളം)', script: 'മലയാളം' },
  { id: 'en-IN', label: 'Indian English', script: 'English' },
]

// ── Multi-Discipline Taxonomy & Stream Presets ──────────────────────────────

const DISCIPLINE_TAXONOMY = [
  {
    id: 'medical',
    title: 'Medicine & Healthcare',
    icon: Stethoscope,
    badge: 'Clinical Viva',
    desc: 'Clinical case presentation, differential diagnosis, pharmacology safety, and emergency trauma triage.',
    streams: [
      {
        id: 'mbbs_clinical',
        title: 'MBBS Clinical Case Presentation & Viva',
        subtitle: 'Symptom triage, diagnostic workup, and bedside clinical defense',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Clinical reasoning, diagnostic accuracy, and emergency triage priority.',
        questionBank: [
          'A 55-year-old patient presents with acute substernal chest pressure radiating to the left arm and jaw. What is your immediate diagnostic sequence in the emergency room?',
          'Explain the absolute and relative contraindications for fibrinolytic therapy in this patient.',
          'What are the key differences between STEMI and NSTEMI management protocols in the first golden hour?',
        ],
      },
      {
        id: 'pharma_viva',
        title: 'Pharmacology & Therapeutics Oral Defense',
        subtitle: 'Drug-drug interactions, contraindications, and emergency dosage',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Pharmacodynamics, safety contraindications, and dosage adjustment for organ impairment.',
        questionBank: [
          'Explain the mechanism of action of ACE inhibitors and why they cause dry cough in a subset of patients.',
          'What is the first-line therapeutic protocol for status epilepticus, and what are the primary respiratory risk factors?',
          'Discuss the pharmacological management of acute anaphylactic shock with exact dosage and route justification.',
        ],
      },
      {
        id: 'emergency_triage',
        title: 'Emergency Medicine & Trauma Triage',
        subtitle: 'Golden hour protocol, ABCDE trauma survey, and crisis resuscitation',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Rapid crisis prioritization, airway management, and high-pressure composure.',
        questionBank: [
          'Walk through your rapid ABCDE primary survey for a polytrauma patient following a high-speed collision.',
          'How do you clinically differentiate between tension pneumothorax and cardiac tamponade at the bedside?',
          'Outline your fluid resuscitation protocol in severe burn injuries using the Parkland formula.',
        ],
      },
      {
        id: 'nursing_care',
        title: 'Nursing Care & Patient Communication',
        subtitle: 'Bedside ethics, medication administration, and patient de-escalation',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Patient empathy, sterile technique protocol, and critical communication.',
        questionBank: [
          'How do you handle a distressed patient who refuses a scheduled intravenous medication?',
          'Explain the essential 5 rights of medication administration and post-infusion monitoring.',
          'What are the clinical warning signs of septic shock during continuous vital signs monitoring?',
        ],
      },
    ],
  },
  {
    id: 'law',
    title: 'Law & Judiciary',
    icon: Scale,
    badge: 'Moot Court Viva',
    desc: 'Constitutional doctrines, statutory interpretation, case law precedents, and appellate courtroom advocacy.',
    streams: [
      {
        id: 'consti_moot',
        title: 'Constitutional Law & Appellate Moot Defense',
        subtitle: 'Fundamental rights, judicial review, and landmark Supreme Court precedents',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Jurisdictional standing, doctrine of proportionality, and binding precedent application.',
        questionBank: [
          'How do you establish locus standi under Article 32 of the Constitution for this public interest petition?',
          'How does the landmark Maneka Gandhi precedent expand the scope of procedure established by law under Article 21?',
          'Under what circumstances can a constitutional bench strike down a legislative enactment using the basic structure doctrine?',
        ],
      },
      {
        id: 'criminal_law',
        title: 'Criminal Law & Evidence Defense',
        subtitle: 'Mens rea, evidentiary burden of proof, and criminal trial procedure',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Burden of proof allocation, admissibility of electronic evidence, and cross-examination precision.',
        questionBank: [
          'Explain the legal distinction between Section 299 and Section 300 regarding culpable homicide versus murder.',
          'What are the mandatory statutory conditions for the admissibility of electronic records under Section 65B of the Evidence Act?',
          'How do you establish self-defense as a general exception, and upon whom does the burden of proof lie?',
        ],
      },
      {
        id: 'corporate_law',
        title: 'Corporate, M&A & Commercial Contract Advisory',
        subtitle: 'Indemnity clauses, limitation of liability, and commercial arbitration',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Commercial contract risk allocation, regulatory compliance, and negotiation clarity.',
        questionBank: [
          'What is the legal difference between liquidated damages and a penalty clause in commercial contracts?',
          'How do you structure an indemnity clause to protect against third-party intellectual property infringement claims?',
          'Explain the grounds for setting aside a domestic arbitral award under Section 34 of the Arbitration and Conciliation Act.',
        ],
      },
      {
        id: 'judicial_services',
        title: 'Judicial Services & Jurisprudence Oral Defense',
        subtitle: 'Judicial discretion, natural justice, and statutory interpretation rules',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Application of natural justice principles, statutory canon interpretation, and judicial composure.',
        questionBank: [
          'Explain the rule of purposive construction and when a court should depart from the literal rule.',
          'Discuss the exceptions to the rule against bias (Nemo Judex In Causa Sua) under administrative law.',
          'How should a judicial magistrate balance personal liberty with public interest when considering bail in non-bailable offenses?',
        ],
      },
    ],
  },
  {
    id: 'engineering',
    title: 'Engineering & Applied Sciences',
    icon: Code,
    badge: 'Tech & Core Viva',
    desc: 'Computer science programming & complexity defense, or core mechanical, civil, and electrical engineering.',
    streams: [
      // Tech Software Branches
      {
        id: 'cs_sde',
        title: 'Software Development Engineer (SDE) Viva',
        subtitle: 'Data structures, algorithmic design, and live code implementation',
        backendTrack: 'tech',
        isCoding: true,
        category: 'Tech / Software',
        defaultRubric: 'Time and space complexity (Big-O), optimal algorithmic choices, and edge case coverage.',
        questionBank: [
          'Explain the algorithmic trade-offs between using a hash table versus a balanced binary search tree for range queries.',
          'How would you detect and resolve race conditions in a high-throughput multi-threaded caching service?',
          'Walk through the time and space complexity of merge sort versus quicksort on nearly-sorted data.',
        ],
      },
      {
        id: 'cs_lab',
        title: 'CS Practical Coding & Lab Exam Viva',
        subtitle: 'University course viva: Python, C/C++, stacks, queues, and tree traversals',
        backendTrack: 'tech',
        isCoding: true,
        category: 'Tech / Software',
        defaultRubric: 'Line-by-line code explanation, loop invariants, and boundary conditions.',
        questionBank: [
          'Write and orally explain a function to reverse a singly linked list iteratively and recursively.',
          'Explain how recursion depth impacts system call stack memory and how to avoid stack overflow.',
          'How does hash collision resolution work using separate chaining versus open addressing?',
        ],
      },
      // Core Non-Tech Branches
      {
        id: 'mech_eng',
        title: 'Mechanical Engineering Oral Viva',
        subtitle: 'Thermodynamics, heat transfer, fluid mechanics, and machine design',
        backendTrack: 'bda',
        isCoding: false,
        category: 'Core Engineering',
        defaultRubric: 'Governing physical laws, thermal cycle efficiency, and structural stress analysis.',
        questionBank: [
          'Explain the Second Law of Thermodynamics and how entropy generation limits the Carnot cycle efficiency.',
          'What are the key failure modes in shaft design under combined bending and torsional loads?',
          'Explain boundary layer separation in external fluid flow and practical methods used to delay it.',
        ],
      },
      {
        id: 'civil_eng',
        title: 'Civil & Structural Engineering Viva',
        subtitle: 'Reinforced concrete, soil mechanics, structural load analysis, and seismic design',
        backendTrack: 'bda',
        isCoding: false,
        category: 'Core Engineering',
        defaultRubric: 'Structural safety limit states, shear failure prevention, and geotechnical stability.',
        questionBank: [
          'What is the fundamental difference between working stress method and limit state method in RCC design?',
          'Explain shear failure in deep foundations and how soil bearing capacity is determined using Terzaghi formula.',
          'How do ductile detailing provisions under seismic codes enhance structural energy dissipation during earthquakes?',
        ],
      },
      {
        id: 'elec_eng',
        title: 'Electrical & Electronics Viva',
        subtitle: 'Power systems, circuit theory, semiconductor devices, and signal processing',
        backendTrack: 'bda',
        isCoding: false,
        category: 'Core Engineering',
        defaultRubric: 'Power factor correction, transistor biasing stability, and frequency response.',
        questionBank: [
          'Explain the significance of power factor in AC transmission and methods used for power factor correction.',
          'How does thermal runaway occur in BJT transistors, and how is stability achieved through negative feedback?',
          'Explain the Nyquist-Shannon sampling theorem and the effect of aliasing in digital signal acquisition.',
        ],
      },
    ],
  },
  {
    id: 'management',
    title: 'Management, Business & Sales (MBA / HR)',
    icon: Briefcase,
    badge: 'Business & Role-Play',
    desc: 'Corporate strategy defense, enterprise BDA pitch, HR leadership, and financial modeling.',
    streams: [
      {
        id: 'bda_sales',
        title: 'Enterprise BDA Sales Pitch & Objection Role-Play',
        subtitle: 'Buyer discovery, budget freeze handling, and commercial closing',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Consultative questioning, objection resilience, ROI justification, and closing clarity.',
        questionBank: [
          'Our executive committee has implemented a freeze on new SaaS licenses this quarter. How do you respond?',
          'Your enterprise pricing is 30% higher than our incumbent vendor. Justify why we should switch.',
          'Walk me through how you structure a 60-day paid pilot to de-risk implementation for the CFO.',
        ],
      },
      {
        id: 'mba_strategy',
        title: 'MBA Corporate Strategy & Consulting Case Viva',
        subtitle: 'Market entry, unit economics, Porter five forces, and growth strategy',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Framework structuring, quantitative backing, competitive moat, and defensibility.',
        questionBank: [
          'A leading FMCG brand is experiencing 15% margin erosion in tier-2 cities. How would you diagnose the root cause?',
          'Walk through the unit economics and break-even timeline for an electric two-wheeler subscription model in India.',
          'When evaluating an acquisition target, how do you quantify synergy valuation versus integration execution risk?',
        ],
      },
      {
        id: 'hr_leadership',
        title: 'Human Resources & Organizational Leadership',
        subtitle: 'Talent retention, conflict resolution, labor law compliance, and culture',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Empathy in dispute mitigation, compliance adherence, and strategic talent alignment.',
        questionBank: [
          'How would you manage a high-performing senior manager accused of hostile communication by their team?',
          'Outline your strategic retention framework for critical engineering talent during market attrition spikes.',
          'Explain the statutory compliance obligations under the POSH Act and Industrial Disputes framework.',
        ],
      },
      {
        id: 'finance_viva',
        title: 'Corporate Finance & Valuation Defense',
        subtitle: 'DCF modeling, WACC calculation, capital structure, and risk sensitivity',
        backendTrack: 'bda',
        isCoding: false,
        defaultRubric: 'Discount rate justification, sensitivity testing, and cash flow forecasting precision.',
        questionBank: [
          'Explain how you determine the terminal value growth rate in a DCF model and why it cannot exceed GDP growth.',
          'How does increasing debt leverage impact the Weighted Average Cost of Capital (WACC) under Modigliani-Miller theorem?',
          'Discuss working capital cycle optimization during high-inflation supply chain disruptions.',
        ],
      },
    ],
  },
]

const TONE_OPTIONS = [
  { id: 'socratic', label: 'Socratic Professor', desc: 'Rigorous conceptual follow-ups & "why" inquiries' },
  { id: 'strict_bench', label: 'Strict Courtroom Bench', desc: 'Adversarial cross-examination & high scrutiny' },
  { id: 'executive', label: 'Corporate Executive', desc: 'Commercial ROI, trade-offs, and decisive action' },
  { id: 'supportive', label: 'Supportive Mentor', desc: 'Encouraging tone for constructive student practice' },
]

export default function Setup() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const { token, effectiveRole, isAssessor, guestMode, triggerAuthRequired } = useContext(AuthContext)

  // Mode: Assign (Recruiter/Teacher) or Practice (Student/Candidate)
  const [mode, setMode] = useState(isAssessor ? 'assign' : 'practice')

  // Wizard Step Control (1 to 5)
  const [currentStep, setCurrentStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState('forward')

  // Step 1: Discipline Selection
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('medical')

  // Step 2: Stream Selection
  const [selectedStreamId, setSelectedStreamId] = useState('mbbs_clinical')
  const [engSubFilter, setEngSubFilter] = useState('all') // 'all', 'tech', 'core'

  // Step 3: Teacher Blueprint & Question Bank
  const [roleTitle, setRoleTitle] = useState('MBBS Clinical Case Presentation & Viva')
  const [questionBank, setQuestionBank] = useState([
    'A 55-year-old patient presents with acute substernal chest pressure radiating to the left arm and jaw. What is your immediate diagnostic sequence in the emergency room?',
    'Explain the absolute and relative contraindications for fibrinolytic therapy in this patient.',
    'What are the key differences between STEMI and NSTEMI management protocols in the first golden hour?',
  ])
  const [newQuestionInput, setNewQuestionInput] = useState('')
  const [teacherInstructions, setTeacherInstructions] = useState('')
  const [examinerTone, setExaminerTone] = useState('socratic')

  // Upload custom JD/Syllabus file
  const [jdText, setJdText] = useState('')
  const [jdFileId, setJdFileId] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Step 4: Language & Delivery
  const [language, setLanguage] = useState('hinglish')
  const [expiresHours, setExpiresHours] = useState(168)
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [shareWithTaker, setShareWithTaker] = useState(effectiveRole === 'teacher')

  // Step 5: Output / Link Status
  const [status, setStatus] = useState('idle') // idle, uploading, ready, error
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [sessionSecret, setSessionSecret] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [createdAssessmentId, setCreatedAssessmentId] = useState('')
  const [linkStatus, setLinkStatus] = useState('active')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const activeDiscipline =
    DISCIPLINE_TAXONOMY.find((d) => d.id === selectedDisciplineId) || DISCIPLINE_TAXONOMY[0]
  const activeStream =
    activeDiscipline.streams.find((s) => s.id === selectedStreamId) || activeDiscipline.streams[0]

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  useEffect(() => {
    setMode(isAssessor ? 'assign' : 'practice')
    setShareWithTaker(effectiveRole === 'teacher')
  }, [effectiveRole, isAssessor])

  // When discipline changes, select its first stream & load questions
  const handleSelectDiscipline = (discId) => {
    setSelectedDisciplineId(discId)
    const disc = DISCIPLINE_TAXONOMY.find((d) => d.id === discId) || DISCIPLINE_TAXONOMY[0]
    const stream = disc.streams[0]
    setSelectedStreamId(stream.id)
    setRoleTitle(stream.title)
    setQuestionBank([...stream.questionBank])
    setJdText('')
    setJdFileId(null)
    goToStep(2)
  }

  // When stream changes, update questions & title
  const handleSelectStream = (stream) => {
    setSelectedStreamId(stream.id)
    setRoleTitle(stream.title)
    setQuestionBank([...stream.questionBank])
    setJdText('')
    setJdFileId(null)
    goToStep(3)
  }

  const goToStep = (target) => {
    setSlideDirection(target > currentStep ? 'forward' : 'backward')
    setCurrentStep(target)
  }

  const handleAddQuestion = (e) => {
    if (e) e.preventDefault()
    const q = newQuestionInput.trim()
    if (!q) return
    if (questionBank.length >= 6) {
      toast({ title: 'Question bank limit', message: 'Maximum 6 core questions recommended to prevent interview fatigue.', type: 'info' })
      return
    }
    setQuestionBank([...questionBank, q])
    setNewQuestionInput('')
  }

  const handleRemoveQuestion = (idx) => {
    setQuestionBank(questionBank.filter((_, i) => i !== idx))
  }

  // Generate Link or Practice Session
  const handleGenerateAssessment = async () => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google is required to generate assessment links or launch live interviews.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    const backendTrack = activeStream.backendTrack || 'bda'
    const finalJd = jdText || `${activeStream.title}\n${activeStream.defaultRubric}\n${questionBank.join('\n')}`

    try {
      if (mode === 'assign' && isAssessor) {
        const res = await fetch(`${getBaseUrl()}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_title: roleTitle || activeStream.title,
            track: backendTrack,
            language,
            discipline: selectedDisciplineId,
            specialization: activeStream.title,
            question_bank: questionBank,
            teacher_instructions: teacherInstructions,
            examiner_tone: examinerTone,
            jd_text: finalJd,
            jd_file_id: jdFileId,
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
        goToStep(5)
        toast({
          title: 'Assessment link generated',
          message: `Indexed ${data.keywords?.length || 0} vocabulary terms.`,
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
            role_title: roleTitle || activeStream.title,
            track: backendTrack,
            language,
            discipline: selectedDisciplineId,
            specialization: activeStream.title,
            question_bank: questionBank,
            teacher_instructions: teacherInstructions,
            examiner_tone: examinerTone,
            jd_text: finalJd,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to initialize practice session')
        setSessionId(data.session_id)
        setSessionSecret(data.session_secret || '')
        setKeywordsCount(data.keywords?.length || 0)
        setStatus('ready')
        goToStep(5)
        toast({
          title: 'Practice session ready',
          message: `Loaded viva questions & keywords.`,
          type: 'success',
        })
      }
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  const handleStartPracticeNow = () => {
    if (!sessionId || !sessionSecret) return
    const backendTrack = activeStream.backendTrack || 'bda'
    localStorage.setItem('intervai_track', backendTrack)
    navigate(
      `/interview?session=${sessionId}&secret=${encodeURIComponent(sessionSecret)}&track=${backendTrack}&lang=${language}`
    )
  }

  const handleToggleRevoke = async () => {
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
      triggerAuthRequired('Sign in with Google is required to upload custom syllabus documents.')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const backendTrack = activeStream.backendTrack || 'bda'
      const res = await fetch(`${getBaseUrl()}/api/upload-jd?track=${backendTrack}&language=${language}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')

      setJdText(data.jd_text || '')
      setJdFileId(data.jd_id)
      if (data.role_title) setRoleTitle(data.role_title)
      setKeywordsCount(data.keywords?.length || 0)
      setStatus('idle')
      toast({
        title: 'Document processed',
        message: `Extracted ${data.keywords?.length || 0} terms from ${file.name}.`,
        type: 'success',
      })
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) processUploadedFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processUploadedFile(e.dataTransfer.files[0])
  }

  const shareableUrl = shareToken ? `${window.location.origin}/assess/${shareToken}` : ''

  const handleCopyLink = () => {
    if (!shareableUrl) return
    navigator.clipboard.writeText(shareableUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Link copied', message: 'Single-claimer link copied to clipboard.', type: 'success' })
  }

  const stepClasses = slideDirection === 'forward' ? 'wizard-step-forward' : 'wizard-step-backward'

  return (
    <div className="pn-container" style={{ maxWidth: '820px', paddingTop: '32px', paddingBottom: '64px' }}>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>
              {isAssessor
                ? effectiveRole === 'teacher'
                  ? 'Create viva exam & assessment blueprint'
                  : 'Create candidate screening & interview blueprint'
                : 'Configure practice viva & mock interview'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Guided assessment builder with custom question banks and speech recognition tuning.
            </p>
          </div>

          {/* Assessor mode switcher */}
          {isAssessor && (
            <div style={{ display: 'inline-flex', padding: '3px', background: 'var(--bg)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setMode('assign')}
                className={mode === 'assign' ? 'btn-secondary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Assign to others
              </button>
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={mode === 'practice' ? 'btn-secondary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Self-test run
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="wizard-progress-bar">
        <div className="wizard-progress-line">
          <div
            className="wizard-progress-fill"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>

        {[
          { step: 1, label: 'Discipline' },
          { step: 2, label: 'Stream' },
          { step: 3, label: 'Question bank' },
          { step: 4, label: 'Delivery' },
          { step: 5, label: 'Review & link' },
        ].map((s) => {
          const isDone = currentStep > s.step
          const isCurrent = currentStep === s.step
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                // allow jumping back to completed steps
                if (s.step < currentStep || status === 'ready') goToStep(s.step)
              }}
              className={`wizard-step-node ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <div className="wizard-step-circle">
                {isDone ? <Check size={14} strokeWidth={2.5} /> : s.step}
              </div>
              <span className="wizard-step-label">{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── STEP CONTENT CONTAINER ── */}
      <div className="panel" style={{ padding: '28px', backgroundColor: 'var(--surface)', minHeight: '440px' }}>
        {/* ── STEP 1: SELECT DISCIPLINE ── */}
        {currentStep === 1 && (
          <div className={stepClasses}>
            <div style={{ marginBottom: '20px' }}>
              <span className="pn-badge pn-badge-primary" style={{ marginBottom: '6px' }}>Step 1 of 5</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px 0' }}>
                Select academic faculty or professional discipline
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                IntervAI customizes the AI examiner persona, diagnostic tone, and rubric based on the chosen stream.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {DISCIPLINE_TAXONOMY.map((disc) => {
                const Icon = disc.icon
                const isSelected = selectedDisciplineId === disc.id
                return (
                  <div
                    key={disc.id}
                    onClick={() => handleSelectDiscipline(disc.id)}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-card)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 140ms ease-out',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={18} strokeWidth={1.5} color="var(--primary)" />
                          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                            {disc.title}
                          </h3>
                        </div>
                        <span className="pn-badge">{disc.badge}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {disc.desc}
                      </p>
                    </div>

                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                      <span>{disc.streams.length} specialized streams</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: SELECT STREAM & SPECIALIZATION ── */}
        {currentStep === 2 && (
          <div className={stepClasses}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="pn-badge pn-badge-primary">Step 2 of 5 · {activeDiscipline.title}</span>
                {selectedDisciplineId === 'engineering' && (
                  <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--bg)', padding: '2px', borderRadius: 'var(--radius-btn)' }}>
                    <button
                      type="button"
                      onClick={() => setEngSubFilter('all')}
                      style={{ padding: '4px 10px', fontSize: '12px', border: 'none', background: engSubFilter === 'all' ? 'var(--surface)' : 'transparent', fontWeight: engSubFilter === 'all' ? 600 : 500, borderRadius: 'var(--radius-btn)', cursor: 'pointer' }}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setEngSubFilter('tech')}
                      style={{ padding: '4px 10px', fontSize: '12px', border: 'none', background: engSubFilter === 'tech' ? 'var(--surface)' : 'transparent', fontWeight: engSubFilter === 'tech' ? 600 : 500, borderRadius: 'var(--radius-btn)', cursor: 'pointer' }}
                    >
                      Tech / Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setEngSubFilter('core')}
                      style={{ padding: '4px 10px', fontSize: '12px', border: 'none', background: engSubFilter === 'core' ? 'var(--surface)' : 'transparent', fontWeight: engSubFilter === 'core' ? 600 : 500, borderRadius: 'var(--radius-btn)', cursor: 'pointer' }}
                    >
                      Core / Oral
                    </button>
                  </div>
                )}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px 0' }}>
                Choose specialized examination stream
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select a stream below. Pre-loaded questions and domain terminology will be configured automatically.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {activeDiscipline.streams
                .filter((st) => {
                  if (selectedDisciplineId !== 'engineering' || engSubFilter === 'all') return true
                  if (engSubFilter === 'tech') return st.isCoding
                  if (engSubFilter === 'core') return !st.isCoding
                  return true
                })
                .map((st) => {
                  const isSelected = selectedStreamId === st.id
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleSelectStream(st)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-card)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        transition: 'all 120ms ease-out',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                            {st.title}
                          </span>
                          {st.isCoding ? (
                            <span className="pn-badge pn-badge-primary">Live code editor</span>
                          ) : (
                            <span className="pn-badge">Oral viva voce</span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {st.subtitle}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {st.questionBank.length} questions
                        </span>
                        <ArrowRight size={14} strokeWidth={1.5} color="var(--primary)" />
                      </div>
                    </div>
                  )
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button type="button" className="btn-secondary" onClick={() => goToStep(1)}>
                <ArrowLeft size={14} strokeWidth={1.5} /> Back to disciplines
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: TEACHER BLUEPRINT & QUESTION BANK ── */}
        {currentStep === 3 && (
          <div className={stepClasses}>
            <div style={{ marginBottom: '20px' }}>
              <span className="pn-badge pn-badge-primary">Step 3 of 5 · {activeStream.title}</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px 0' }}>
                Examiner blueprint &amp; viva question bank
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                The AI examiner will ask these questions in sequence and evaluate responses against your criteria.
              </p>
            </div>

            {/* Assessment Title */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                Examination title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. CS301 Practical Viva or MBBS Clinical Final Exam"
                style={{ width: '100%', padding: '9px 12px', fontSize: '14px' }}
              />
            </div>

            {/* Question Bank List */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  Mandatory viva questions ({questionBank.length})
                </label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Asked sequentially by AI examiner
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {questionBank.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-btn)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                      <span className="mono-font" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                        Q{idx + 1}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.45 }}>
                        {q}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Remove question"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Question Form */}
              <form onSubmit={handleAddQuestion} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={(e) => setNewQuestionInput(e.target.value)}
                  placeholder="Type a custom viva question or case scenario..."
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} strokeWidth={1.5} /> Add question
                </button>
              </form>
            </div>

            {/* Examiner Persona & Tone */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                Examiner questioning persona
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {TONE_OPTIONS.map((t) => {
                  const isSelected = examinerTone === t.id
                  return (
                    <div
                      key={t.id}
                      onClick={() => setExaminerTone(t.id)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-btn)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'all 120ms ease-out',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.desc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                Special instructions for AI examiner (optional)
              </label>
              <textarea
                rows={2}
                value={teacherInstructions}
                onChange={(e) => setTeacherInstructions(e.target.value)}
                placeholder="e.g. Probe deeply into drug-drug interactions; require Big-O stated explicitly; test composure against budget freeze objection."
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-secondary" onClick={() => goToStep(2)}>
                <ArrowLeft size={14} strokeWidth={1.5} /> Back to streams
              </button>
              <button type="button" className="btn-primary" onClick={() => goToStep(4)}>
                Next: Delivery settings <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: DELIVERY & LANGUAGE SETTINGS ── */}
        {currentStep === 4 && (
          <div className={stepClasses}>
            <div style={{ marginBottom: '20px' }}>
              <span className="pn-badge pn-badge-primary">Step 4 of 5 · Delivery Settings</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px 0' }}>
                Examination language &amp; access policy
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Configure real-time Indic voice synthesis, single-claimer link security, and duration.
              </p>
            </div>

            {/* Language Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                Spoken examination language
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = language === l.id
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-btn)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                        color: isSelected ? 'var(--primary)' : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all 120ms ease-out',
                      }}
                    >
                      <span>{l.label}</span>
                      {isSelected && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Assessor Delivery Options */}
            {isAssessor && mode === 'assign' && (
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-btn)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      Automatically share 6-axis scorecard report with {effectiveRole === 'teacher' ? 'student' : 'candidate'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {effectiveRole === 'teacher'
                        ? 'Recommended: students learn from detailed feedback and areas for improvement.'
                        : 'Default off: keep evaluation private until recruiter review is completed.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareWithTaker}
                    onChange={(e) => setShareWithTaker(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                <LinkExpiryPicker
                  totalHours={expiresHours}
                  onChangeHours={(h) => setExpiresHours(h)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-secondary" onClick={() => goToStep(3)}>
                <ArrowLeft size={14} strokeWidth={1.5} /> Back to blueprint
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGenerateAssessment}
                disabled={status === 'uploading'}
              >
                {status === 'uploading' ? (
                  <span>Configuring assessment...</span>
                ) : (
                  <>
                    <span>{mode === 'assign' && isAssessor ? 'Generate viva link' : 'Review & launch'}</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: REVIEW & GENERATED LINK ── */}
        {currentStep === 5 && (
          <div className={stepClasses}>
            <div style={{ marginBottom: '20px' }}>
              <span className="pn-badge pn-badge-success">Step 5 of 5 · Ready</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px 0' }}>
                {mode === 'assign' && isAssessor ? 'Viva examination link generated' : 'Practice session ready'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                {mode === 'assign' && isAssessor
                  ? 'Share this secure single-claimer link with your students or candidates.'
                  : 'Your mock viva environment is initialized and ready to start.'}
              </p>
            </div>

            {/* Blueprint Summary Card */}
            <div
              style={{
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
                padding: '18px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                  {roleTitle || activeStream.title}
                </div>
                <span className="pn-badge pn-badge-primary">
                  {activeStream.isCoding ? 'Live code editor' : 'Oral viva voce'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>DISCIPLINE</span>
                  <strong>{activeDiscipline.title}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>LANGUAGE</span>
                  <strong>{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.label}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>QUESTION BANK</span>
                  <strong>{questionBank.length} questions loaded</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>PERSONA TONE</span>
                  <strong>{TONE_OPTIONS.find((t) => t.id === examinerTone)?.label}</strong>
                </div>
              </div>
            </div>

            {/* Generated Link Card (Assessor Mode) */}
            {mode === 'assign' && isAssessor && shareToken && (
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '18px',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border-strong)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    Shareable Single-Claimer Assessment Link
                  </label>
                  <span className={`pn-badge ${linkStatus === 'active' ? 'pn-badge-success' : 'pn-badge-danger'}`}>
                    {linkStatus === 'active' ? 'Active' : 'Revoked'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="mono-font"
                    style={{ flex: 1, minWidth: '240px', backgroundColor: 'var(--bg)' }}
                  />
                  <button type="button" className="btn-primary" onClick={handleCopyLink}>
                    {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.5} />}
                    <span>{copied ? 'Copied' : 'Copy link'}</span>
                  </button>
                  {createdAssessmentId && (
                    <button
                      type="button"
                      className={linkStatus === 'active' ? 'btn-danger' : 'btn-secondary'}
                      onClick={handleToggleRevoke}
                    >
                      <Ban size={15} strokeWidth={1.5} />
                      <span>{linkStatus === 'active' ? 'Revoke link' : 'Reactivate'}</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Valid for {expiresHours >= 24 && expiresHours % 24 === 0 ? `${expiresHours / 24} day(s)` : `${expiresHours} hour(s)`} • Max {maxAttempts} attempt(s). Locks to the student's name on submission.
                </div>
              </div>
            )}

            {/* Launch Practice Button (Practice Mode) */}
            {(mode === 'practice' || !isAssessor) && (
              <div style={{ marginBottom: '24px', textAlign: 'center', padding: '20px 0' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartPracticeNow}
                  style={{ padding: '12px 28px', fontSize: '15px' }}
                >
                  <Eye size={16} strokeWidth={1.5} />
                  <span>Start live voice session now</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-secondary" onClick={() => goToStep(4)}>
                <ArrowLeft size={14} strokeWidth={1.5} /> Edit settings
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  goToStep(1)
                  setStatus('idle')
                }}
              >
                Create another assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
