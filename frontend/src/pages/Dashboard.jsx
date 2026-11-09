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
import { SkeletonCard } from '../components/ui/Skeleton'

const GUEST_SAMPLE_EVALUATIONS = {
  teacher: [
    {
      _id: 'sample_eval_teacher_1',
      role_title: 'CS301 Python Data Structures & Viva — Batch A',
      taker_name: 'Aarav Kulkarni',
      taker_email: 'aarav.k@college.edu',
      track: 'tech',
      language: 'hinglish',
      is_practice: false,
      timestamp: new Date().toISOString(),
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
        summary: 'Student demonstrated strong alignment between their submitted Python code and oral viva defense.',
      },
    },
    {
      _id: 'sample_eval_teacher_3',
      role_title: 'CS301 Python Data Structures & Viva — Batch A',
      taker_name: 'Rohan Deshmukh',
      taker_email: 'rohan.d@college.edu',
      track: 'tech',
      language: 'mr-IN',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
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
          'Correct iterative binary search implementation',
          'Clear explanation of pointer bounds in Marathi',
        ],
        areas_for_improvement: [
          'Missed integer overflow consideration on mid calculation',
        ],
        summary: 'Solid foundational grasp of searching algorithms and loop invariants.',
      },
    },
    {
      _id: 'sample_eval_teacher_2',
      role_title: 'Python & Data Structures Faculty Calibration Run',
      taker_name: 'Faculty Calibration',
      track: 'tech',
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
        strengths: ['Verified edge cases and recursion depth limits'],
        areas_for_improvement: ['None noted — benchmark calibration run'],
        summary: 'Faculty verification run of the live code editor and oral defense rubric.',
      },
    },
  ],
  recruiter: [
    {
      _id: 'sample_eval_recruiter_1',
      role_title: 'Enterprise BDA & SaaS Sales Screening',
      taker_name: 'Priya Deshmukh',
      taker_email: 'priya.d@example.com',
      track: 'bda',
      language: 'hinglish',
      is_practice: false,
      timestamp: new Date().toISOString(),
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
      _id: 'sample_eval_recruiter_3',
      role_title: 'Backend Software Engineer (SDE-1) Screening',
      taker_name: 'Vikram Nair',
      taker_email: 'vikram.n@example.com',
      track: 'tech',
      language: 'en-IN',
      is_practice: false,
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      scores: {
        technical_accuracy: 6,
        communication: 7,
        confidence: 7,
        depth: 6,
        completeness: 6,
        overall_score: 6.4,
      },
      feedback: {
        strengths: [
          'Clear verbal walkthrough of REST API pagination',
        ],
        areas_for_improvement: [
          'Sub-optimal O(n²) nested loop in code editor submission',
          'Needs stronger familiarity with database indexing',
        ],
        summary: 'Communicates clearly but requires deeper algorithmic optimization for SDE-1.',
      },
    },
    {
      _id: 'sample_eval_recruiter_2',
      role_title: 'BDA Voice Screening Calibration Run',
      taker_name: 'Recruiter Calibration',
      track: 'bda',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 9,
        confidence: 9,
        depth: 9,
        completeness: 9,
        overall_score: 9.0,
      },
      feedback: {
        strengths: ['Smooth conversational pacing and structured discovery'],
        areas_for_improvement: ['Pace closing questions slightly more evenly'],
        summary: 'Recruiter calibration session validated objection triggers.',
      },
    },
  ],
  student: [
    {
      _id: 'sample_eval_student_1',
      role_title: 'Python & Algorithms Lab Practice Viva',
      taker_name: 'Student Practice',
      track: 'tech',
      language: 'hinglish',
      is_practice: true,
      timestamp: new Date().toISOString(),
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
    {
      _id: 'sample_eval_student_2',
      role_title: 'CS301 Mid-Semester Oral Viva (Released by Professor)',
      taker_name: 'Student Preview',
      track: 'tech',
      language: 'hinglish',
      is_practice: false,
      share_with_taker: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 8,
        depth: 9,
        completeness: 9,
        overall_score: 8.6,
      },
      feedback: {
        strengths: ['Thorough explanation of AVL tree rotations and balance factors'],
        areas_for_improvement: ['Review amortized analysis of dynamic arrays'],
        summary: 'Strong performance on mid-semester viva.',
      },
    },
  ],
  candidate: [
    {
      _id: 'sample_eval_cand_1',
      role_title: 'BDA Sales Pitch & Price Objection Practice',
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
          'Consultative opening with relevant customer pain points',
          'Clear Hinglish transitions and price objection defense',
        ],
        areas_for_improvement: [
          'Address enterprise SLA and compliance terms earlier in the conversation',
        ],
        summary: 'Strong BDA mock interview performance.',
      },
    },
    {
      _id: 'sample_eval_cand_2',
      role_title: 'Fintech SDE-1 Technical Screening (Shared by HR)',
      taker_name: 'Candidate Preview',
      track: 'tech',
      language: 'en-IN',
      is_practice: false,
      share_with_taker: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 9,
        depth: 9,
        completeness: 8,
        overall_score: 8.6,
      },
      feedback: {
        strengths: ['Clean LRU Cache implementation with O(1) operations', 'Clear time-space breakdown'],
        areas_for_improvement: ['Discuss lock contention in multi-threaded environments'],
        summary: 'Recruiter shared your technical screening scorecard.',
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
          ? [
              {
                assessment_id: 'sample_assess_1',
                role_title:
                  effectiveRole === 'teacher'
                    ? 'CS301 Python Data Structures Viva — Batch A'
                    : 'Enterprise BDA Sales Role-Play Screening',
                track: effectiveRole === 'teacher' ? 'tech' : 'bda',
                language: 'hinglish',
                share_token:
                  effectiveRole === 'teacher'
                    ? 'sample_viva_cs301_demo'
                    : 'sample_bda_hiring_demo',
                max_attempts: 1,
                attempts_used: 1,
                claimed_by_email:
                  effectiveRole === 'teacher'
                    ? 'aarav.k@college.edu'
                    : 'priya.d@example.com',
                share_with_taker: effectiveRole === 'teacher',
                status: 'active',
                keywords_count: 24,
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
