import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Users, Link2, Award, Calendar, FileText, Download, Copy,
  Ban, CheckCircle2, ShieldCheck, GraduationCap, Code2, Sparkles, BookOpen
} from 'lucide-react';

export default function TeacherDashboardView({
  user,
  evaluations,
  assessments,
  token,
  onToggleShare,
  onToggleRevoke,
  onDeletePractice,
  formatDate,
  getBaseUrl,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'links' | 'practice'
  const [copiedId, setCopiedId] = useState('');

  const assignedEvals = evaluations.filter((e) => !e.is_practice);
  const practiceEvals = evaluations.filter((e) => e.is_practice);
  const avgScore = assignedEvals.length
    ? (assignedEvals.reduce((acc, curr) => acc + (curr.scores?.overall_score || 0), 0) / assignedEvals.length).toFixed(1)
    : '—';

  return (
    <div>
      {/* Teacher Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎓</span>
            <h1 className="brand-font" style={{ fontSize: '2.1rem', margin: 0 }}>
              Professor / Teacher Viva Portal
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
              Academic Assessment Portal
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            {user?.organization ? `Institution: ${user.organization} • ` : ''}Conduct practical coding vivas & concept oral examinations with AI anti-cheat defense.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.92rem', padding: '0.65rem 1.25rem' }}>
          <Plus size={17} /> Create Viva Exam Link
        </button>
      </div>

      {/* Teacher KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Students Evaluated</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{assignedEvals.length}</div>
        </div>

        <div className="panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Average Viva Grade</span>
            <Award size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{avgScore}{avgScore !== '—' ? '/10' : ''}</div>
        </div>

        <div className="panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Active Class Viva Links</span>
            <Link2 size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{assessments.filter((a) => a.status === 'active').length}</div>
        </div>
      </div>

      {/* Teacher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <GraduationCap size={16} /> Student Viva Roster ({assignedEvals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={activeTab === 'links' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <Link2 size={16} /> Class Viva Links ({assessments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <BookOpen size={16} /> Teacher Practice Test ({practiceEvals.length})
        </button>
      </div>

      {/* TAB 1: Student Viva Roster */}
      {activeTab === 'assigned' && (
        assignedEvals.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <GraduationCap size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Student Vivas Completed Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
              Create a viva exam link and share it with your students. As students submit Python code and orally defend their complexity, their graded reports will appear here.
            </p>
            <button className="btn-primary" onClick={() => navigate('/setup')}>
              <Plus size={16} /> Create Viva Exam Link
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {assignedEvals.map((ev, i) => (
              <VivaReportCard key={ev._id || i} ev={ev} token={token} formatDate={formatDate} getBaseUrl={getBaseUrl} />
            ))}
          </div>
        )
      )}

      {/* TAB 2: Class Viva Links */}
      {activeTab === 'links' && (
        assessments.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Link2 size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Class Viva Links Created</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Set up a practical coding viva or theory exam with customizable expiry and one-claimer protection.
            </p>
            <button className="btn-primary" onClick={() => navigate('/setup')}>
              Create Viva Exam Link
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assessments.map((a) => {
              const fullLink = `${window.location.origin}/assess/${a.share_token}`;
              return (
                <div key={a.assessment_id} className="panel fade-in" style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{a.role_title}</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Track: <strong>{a.track?.toUpperCase()}</strong></span>
                        <span>• Viva Language: <strong>{a.language?.toUpperCase()}</strong></span>
                        <span>• Attempts: <strong>{a.attempts_used}/{a.max_attempts}</strong></span>
                        {a.claimed_by_email && <span>• Claimed By: <strong>{a.claimed_by_email}</strong></span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => onToggleShare(a.assessment_id, a.share_with_taker)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        title="Teachers default to sharing results with students to encourage learning"
                      >
                        {a.share_with_taker ? '✅ Feedback Shared with Student' : '🔒 Feedback Hidden from Student'}
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => onToggleRevoke(a.assessment_id, a.status)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: a.status === 'active' ? 'var(--error)' : 'var(--success)' }}
                      >
                        {a.status === 'active' ? <><Ban size={13} /> Close Window</> : <><CheckCircle2 size={13} /> Re-open</>}
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
                        navigator.clipboard.writeText(fullLink);
                        setCopiedId(a.assessment_id);
                        setTimeout(() => setCopiedId(''), 2000);
                      }}
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    >
                      <Copy size={14} /> {copiedId === a.assessment_id ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 3: Teacher Practice Run */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Award size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Teacher Test Sessions</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Test the viva oral defense and live Python editor yourself to see what your students will experience.
            </p>
            <button className="btn-primary" onClick={() => navigate('/setup')}>
              Start Teacher Test Session
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {practiceEvals.map((ev, i) => (
              <VivaReportCard key={ev._id || i} ev={ev} token={token} formatDate={formatDate} getBaseUrl={getBaseUrl} onDelete={onDeletePractice} isPractice />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function VivaReportCard({ ev, token, formatDate, getBaseUrl, onDelete, isPractice = false }) {
  return (
    <div className="panel fade-in" style={{ padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{ev.role_title || 'Practical Coding Viva'}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {formatDate(ev.timestamp)}</span>
            {ev.taker_name && !isPractice && <span>• Student: <strong>{ev.taker_name}</strong> {ev.taker_email ? `(${ev.taker_email})` : ''}</span>}
            {ev.language && <span>• Viva Language: <strong>{ev.language.toUpperCase()}</strong></span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {token && !String(ev._id).startsWith('sample_') && (
            <button
              onClick={() => window.open(`${getBaseUrl()}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank')}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Download size={14} /> Download Viva PDF
            </button>
          )}
          {isPractice && onDelete && (
            <button
              onClick={() => onDelete(ev._id)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--error)' }}
              title="Delete test record"
            >
              Delete
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.85rem', borderRadius: '18px', fontWeight: 600, fontSize: '0.88rem' }}>
            <Award size={16} /> Grade: {ev.scores?.overall_score}/10
          </div>
        </div>
      </div>

      {/* 5-Metric Breakdown for Teacher */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <MetricBar score={ev.scores?.technical_accuracy} label="Code Correctness & Logic" />
        <MetricBar score={ev.scores?.depth} label="Time Complexity Oral Defense" />
        <MetricBar score={ev.scores?.communication} label="Oral Concept Explanation" />
        <MetricBar score={ev.scores?.confidence} label="Viva Confidence" />
        <MetricBar score={ev.scores?.completeness} label="Problem Completeness" />
      </div>

      {/* Strengths & Improvement */}
      {ev.feedback && (
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <strong style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Demonstrated Student Strengths:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: '#eab308', fontSize: '0.85rem' }}>Viva Defense Review Notes:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Professor Feedback: </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{ev.feedback.summary}</span>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={13} color="var(--primary)" />
            <span>AI Assistive Grading Note: Final grading discretion rests with the evaluating professor.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBar({ score = 0, label }) {
  const color = score >= 8 ? 'var(--success)' : score >= 6 ? '#eab308' : 'var(--error)';
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '22px' }}>{score}</span>
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${(score / 10) * 100}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
      </div>
    </div>
  );
}

