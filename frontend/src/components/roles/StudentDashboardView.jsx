import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Award, Calendar, Download, Trash2, Link2, ArrowRight,
  BookOpen, Sparkles, CheckCircle2, ShieldCheck
} from 'lucide-react';
import LatencyTelemetryMatrix from '../LatencyTelemetryMatrix';

export default function StudentDashboardView({
  user,
  evaluations,
  token,
  onDeletePractice,
  formatDate,
  getBaseUrl,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'assigned'
  const [assignedLinkInput, setAssignedLinkInput] = useState('');

  const practiceEvals = evaluations.filter((e) => e.is_practice);
  const releasedEvals = evaluations.filter((e) => !e.is_practice && e.share_with_taker);

  const handleJoinViva = (e) => {
    e.preventDefault();
    const raw = assignedLinkInput.trim();
    if (!raw) return;
    const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/);
    navigate(`/assess/${match ? match[1] : raw}`);
  };

  return (
    <div>
      {/* Student Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧑‍🎓</span>
            <h1 className="brand-font" style={{ fontSize: '2.1rem', margin: 0 }}>
              Student Viva Portal
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              College Lab Workspace
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            {user?.organization ? `College: ${user.organization} • ` : ''}Practice writing Python code and defending your complexity aloud before lab exams.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.92rem', padding: '0.65rem 1.25rem' }}>
          <Code2 size={17} /> Practice Viva Exam
        </button>
      </div>

      {/* Quick Box: Enter Teacher's Viva Link */}
      <div
        className="panel animate-in"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
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
          <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <Link2 size={16} color="var(--primary)" /> Have a Class Viva Link from your Professor?
          </strong>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Paste the link or token given by your instructor to begin your oral defense exam.
          </span>
        </div>
        <form onSubmit={handleJoinViva} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
          <input
            type="text"
            value={assignedLinkInput}
            onChange={(e) => setAssignedLinkInput(e.target.value)}
            placeholder="Paste /assess/... link or token"
            style={{ flex: 1, padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            Enter Viva <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* Student Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <BookOpen size={16} /> My Practice Vivas ({practiceEvals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <Award size={16} /> Released Professor Grades ({releasedEvals.length})
        </button>
      </div>

      {/* TAB 1: My Practice Vivas */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Code2 size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Practice Vivas Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Practice solving Python coding challenges and defending your algorithm aloud in Hinglish or English to get instant 6-axis AI feedback.
            </p>
            <button className="btn-primary" onClick={() => navigate('/setup')}>
              Start Python Viva Practice
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {practiceEvals.map((ev, i) => (
              <StudentCard key={ev._id || i} ev={ev} token={token} formatDate={formatDate} getBaseUrl={getBaseUrl} onDelete={onDeletePractice} isPractice isSuperAdmin={Boolean(user?.is_super_admin)} />
            ))}
          </div>
        )
      )}

      {/* TAB 2: Released Professor Grades */}
      {activeTab === 'assigned' && (
        releasedEvals.length === 0 ? (
          <div className="panel animate-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Award size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Released Grades Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              When your professor reviews and releases your viva report, your grade and feedback breakdown will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {releasedEvals.map((ev, i) => (
              <StudentCard key={ev._id || i} ev={ev} token={token} formatDate={formatDate} getBaseUrl={getBaseUrl} isSuperAdmin={Boolean(user?.is_super_admin)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function StudentCard({ ev, token, formatDate, getBaseUrl, onDelete, isPractice = false, isSuperAdmin = false }) {
  return (
    <div className="panel fade-in" style={{ padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{ev.role_title || 'Practical Coding Viva'}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {formatDate(ev.timestamp)}</span>
            {ev.assessor_username && <span>• Evaluated by: <strong>Prof. {ev.assessor_username}</strong></span>}
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
              <Download size={14} /> Download PDF
            </button>
          )}
          {isPractice && onDelete && (
            <button
              onClick={() => onDelete(ev._id)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--error)' }}
              title="Delete my practice data"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.4rem 0.85rem', borderRadius: '18px', fontWeight: 600, fontSize: '0.88rem' }}>
            <Award size={16} /> Viva Grade: {ev.scores?.overall_score}/10
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <MetricBar score={ev.scores?.technical_accuracy} label="Code Correctness" />
        <MetricBar score={ev.scores?.depth} label="Oral Complexity Defense" />
        <MetricBar score={ev.scores?.communication} label="Speech & Explanation" />
        <MetricBar score={ev.scores?.confidence} label="Confidence" />
        <MetricBar score={ev.scores?.completeness} label="Problem Completion" />
      </div>

      {ev.feedback && (
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <strong style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Your Strengths:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: '#eab308', fontSize: '0.85rem' }}>What to Improve Before Exam:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Viva Feedback: </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{ev.feedback.summary}</span>
          </div>
        </div>
      )}

      {/* Super Admin Real-Time Latency Telemetry Matrix */}
      <LatencyTelemetryMatrix telemetry={ev.telemetry} isSuperAdmin={isSuperAdmin} />
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

