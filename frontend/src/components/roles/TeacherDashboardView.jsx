import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Users, Link2, Award, Calendar, Download, Copy,
  Ban, CheckCircle2, ShieldCheck, GraduationCap, BookOpen, Eye, X
} from 'lucide-react';
import LatencyTelemetryMatrix from '../LatencyTelemetryMatrix';
import ScoreRadar, { ScoreDonut, Sparkline } from '../ui/ScoreRadar';
import EmptyState from '../ui/EmptyState';
import CountUp from '../ui/CountUp';

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
  const [activeTab, setActiveTab] = useState('assigned');
  const [copiedId, setCopiedId] = useState('');
  const [selectedEval, setSelectedEval] = useState(null);

  const assignedEvals = evaluations.filter((e) => !e.is_practice);
  const practiceEvals = evaluations.filter((e) => e.is_practice);
  const avgScoreNum = assignedEvals.length
    ? assignedEvals.reduce((acc, curr) => acc + (curr.scores?.overall_score || 0), 0) / assignedEvals.length
    : 0;
  const activeLinksCount = assessments.filter((a) => a.status === 'active').length;

  return (
    <div>
      {/* Teacher Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex' }}>
              <GraduationCap size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>
              Professor Viva Portal
            </h1>
            <span className="pn-badge pn-badge-primary">
              Academic Assessment
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {user?.organization ? `Institution: ${user.organization} • ` : ''}Conduct practical coding vivas &amp; concept oral examinations with anti-cheat defense.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}>
          <Plus size={16} /> Create Viva Exam Link
        </button>
      </div>

      {/* Teacher KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Students Evaluated
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <CountUp value={assignedEvals.length} />
            </div>
          </div>
          <Sparkline values={[3, 5, 8, 7, 11, Math.max(2, assignedEvals.length)]} color="var(--primary)" />
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Average Viva Grade
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              {assignedEvals.length ? <><CountUp value={avgScoreNum} decimals={1} />/10</> : '—'}
            </div>
          </div>
          <Sparkline values={[7.0, 7.5, 8.0, 8.2, avgScoreNum || 8.4]} color="var(--primary)" />
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Active Class Viva Links
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <CountUp value={activeLinksCount} />
            </div>
          </div>
          <Sparkline values={[1, 2, 2, 3, Math.max(1, activeLinksCount)]} color="var(--secondary)" />
        </div>
      </div>

      {/* Teacher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <GraduationCap size={15} /> Student Viva Roster ({assignedEvals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={activeTab === 'links' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Link2 size={15} /> Class Viva Links ({assessments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <BookOpen size={15} /> Teacher Practice Test ({practiceEvals.length})
        </button>
      </div>

      {/* TAB 1: Student Viva Roster */}
      {activeTab === 'assigned' && (
        assignedEvals.length === 0 ? (
          <EmptyState
            variant="candidates"
            title="No Student Vivas Completed Yet"
            description="Create a viva exam link and share it with your students. As students submit code and orally defend their complexity, their graded reports will appear here."
            actionLabel="Create Viva Exam Link"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {assignedEvals.map((ev, i) => (
              <VivaReportCard
                key={ev._id || i}
                ev={ev}
                token={token}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
                onInspect={() => setSelectedEval(ev)}
                isSuperAdmin={Boolean(user?.is_super_admin)}
              />
            ))}
          </div>
        )
      )}

      {/* TAB 2: Class Viva Links */}
      {activeTab === 'links' && (
        assessments.length === 0 ? (
          <EmptyState
            variant="assessments"
            title="No Class Viva Links Created"
            description="Set up a practical coding viva or theory exam with customizable expiry and one-claimer protection."
            actionLabel="Create Viva Exam Link"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assessments.map((a) => {
              const fullLink = `${window.location.origin}/assess/${a.share_token}`;
              return (
                <div key={a.assessment_id} className="pn-card fade-in" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
                    <div>
                      <h3 className="brand-font" style={{ fontSize: '1.08rem', marginBottom: '0.25rem', fontWeight: 700 }}>{a.role_title}</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Track: <strong style={{ color: 'var(--primary)' }}>{a.track?.toUpperCase()}</strong></span>
                        <span>• Viva Language: <strong>{a.language?.toUpperCase()}</strong></span>
                        <span>• Attempts: <strong>{a.attempts_used}/{a.max_attempts}</strong></span>
                        {a.claimed_by_email && <span>• Claimed By: <strong style={{ color: 'var(--secondary)' }}>{a.claimed_by_email}</strong></span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="pn-btn pn-btn-outline"
                        onClick={() => onToggleShare(a.assessment_id, a.share_with_taker)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                      >
                        {a.share_with_taker ? '✅ Feedback Shared with Student' : '🔒 Feedback Hidden from Student'}
                      </button>

                      <button
                        className="pn-btn pn-btn-outline"
                        onClick={() => onToggleRevoke(a.assessment_id, a.status)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: a.status === 'active' ? 'var(--error)' : 'var(--success)' }}
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
                      className="mono-font"
                      style={{ flex: 1, padding: '0.55rem 0.8rem', fontSize: '0.82rem', background: 'var(--bg-main)' }}
                    />
                    <button
                      className="pn-btn pn-btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(fullLink);
                        setCopiedId(a.assessment_id);
                        setTimeout(() => setCopiedId(''), 2000);
                      }}
                      style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
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
          <EmptyState
            variant="assessments"
            title="No Teacher Test Sessions"
            description="Test the viva oral defense and live code editor yourself to see what your students will experience."
            actionLabel="Start Teacher Test Session"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {practiceEvals.map((ev, i) => (
              <VivaReportCard
                key={ev._id || i}
                ev={ev}
                token={token}
                formatDate={formatDate}
                getBaseUrl={getBaseUrl}
                onDelete={onDeletePractice}
                onInspect={() => setSelectedEval(ev)}
                isPractice
                isSuperAdmin={Boolean(user?.is_super_admin)}
              />
            ))}
          </div>
        )
      )}

      {/* Student Viva Radar Modal */}
      {selectedEval && (
        <div
          onClick={() => setSelectedEval(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 18, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pn-card pn-card-elevated"
            style={{ width: '100%', maxWidth: '680px', padding: '2rem', borderRadius: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button
              onClick={() => setSelectedEval(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 className="brand-font" style={{ fontSize: '1.45rem', marginBottom: '0.25rem' }}>{selectedEval.role_title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Student: <strong>{selectedEval.taker_name || 'Student'}</strong> • {formatDate(selectedEval.timestamp)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <ScoreRadar scores={selectedEval.scores} size={220} />
              <div style={{ textAlign: 'center' }}>
                <ScoreDonut score={selectedEval.scores?.overall_score || 0} size={110} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>Viva Composite Grade</div>
              </div>
            </div>
            {selectedEval.feedback && (
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--primary)' }}>Professor Feedback: </strong>
                {selectedEval.feedback.summary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VivaReportCard({ ev, token, formatDate, getBaseUrl, onDelete, onInspect, isPractice = false, isSuperAdmin = false }) {
  return (
    <div className="pn-card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.9rem' }}>
        <div>
          <h3 className="brand-font" style={{ fontSize: '1.15rem', marginBottom: '0.25rem', fontWeight: 700 }}>{ev.role_title || 'Practical Coding Viva'}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {formatDate(ev.timestamp)}</span>
            {ev.taker_name && !isPractice && <span>• Student: <strong style={{ color: 'var(--text-main)' }}>{ev.taker_name}</strong> {ev.taker_email ? `(${ev.taker_email})` : ''}</span>}
            {ev.language && <span>• Viva Language: <strong style={{ color: 'var(--secondary)' }}>{ev.language.toUpperCase()}</strong></span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onInspect && (
            <button onClick={onInspect} className="pn-btn pn-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
              <Eye size={14} /> Radar View
            </button>
          )}
          {token && !String(ev._id).startsWith('sample_') && (
            <button
              onClick={() => window.open(`${getBaseUrl()}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank')}
              className="pn-btn pn-btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
            >
              <Download size={14} /> Download Viva PDF
            </button>
          )}
          {isPractice && onDelete && (
            <button
              onClick={() => onDelete(ev._id)}
              className="pn-btn pn-btn-outline"
              style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem', color: 'var(--error)' }}
            >
              Delete
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(124, 92, 255, 0.14)', color: 'var(--primary)', border: '1px solid rgba(124, 92, 255, 0.3)', padding: '0.4rem 0.9rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.86rem' }}>
            <Award size={15} /> Grade: {ev.scores?.overall_score}/10
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.1rem' }}>
        <MetricBar score={ev.scores?.technical_accuracy} label="Code Correctness & Logic" />
        <MetricBar score={ev.scores?.depth} label="Time Complexity Oral Defense" />
        <MetricBar score={ev.scores?.communication} label="Oral Concept Explanation" />
        <MetricBar score={ev.scores?.confidence} label="Viva Confidence" />
        <MetricBar score={ev.scores?.completeness} label="Problem Completeness" />
      </div>

      {ev.feedback && (
        <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <strong style={{ color: 'var(--success)', fontSize: '0.84rem' }}>Demonstrated Student Strengths:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: 'var(--pn-saffron)', fontSize: '0.84rem' }}>Viva Defense Review Notes:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.84rem' }}>Professor Feedback: </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{ev.feedback.summary}</span>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={13} color="var(--secondary)" />
            <span>AI Assistive Grading Note: Final grading discretion rests with the evaluating professor.</span>
          </div>
        </div>
      )}

      <LatencyTelemetryMatrix telemetry={ev.telemetry} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}

function MetricBar({ score = 0, label }) {
  const color = score >= 8 ? 'var(--success)' : score >= 6 ? 'var(--pn-saffron)' : 'var(--error)';
  return (
    <div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 700, minWidth: '22px' }}>{score}</span>
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${(score / 10) * 100}%`, height: '100%', background: color, borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}
