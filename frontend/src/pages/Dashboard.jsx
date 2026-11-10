import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  AlertCircle,
  RefreshCw,
  Users,
  Link2,
  Award,
  Plus,
  BookOpen,
  FileCheck,
} from 'lucide-react'
import RecruiterDashboardView from '../components/roles/RecruiterDashboardView'
import TeacherDashboardView from '../components/roles/TeacherDashboardView'
import StudentDashboardView from '../components/roles/StudentDashboardView'
import CandidateDashboardView from '../components/roles/CandidateDashboardView'
import PlatformBenchmarkCards from '../components/PlatformBenchmarkCards'
import { SkeletonCard } from '../components/ui/Skeleton'

const GUEST_SAMPLE_EVALUATIONS = {
  teacher: [
    {
      _id: 'sample_eval_teacher_med',
      role_title: 'MBBS Clinical Medicine & Pharmacology Oral Viva',
      taker_name: 'Dr. Ananya Sen',
      taker_email: 'ananya.s@med.college.edu',
      track: 'bda',
      language: 'hinglish',
      is_practice: false,
      timestamp: new Date().toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 9,
        confidence: 8,
        depth: 9,
        completeness: 9,
        overall_score: 8.8,
      },
      feedback: {
        strengths: [
          'Accurate differential diagnosis of acute coronary syndrome vs pulmonary embolism',
          'Clear oral justification of emergency dual antiplatelet dosage and contraindications in Hinglish',
        ],
        areas_for_improvement: [
          'State cardiac troponin test turnaround time benchmarks explicitly',
        ],
        summary: 'Exemplary clinical reasoning and composed diagnostic defense under professor inquiry.',
      },
    },
    {
      _id: 'sample_eval_teacher_law',
      role_title: 'Constitutional Law & Moot Court Oral Defense',
      taker_name: 'Kabir Mehta',
      taker_email: 'kabir.m@law.college.edu',
      track: 'bda',
      language: 'en-IN',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      scores: {
        technical_accuracy: 8,
        communication: 9,
        confidence: 9,
        depth: 8,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Authoritative citation of landmark Supreme Court precedents on Article 21 and proportionality',
          'Maintained professional courtroom decorum under rapid judicial questioning',
        ],
        areas_for_improvement: [
          'Address counter-arguments regarding jurisdictional locus standi earlier',
        ],
        summary: 'Persuasive oral advocacy with strong grasp of constitutional jurisprudence.',
      },
    },
    {
      _id: 'sample_eval_teacher_cs',
      role_title: 'CS301 Python Data Structures Practical Viva',
      taker_name: 'Aarav Kulkarni',
      taker_email: 'aarav.k@college.edu',
      track: 'tech',
      language: 'hinglish',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 8,
        depth: 9,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Submitted O(n) hash-map solution in the live Python editor',
          'Orally explained time and space complexity accurately in Hinglish',
        ],
        areas_for_improvement: [
          'Could discuss edge-case handling for empty arrays earlier',
        ],
        summary: 'Student demonstrated strong alignment between submitted code and oral viva defense.',
      },
    },
    {
      _id: 'sample_eval_teacher_calib',
      role_title: 'Multi-Discipline Oral Viva Calibration Run',
      taker_name: 'Faculty Calibration',
      track: 'bda',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      scores: {
        technical_accuracy: 10,
        communication: 9,
        confidence: 9,
        depth: 10,
        completeness: 9,
        overall_score: 9.4,
      },
      feedback: {
        strengths: ['Verified viva question rubric and audio transcript precision across disciplines'],
        areas_for_improvement: ['None noted — benchmark calibration run'],
        summary: 'Faculty verification of the oral defense rubric and grading criteria.',
      },
    },
  ],
  recruiter: [
    {
      _id: 'sample_eval_recruiter_med',
      role_title: 'Clinical Healthcare Specialist Screening',
      taker_name: 'Dr. Siddharth Rao',
      taker_email: 'siddharth.r@hospital.org',
      track: 'bda',
      language: 'hi-IN',
      is_practice: false,
      timestamp: new Date().toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 9,
        confidence: 8,
        depth: 9,
        completeness: 8,
        overall_score: 8.6,
      },
      feedback: {
        strengths: [
          'Systematic clinical history taking and triage protocol explanation in Hindi',
          'Excellent patient communication and high empathy under crisis scenarios',
        ],
        areas_for_improvement: [
          'Elaborate on multi-department escalation workflows',
        ],
        summary: 'Strong clinical composure, excellent communication, and thorough patient triage protocol.',
      },
    },
    {
      _id: 'sample_eval_recruiter_law',
      role_title: 'Corporate Legal Counsel & Compliance Screening',
      taker_name: 'Meera Nambiar',
      taker_email: 'meera.n@corp.law',
      track: 'bda',
      language: 'en-IN',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 9,
        depth: 8,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Crisp verbal analysis of commercial contract indemnities and limitation of liability clauses',
          'Demonstrated thorough knowledge of statutory data protection provisions',
        ],
        areas_for_improvement: [
          'Clarify arbitration jurisdiction nuances for cross-border contracts',
        ],
        summary: 'Clear stakeholder advisory and sharp commercial contract risk mitigation.',
      },
    },
    {
      _id: 'sample_eval_recruiter_sales',
      role_title: 'Enterprise BDA & SaaS Sales Screening',
      taker_name: 'Priya Deshmukh',
      taker_email: 'priya.d@example.com',
      track: 'bda',
      language: 'hinglish',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
      scores: {
        technical_accuracy: 8,
        communication: 9,
        confidence: 9,
        depth: 8,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Handled quarterly budget-freeze objection with clear ROI breakdown',
          'Natural Hinglish rapport and structured pilot proposal',
        ],
        areas_for_improvement: [
          'Quantify customer acquisition metrics earlier in the pitch',
        ],
        summary: 'Strong consultative pitch with composed objection handling.',
      },
    },
    {
      _id: 'sample_eval_recruiter_tech',
      role_title: 'Backend Software Engineer (SDE-1) Screening',
      taker_name: 'Vikram Nair',
      taker_email: 'vikram.n@example.com',
      track: 'tech',
      language: 'en-IN',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
      scores: {
        technical_accuracy: 7,
        communication: 8,
        confidence: 7,
        depth: 7,
        completeness: 7,
        overall_score: 7.2,
      },
      feedback: {
        strengths: [
          'Clear verbal walkthrough of REST API pagination and data schemas',
        ],
        areas_for_improvement: [
          'Sub-optimal nested loop in initial submission before hints',
        ],
        summary: 'Communicates clearly and responds well to algorithmic hints.',
      },
    },
  ],
  student: [
    {
      _id: 'sample_eval_student_med',
      role_title: 'Clinical Diagnostics & Pharmacology Viva Prep',
      taker_name: 'Student Practice',
      track: 'bda',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date().toISOString(),
      scores: {
        technical_accuracy: 8,
        communication: 9,
        confidence: 8,
        depth: 8,
        completeness: 8,
        overall_score: 8.2,
      },
      feedback: {
        strengths: [
          'Articulated differential diagnosis for acute respiratory distress fluently in Hinglish',
          'Demonstrated safe antibiotic selection rationale',
        ],
        areas_for_improvement: [
          'Review dosage adjustment calculations for renal impairment',
        ],
        summary: 'Composed clinical practice run with strong verbal reasoning.',
      },
    },
    {
      _id: 'sample_eval_student_law',
      role_title: 'Moot Court Advocacy & Case Law Practice',
      taker_name: 'Student Practice',
      track: 'bda',
      language: 'en-IN',
      is_practice: true,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      scores: {
        technical_accuracy: 8,
        communication: 8,
        confidence: 8,
        depth: 8,
        completeness: 8,
        overall_score: 8.0,
      },
      feedback: {
        strengths: [
          'Framed jurisdictional propositions clearly within allotted time',
          'Cited landmark precedents accurately without hesitation',
        ],
        areas_for_improvement: [
          'Prepare stronger rebuttal on balancing tests',
        ],
        summary: 'Solid moot court rehearsal. Ready for inter-university rounds.',
      },
    },
    {
      _id: 'sample_eval_student_tech',
      role_title: 'Python Data Structures & Complexity Viva Practice',
      taker_name: 'Student Practice',
      track: 'tech',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      scores: {
        technical_accuracy: 8,
        communication: 8,
        confidence: 7,
        depth: 8,
        completeness: 8,
        overall_score: 7.8,
      },
      feedback: {
        strengths: [
          'Correct binary search implementation in the Python editor',
          'Clear explanation of loop invariants',
        ],
        areas_for_improvement: [
          'State worst-case space complexity explicitly without prompting',
        ],
        summary: 'Solid viva practice run. Ready for upcoming lab examination.',
      },
    },
  ],
  candidate: [
    {
      _id: 'sample_eval_cand_med',
      role_title: 'Clinical Specialist & Medical Officer Practice',
      taker_name: 'Candidate Practice',
      track: 'bda',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date().toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 9,
        confidence: 8,
        depth: 8,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Structured patient triage communication with high empathy',
          'Clear explanation of hospital safety protocols and emergency triage steps',
        ],
        areas_for_improvement: [
          'Address inter-disciplinary handover procedures earlier',
        ],
        summary: 'Strong clinical communication and composed diagnostic reasoning.',
      },
    },
    {
      _id: 'sample_eval_cand_sales',
      role_title: 'BDA Sales Pitch & Price Objection Practice',
      taker_name: 'Candidate Practice',
      track: 'bda',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 9,
        confidence: 8,
        depth: 8,
        completeness: 8,
        overall_score: 8.4,
      },
      feedback: {
        strengths: [
          'Consultative opening with relevant customer pain points',
          'Clear Hinglish transitions and price objection defense',
        ],
        areas_for_improvement: [
          'Address enterprise SLA and compliance terms earlier in the conversation',
        ],
        summary: 'Strong consultative sales pitch performance.',
      },
    },
    {
      _id: 'sample_eval_cand_tech',
      role_title: 'Software Engineer (SDE-1) Practice Screening',
      taker_name: 'Candidate Practice',
      track: 'tech',
      language: 'en-IN',
      is_practice: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 9,
        depth: 9,
        completeness: 8,
        overall_score: 8.6,
      },
      feedback: {
        strengths: [
          'Clean LRU Cache implementation with O(1) operations',
          'Clear time-space complexity breakdown',
        ],
        areas_for_improvement: [
          'Discuss lock contention in multi-threaded environments',
        ],
        summary: 'Solid technical interview practice with strong algorithmic defense.',
      },
    },
  ],
}

