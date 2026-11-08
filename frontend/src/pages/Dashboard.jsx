import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  Plus, Award, Calendar, BarChart3, AlertCircle, FileText, Download,
  Link2, Copy, Trash2, ShieldCheck, Eye, Users, RefreshCw, Ban, CheckCircle2
} from 'lucide-react'

const GUEST_SAMPLE_EVALUATIONS = {
  teacher: [
    {
      _id: 'sample_eval_1',
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
  ],
  recruiter: [
    {
      _id: 'sample_eval_2',
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
  ],
  student: [
    {
      _id: 'sample_eval_3',
      role_title: 'Python & Algorithms Practice Viva',
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
        strengths: ['Good grasp of recursion and base cases'],
        areas_for_improvement: ['Explain space complexity call-stack overhead more clearly'],
        summary: 'Solid self-practice viva session.',
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

  const [activeTab, setActiveTab] = useState(isAssessor ? 'assigned' : 'practice')
  const [evaluations, setEvaluations] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [assessLinkInput, setAssessLinkInput] = useState('')

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '')

  useEffect(() => {
    setActiveTab(isAssessor ? 'assigned' : 'practice')
  }, [isAssessor])

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
                share_token: 'sample_demo_token_preview',
                max_attempts: 1,
                attempts_used: 1,
                claimed_by_email: 'aarav.k@college.edu',
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
  }, [token, guestMode, effectiveRole, activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const scopeParam = activeTab === 'links' ? 'assigned' : activeTab
      const [evalRes, assessRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/evaluations?scope=${scopeParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        isAssessor
          ? fetch(`${getBaseUrl()}/api/assessments`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ])

      if (evalRes.ok) {
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
    <div style={{ maxWidth: '1040px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Guest Explorer Banner */}
      {guestMode && !token && (
        <div
          className="animate-in"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
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
                Guest Mode Preview — Viewing as{' '}
                <span style={{ textTransform: 'capitalize' }}>{effectiveRole || 'Explorer'}</span>
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                You are exploring sample data for this role. To create live links or run voice interviews, please sign in with Google.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={openGuestRoleSwitcher} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <RefreshCw size={14} /> Change Preview Role
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '2.25rem', marginBottom: '0.3rem' }}>
            {user?.full_name || user?.username
              ? `Welcome, ${user.full_name || user.username}`
              : `IntervAI ${effectiveRole ? effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1) : ''} Workspace`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {isAssessor
              ? effectiveRole === 'teacher'
                ? 'Manage college viva links, review student oral & code defenses, or run a practice test.'
                : 'Manage candidate screening links, review 6-axis scorecards, or test the voice agent.'
              : 'Review your practice history, view shared assessment results, or enter an assigned link.'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.95rem' }}>
          <Plus size={18} />
          {isAssessor
            ? effectiveRole === 'teacher'
              ? 'Create Viva / Practice'
              : 'Create Screening / Practice'
            : 'Start Practice Interview'}
        </button>
      </div>

      {/* For Students/Candidates: Quick Assigned Link Bar */}
      {!isAssessor && (
        <div
          className="panel animate-in"
          style={{
            padding: '1.1rem 1.4rem',
            marginBottom: '2rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link2 size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Have an Assigned Link from your {effectiveRole === 'student' ? 'Teacher' : 'Recruiter'}?
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const raw = assessLinkInput.trim()
              if (!raw) return
              const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/)
              navigate(`/assess/${match ? match[1] : raw}`)
            }}
            style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}
          >
            <input
              type="text"
              value={assessLinkInput}
              onChange={(e) => setAssessLinkInput(e.target.value)}
              placeholder="Paste /assess/... link or token"
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Join Exam
            </button>
          </form>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        {isAssessor ? (
          <>
            <button
              onClick={() => setActiveTab('assigned')}
              className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              <Users size={16} /> {effectiveRole === 'teacher' ? 'Student Viva Reports' : 'Candidate Screening Reports'}
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={activeTab === 'links' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              <Link2 size={16} /> My Shareable Links ({assessments.length})
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              <Award size={16} /> My Self-Practice History
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('practice')}
              className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              <Award size={16} /> My Practice Reports
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
            >
              <Users size={16} /> Shared Assessment Results
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* TAB: My Created Shareable Links (Assessor Only) */}
      {isAssessor && activeTab === 'links' ? (
        assessments.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Link2 size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Assessment Links Created Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Create an assessment to generate an unguessable one-claimer link for your {effectiveRole === 'teacher' ? 'students' : 'candidates'}.
            </p>
            <button className="btn-primary" onClick={() => navigate('/setup')}>
              Create Assessment Link
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assessments.map((a) => {
              const fullLink = `${window.location.origin}/assess/${a.share_token}`
              return (
                <div key={a.assessment_id} className="panel fade-in" style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{a.role_title}</h3>
                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Track: <strong>{a.track?.toUpperCase()}</strong></span>
                        <span>• Language: <strong>{a.language?.toUpperCase()}</strong></span>
                        <span>• Attempts Used: <strong>{a.attempts_used}/{a.max_attempts}</strong></span>
                        {a.claimed_by_email && <span>• Claimed by: <strong>{a.claimed_by_email}</strong></span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleToggleShare(a.assessment_id, a.share_with_taker)}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {a.share_with_taker ? '✅ Shared with Taker' : '🔒 Hidden from Taker'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleToggleRevoke(a.assessment_id, a.status)}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: a.status === 'active' ? 'var(--error)' : 'var(--success)' }}
                      >
                        {a.status === 'active' ? <><Ban size={14} /> Revoke Link</> : <><CheckCircle2 size={14} /> Reactivate</>}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={fullLink}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.82rem', background: 'var(--bg-main)' }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(fullLink)
                        setCopiedId(a.assessment_id)
                        setTimeout(() => setCopiedId(''), 2000)
                      }}
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      <Copy size={14} /> {copiedId === a.assessment_id ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BarChart3 className="spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading reports...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="panel animate-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Award size={60} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>No Reports Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {activeTab === 'assigned'
              ? isAssessor
                ? `Completed ${effectiveRole === 'teacher' ? 'student viva' : 'candidate screening'} reports will appear here automatically.`
                : 'Assessments where your Teacher or Recruiter shared the report with you will appear here.'
              : 'Start a self-practice voice session to see your 6-axis AI scorecard.'}
          </p>
          <button className="btn-primary" onClick={() => navigate('/setup')}>
            {isAssessor ? 'Configure Assessment / Practice' : 'Start Practice Session'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
          {evaluations.map((ev, i) => (
            <div key={ev._id || i} className="panel fade-in" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>
                    {ev.role_title || (ev.track === 'bda' ? 'BDA Sales Assessment' : 'Technical Viva Assessment')}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.84rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={15} /> {formatDate(ev.timestamp)}
                    </span>
                    {ev.taker_name && !ev.is_practice && (
                      <span>
                        • Participant: <strong>{ev.taker_name}</strong> {ev.taker_email ? `(${ev.taker_email})` : ''}
                      </span>
                    )}
                    {ev.language && <span>• Language: <strong>{ev.language.toUpperCase()}</strong></span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ev.jd_id && token && (
                    <button
                      onClick={() => window.open(`${getBaseUrl()}/api/jd/${ev.jd_id}?token=${token}`, '_blank')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      <FileText size={15} /> View JD
                    </button>
                  )}
                  {token && !String(ev._id).startsWith('sample_') && (
                    <button
                      onClick={() => window.open(`${getBaseUrl()}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      <Download size={15} /> Download PDF
                    </button>
                  )}
                  {ev.is_practice && token && !String(ev._id).startsWith('sample_') && (
                    <button
                      onClick={() => handleDeletePracticeReport(ev._id)}
                      className="btn-secondary"
                      title="Delete my practice data"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem', color: 'var(--error)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.45rem 0.9rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Award size={17} />
                    Score: {ev.scores?.overall_score}/10
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
                <Metric score={ev.scores?.technical_accuracy} label="Domain / Tech Accuracy" />
                <Metric score={ev.scores?.communication} label="Communication" />
                <Metric score={ev.scores?.confidence} label="Confidence" />
                <Metric score={ev.scores?.depth} label="Depth & Defense" />
                <Metric score={ev.scores?.completeness} label="Completeness" />
              </div>

              {ev.feedback && (
                <div style={{ marginTop: '1.25rem', padding: '1.2rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div>
                      <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '0.88rem' }}>Strengths</h4>
                      <ul style={{ color: 'var(--text-muted)', fontSize: '0.86rem', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.55 }}>
                        {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ color: '#eab308', marginBottom: '0.5rem', fontSize: '0.88rem' }}>Areas for Review / Improvement</h4>
                      <ul style={{ color: 'var(--text-muted)', fontSize: '0.86rem', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.55 }}>
                        {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem', fontSize: '0.88rem' }}>Executive Summary</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
                      {ev.feedback.summary}
                    </p>
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={13} color="var(--primary)" />
                    <span>AI-assisted evaluation indicator — final assessment decision rests with the human reviewer.</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ score = 0, label }) {
  const getColor = (s) => {
    if (s >= 8) return 'var(--success)'
    if (s >= 6) return '#eab308'
    return 'var(--error)'
  }

  const color = getColor(score)

  return (
    <div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', width: '26px' }}>{score}</div>
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(score / 10) * 100}%`, background: color, borderRadius: '3px' }}></div>
        </div>
      </div>
    </div>
  )
}
