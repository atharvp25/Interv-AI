import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Award, Calendar, Download, Trash2, Link2, ArrowRight,
  BookOpen, Flame
} from 'lucide-react';
import LatencyTelemetryMatrix from '../LatencyTelemetryMatrix';
import ScoreRadar from '../ui/ScoreRadar';
import EmptyState from '../ui/EmptyState';

export default function StudentDashboardView({
  user,
  evaluations,
  token,
  onDeletePractice,
  formatDate,
  getBaseUrl,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('practice');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex' }}>
              <Code2 size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>
              Student Viva Portal
            </h1>
            <span className="pn-badge pn-badge-primary">
              College Lab Workspace
            </span>
            <span className="pn-badge pn-badge-secondary">
              Practice Runs: {practiceEvals.length}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {user?.organization ? `College: ${user.organization} • ` : ''}Practice writing code and defending your complexity aloud before lab exams.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}>
          <Code2 size={16} /> Practice Viva Exam
        </button>
      </div>

      {/* Quick Box: Enter Teacher's Viva Link */}
      <div
        className="panel"
        style={{
          padding: '1.2rem 1.4rem',
          marginBottom: '1.75rem',
          borderRadius: '8px',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <strong style={{ fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)' }}>
            <Link2 size={15} color="var(--primary)" /> Have a Class Viva Link from your Professor?
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Paste the link or token given by your instructor to begin your oral defense exam.
          </span>
        </div>
        <form onSubmit={handleJoinViva} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}>
          <input
            type="text"
            value={assignedLinkInput}
            onChange={(e) => setAssignedLinkInput(e.target.value)}
            placeholder="Paste /assess/... link or token"
            style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.84rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
            Enter Viva <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Student Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <BookOpen size={15} /> My Practice Vivas ({practiceEvals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Award size={15} /> Released Professor Grades ({releasedEvals.length})
        </button>
      </div>

      {/* TAB 1: My Practice Vivas */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <EmptyState
            variant="assessments"
            title="No Practice Vivas Yet"
            description="Practice solving coding challenges and defending your algorithm aloud in Hinglish or English to get instant 6-axis AI feedback."
            actionLabel="Start Python Viva Practice"
            onAction={() => navigate('/setup')}
          />
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
          <EmptyState
            variant="candidates"
            title="No Released Grades Yet"
            description="When your professor reviews and releases your viva report, your grade and feedback breakdown will appear here."
          />
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
    <div className="pn-card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.9rem' }}>
        <div>
          <h3 className="brand-font" style={{ fontSize: '1.15rem', marginBottom: '0.25rem', fontWeight: 700 }}>{ev.role_title || 'Practical Coding Viva'}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {formatDate(ev.timestamp)}</span>
            {ev.assessor_username && <span>• Evaluated by: <strong style={{ color: 'var(--text-main)' }}>Prof. {ev.assessor_username}</strong></span>}
            {ev.language && <span>• Viva Language: <strong style={{ color: 'var(--secondary)' }}>{ev.language.toUpperCase()}</strong></span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {token && !String(ev._id).startsWith('sample_') && (
            <button
              onClick={() => window.open(`${getBaseUrl()}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank')}
              className="pn-btn pn-btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
            >
              <Download size={14} /> Download PDF
            </button>
          )}
          {isPractice && onDelete && (
            <button
              onClick={() => onDelete(ev._id)}
              className="pn-btn pn-btn-outline"
              style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem', color: 'var(--error)' }}
              title="Delete my practice data"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(124, 92, 255, 0.14)', color: 'var(--primary)', border: '1px solid rgba(124, 92, 255, 0.3)', padding: '0.4rem 0.9rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.86rem' }}>
            <Award size={15} /> Viva Grade: {ev.scores?.overall_score}/10
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center', marginBottom: '1.1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.9rem' }}>
          <MetricBar score={ev.scores?.technical_accuracy} label="Code Correctness" />
          <MetricBar score={ev.scores?.depth} label="Oral Complexity Defense" />
          <MetricBar score={ev.scores?.communication} label="Speech & Explanation" />
          <MetricBar score={ev.scores?.confidence} label="Confidence" />
          <MetricBar score={ev.scores?.completeness} label="Problem Completion" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ScoreRadar scores={ev.scores} size={185} />
        </div>
      </div>

      {ev.feedback && (
        <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <strong style={{ color: 'var(--success)', fontSize: '0.84rem' }}>Your Strengths:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: 'var(--pn-saffron)', fontSize: '0.84rem' }}>What to Improve Before Exam:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.84rem' }}>Viva Feedback: </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{ev.feedback.summary}</span>
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