const ROLE_LABELS = {
  recruiter: 'Recruiter',
  teacher: 'Teacher',
  student: 'Student',
  candidate: 'Candidate',
}

export default function Dashboard() {
  const {
    token,
    user,
    guestMode,
    effectiveRole,
    isAssessor,
    openGuestRoleSwitcher,
    triggerAuthRequired,
  } = useContext(AuthContext)
  const navigate = useNavigate()

  const [evaluations, setEvaluations] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(isAssessor ? 'assigned' : 'practice')

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  useEffect(() => {
    setActiveTab(isAssessor ? 'assigned' : 'practice')
  }, [effectiveRole, isAssessor])

  useEffect(() => {
    if (!token && !guestMode) {
      navigate('/login', { replace: true })
      return
    }
    if (guestMode && !effectiveRole) {
      navigate('/select-role', { replace: true })
      return
    }
    if (user && (user.needs_onboarding || !user.role)) {
      navigate('/select-role', { replace: true })
      return
    }

    if (!token && guestMode) {
      const sampleList =
        GUEST_SAMPLE_EVALUATIONS[effectiveRole] || GUEST_SAMPLE_EVALUATIONS.student
      setEvaluations(sampleList)
      setAssessments(
        isAssessor
          ? effectiveRole === 'teacher'
            ? [
                {
                  assessment_id: 'sample_assess_med_1',
                  role_title: 'MBBS Clinical Medicine & Pharmacology Viva — Final Prof',
                  track: 'bda',
                  language: 'hinglish',
                  share_token: 'sample_viva_mbbs_demo',
                  max_attempts: 1,
                  attempts_used: 1,
                  claimed_by_email: 'ananya.s@med.college.edu',
                  share_with_taker: true,
                  status: 'active',
                  keywords_count: 28,
                },
                {
                  assessment_id: 'sample_assess_cs_2',
                  role_title: 'CS301 Python Data Structures Viva — Batch A',
                  track: 'tech',
                  language: 'hinglish',
                  share_token: 'sample_viva_cs301_demo',
                  max_attempts: 1,
                  attempts_used: 1,
                  claimed_by_email: 'aarav.k@college.edu',
                  share_with_taker: true,
                  status: 'active',
                  keywords_count: 24,
                },
              ]
            : [
                {
                  assessment_id: 'sample_assess_health_1',
                  role_title: 'Clinical Healthcare Specialist Screening',
                  track: 'bda',
                  language: 'hi-IN',
                  share_token: 'sample_health_hiring_demo',
                  max_attempts: 1,
                  attempts_used: 1,
                  claimed_by_email: 'siddharth.r@hospital.org',
                  share_with_taker: false,
                  status: 'active',
                  keywords_count: 32,
                },
                {
                  assessment_id: 'sample_assess_bda_2',
                  role_title: 'Enterprise BDA Sales Role-Play Screening',
                  track: 'bda',
                  language: 'hinglish',
                  share_token: 'sample_bda_hiring_demo',
                  max_attempts: 1,
                  attempts_used: 1,
                  claimed_by_email: 'priya.d@example.com',
                  share_with_taker: false,
                  status: 'active',
                  keywords_count: 26,
                },
              ]
          : []
      )
      setLoading(false)
      return
    }

    if (token) {
      fetchData()
    }
  }, [token, guestMode, effectiveRole, isAssessor])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [evalRes, assessRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/evaluations?scope=all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        isAssessor
          ? fetch(`${getBaseUrl()}/api/assessments`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ])

      if (evalRes && evalRes.ok) {
        setEvaluations(await evalRes.json())
      }
      if (assessRes && assessRes.ok) {
        setAssessments(await assessRes.json())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleShare = async (assessmentId, currentVal) => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google to update assessment sharing settings.')
      return
    }
    try {
      const res = await fetch(`${getBaseUrl()}/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ share_with_taker: !currentVal }),
      })
      if (res.ok) {
        setAssessments((prev) =>
          prev.map((a) =>
            a.assessment_id === assessmentId ? { ...a, share_with_taker: !currentVal } : a
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleRevoke = async (assessmentId, currentStatus) => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google to revoke or activate assessment links.')
      return
    }
    const nextStatus = currentStatus === 'active' ? 'revoked' : 'active'
    try {
      const res = await fetch(`${getBaseUrl()}/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setAssessments((prev) =>
          prev.map((a) =>
            a.assessment_id === assessmentId ? { ...a, status: nextStatus } : a
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePracticeReport = async (evalId) => {
    if (guestMode || !token) {
      triggerAuthRequired('Sign in with Google to manage practice reports.')
      return
    }
    try {
      const res = await fetch(`${getBaseUrl()}/api/evaluations/${evalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setEvaluations((prev) => prev.filter((ev) => ev._id !== evalId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const assignedCount = evaluations.filter((e) => !e.is_practice).length
  const practiceCount = evaluations.filter((e) => e.is_practice).length
  const releasedCount = evaluations.filter((e) => !e.is_practice && e.share_with_taker).length

  const sidebarItems = isAssessor
    ? [
        {
          id: 'assigned',
          label: effectiveRole === 'teacher' ? 'Class roster & vivas' : 'Candidate comparison',
          count: assignedCount,
          icon: Users,
        },
        {
          id: 'links',
          label: effectiveRole === 'teacher' ? 'Assigned viva links' : 'Screening links',
          count: assessments.length,
          icon: Link2,
        },
        {
          id: 'practice',
          label: effectiveRole === 'teacher' ? 'Faculty test runs' : 'Calibration runs',
          count: practiceCount,
          icon: Award,
        },
      ]
    : [
        {
          id: 'practice',
          label: effectiveRole === 'student' ? 'Viva practice runs' : 'Mock interviews',
          count: practiceCount,
          icon: BookOpen,
        },
        {
          id: 'released',
          label: effectiveRole === 'student' ? 'Released course grades' : 'Shared scorecards',
          count: releasedCount,
          icon: FileCheck,
        },
      ]

  const roleName = ROLE_LABELS[effectiveRole] || 'Student'

  if (!effectiveRole) {
    return null
  }

  return (
    <div className="b2b-app-shell">
      {/* Dark Charcoal Left Sidebar with Amber Active Indicator */}
      <aside className="b2b-sidebar" aria-label="Workspace navigation">
        <div style={{ padding: '20px 16px 16px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sidebar-muted)', fontWeight: 500, marginBottom: '2px' }}>
            Active workspace
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{roleName}</span>
            {guestMode && !token && (
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--sidebar-hover)',
                  color: 'var(--accent)',
                  fontWeight: 500,
                }}
              >
                Preview
              </span>
            )}
          </div>
          {user?.organization && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sidebar-muted)', marginTop: '2px' }}>
              {user.organization}
            </div>
          )}
        </div>

        <nav className="b2b-sidebar-nav" style={{ flex: 1 }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`b2b-sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span
                  className="mono-font"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: isActive ? '#FFFFFF' : 'var(--sidebar-muted)',
                  }}
                >
                  {item.count}
                </span>
              </button>
            )
          })}

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--sidebar-border)' }}>
            <button
              type="button"
              onClick={() => navigate('/setup')}
              className="b2b-sidebar-item"
              style={{ color: 'var(--accent)' }}
            >
              <Plus size={16} strokeWidth={1.5} />
              <span>
                {isAssessor
                  ? effectiveRole === 'teacher'
                    ? 'New viva assessment'
                    : 'New screening link'
                  : 'New practice session'}
              </span>
            </button>
          </div>
        </nav>

        {/* Guest Mode Role Switcher in Sidebar Footer */}
        {guestMode && !token && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sidebar-muted)', lineHeight: 1.4 }}>
              Viewing sample {roleName.toLowerCase()} records.
            </div>
            <button
              type="button"
              onClick={openGuestRoleSwitcher}
              className="btn-secondary pn-btn-sm"
              style={{
                width: '100%',
                backgroundColor: 'var(--sidebar-hover)',
                color: '#FFFFFF',
                borderColor: '#44403C',
              }}
            >
              <RefreshCw size={13} strokeWidth={1.5} />
              <span>Switch role</span>
            </button>
            <Link
              to="/login"
              className="btn-primary pn-btn-sm"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Sign in
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area on Warm Off-White Background */}
      <div className="b2b-main-content">
        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid #FECACA',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--text-sm)',
            }}
          >
            <AlertCircle size={16} strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        {/* ── 5-CARD PLATFORM BENCHMARK & DOMAIN ADVANTAGE SHOWCASE ── */}
        <PlatformBenchmarkCards />

        {loading ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={5} />
          </div>
        ) : (
          <>
            {effectiveRole === 'recruiter' && (
              <RecruiterDashboardView
                user={user}
                evaluations={evaluations}
                assessments={assessments}
                token={token}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onToggleShare={handleToggleShare}
                onToggleRevoke={handleToggleRevoke}
                onDeletePractice={handleDeletePracticeReport}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
              />
            )}

            {effectiveRole === 'teacher' && (
              <TeacherDashboardView
                user={user}
                evaluations={evaluations}
                assessments={assessments}
                token={token}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onToggleShare={handleToggleShare}
                onToggleRevoke={handleToggleRevoke}
                onDeletePractice={handleDeletePracticeReport}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
              />
            )}

            {effectiveRole === 'candidate' && (
              <CandidateDashboardView
                user={user}
                evaluations={evaluations}
                token={token}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDeletePractice={handleDeletePracticeReport}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
              />
            )}

            {(effectiveRole === 'student' ||
              !['recruiter', 'teacher', 'candidate'].includes(effectiveRole)) && (
              <StudentDashboardView
                user={user}
                evaluations={evaluations}
                token={token}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDeletePractice={handleDeletePracticeReport}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
