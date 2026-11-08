import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { BarChart3, AlertCircle, Eye, RefreshCw } from 'lucide-react'
import RecruiterDashboardView from '../components/roles/RecruiterDashboardView'
import TeacherDashboardView from '../components/roles/TeacherDashboardView'
import StudentDashboardView from '../components/roles/StudentDashboardView'
import CandidateDashboardView from '../components/roles/CandidateDashboardView'

const GUEST_SAMPLE_EVALUATIONS = {
  teacher: [
    {
      _id: 'sample_eval_teacher_1',
      role_title: 'CS301 Python Data Structures & Viva — Batch A',
      taker_name: 'Aarav Kulkarni (Sample Student)',
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
        overall_score: 8,
      },
      feedback: {
        strengths: [
          'Submitted clean O(n) hash-map solution in the live Python editor',
          'Orally explained time and space complexity accurately in Hinglish',
        ],
        areas_for_improvement: [
          'Could discuss edge-case handling for empty arrays earlier',
        ],
        summary: 'Student demonstrated strong alignment between their submitted Python code and oral viva defense.',
      },
    },
    {
      _id: 'sample_eval_teacher_2',
      role_title: 'Python & Data Structures Faculty Practice Run',
      taker_name: 'Professor Preview Run',
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
        overall_score: 9,
      },
      feedback: {
        strengths: ['Rigorous verification of edge cases and recursion depth'],
        areas_for_improvement: ['None noted — benchmark caliber response'],
        summary: 'Exemplary faculty test run of the live code editor and oral defense rubric.',
      },
    },
  ],
  recruiter: [
    {
      _id: 'sample_eval_recruiter_1',
      role_title: 'Enterprise BDA & SaaS Sales Screening',
      taker_name: 'Priya Deshmukh (Sample Candidate)',
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
        overall_score: 8,
      },
      feedback: {
        strengths: [
          'Handled the quarterly budget-freeze objection empathetically with ROI breakdown',
          'Natural Hinglish rapport and clear pilot call-to-action',
        ],
        areas_for_improvement: [
          'Quantify customer acquisition metrics earlier in the pitch',
        ],
        summary: 'High-conviction BDA pitch with strong objection handling under pressure.',
      },
    },
    {
      _id: 'sample_eval_recruiter_2',
      role_title: 'BDA Voice Screening AI Calibration Run',
      taker_name: 'Recruiter Self-Test',
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
        overall_score: 9,
      },
      feedback: {
        strengths: ['Smooth conversational pacing and structured value discovery'],
        areas_for_improvement: ['Pace closing questions slightly more evenly'],
        summary: 'Recruiter calibration session successfully validated AI objection triggers.',
      },
    },
  ],
  student: [
    {
      _id: 'sample_eval_student_1',
      role_title: 'Python & Algorithms Lab Practice Viva',
      taker_name: 'Guest Student Preview',
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
        overall_score: 8,
      },
      feedback: {
        strengths: ['Good grasp of recursion base cases and live code syntax'],
        areas_for_improvement: ['Explain space complexity call-stack overhead more clearly'],
        summary: 'Solid self-practice viva session. Ready for lab exam.',
      },
    },
    {
      _id: 'sample_eval_student_2',
      role_title: 'CS301 Midterm Lab Viva (Released by Prof. Sharma)',
      taker_name: 'Guest Student Preview',
      track: 'tech',
      language: 'hinglish',
      is_practice: false,
      share_with_taker: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      scores: {
        technical_accuracy: 9,
        communication: 8,
        confidence: 8,
        depth: 8,
        completeness: 9,
        overall_score: 8,
      },
      feedback: {
        strengths: ['Successfully resolved binary tree depth challenge in 4 minutes', 'Clear oral defense'],
        areas_for_improvement: ['Review AVL rotations edge conditions'],
        summary: 'Professor released your official midterm viva scorecard.',
      },
    },
  ],
  candidate: [
    {
      _id: 'sample_eval_cand_1',
      role_title: 'Enterprise BDA Sales Pitch Self-Prep',
      taker_name: 'Guest Candidate Preview',
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
        overall_score: 8,
      },
      feedback: {
        strengths: [
          'Strong consultative opening with relevant customer pain points',
          'Confident Hinglish transitions and smooth price objection defense',
        ],
        areas_for_improvement: [
          'Address enterprise SLA and compliance terms earlier in the conversation',
        ],
        summary: 'Competitive BDA mock interview performance with strong business empathy.',
      },
    },
    {
      _id: 'sample_eval_cand_2',
      role_title: 'Fintech SDE-1 Technical Screening (Shared by HR Team)',
      taker_name: 'Guest Candidate Preview',
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
        overall_score: 9,
      },
      feedback: {
        strengths: ['Clean LRU Cache implementation with O(1) get and put', 'Articulate time-space breakdown'],
        areas_for_improvement: ['Discuss lock contention in multi-threaded environments'],
        summary: 'Recruiter shared your technical screening scorecard. Passed to Round 2.',
      },
    },
  ],
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

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  useEffect(() => {
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
      triggerAuthRequired('Sign in with Google to manage live assessment sharing settings.')
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
      triggerAuthRequired('Sign in with Google to manage your practice reports.')
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Guest Explorer Banner */}
      {guestMode && !token && (
        <div
          className="animate-in"
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '0.9rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Eye size={20} color="#d97706" />
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#b45309' }}>
                Guest Explorer Preview — Viewing as{' '}
                <span style={{ textTransform: 'capitalize' }}>{effectiveRole || 'Explorer'}</span>
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                You are previewing role-tailored sample data. To create real links or run live voice sessions, please sign in.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={openGuestRoleSwitcher}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }}
            >
              <RefreshCw size={13} /> Switch Preview Role
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '10px' }}
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BarChart3 className="spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading {effectiveRole} workspace...</p>
        </div>
      ) : (
        /* ── Role-Specific Independent Dashboards (Zero Concatenation) ── */
        <>
          {effectiveRole === 'recruiter' && (
            <RecruiterDashboardView
              user={user}
              evaluations={evaluations}
              assessments={assessments}
              token={token}
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
              onDeletePractice={handleDeletePracticeReport}
              formatDate={formatDate}
              getBaseUrl={getBaseUrl}
            />
          )}

          {(effectiveRole === 'student' || (!['recruiter', 'teacher', 'candidate'].includes(effectiveRole))) && (
            <StudentDashboardView
              user={user}
              evaluations={evaluations}
              token={token}
              onDeletePractice={handleDeletePracticeReport}
              formatDate={formatDate}
              getBaseUrl={getBaseUrl}
            />
          )}
        </>
      )}
    </div>
  )
}
