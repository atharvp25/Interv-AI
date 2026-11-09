import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import {
  Plus, Users, Link2, Award, Calendar, Download, Copy,
  Ban, CheckCircle2, TrendingUp, Eye, X, Briefcase
} from 'lucide-react';
import LatencyTelemetryMatrix from '../LatencyTelemetryMatrix';
import ScoreRadar, { ScoreDonut, Sparkline } from '../ui/ScoreRadar';
import EmptyState from '../ui/EmptyState';
import CountUp from '../ui/CountUp';

export default function RecruiterDashboardView({
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
      {/* Recruiter Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex' }}>
              <Briefcase size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>
              Recruiter Hiring Workspace
            </h1>
            <span className="pn-badge pn-badge-primary">
              Enterprise Screening
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {user?.organization ? `Organization: ${user.organization} • ` : ''}Manage BDA sales screenings &amp; technical interviews across India.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}>
          <Plus size={16} /> Create Screening Link
        </button>
      </div>

      {/* Recruiter KPI Cards with Sparklines & CountUp */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Candidates Screened
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <CountUp value={assignedEvals.length} />
            </div>
          </div>
          <Sparkline values={[2, 4, 5, 7, 6, 9, Math.max(2, assignedEvals.length)]} color="var(--primary)" />
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Average Candidate Score
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              {assignedEvals.length ? <><CountUp value={avgScoreNum} decimals={1} />/10</> : '—'}
            </div>
          </div>
          <Sparkline values={[6.8, 7.2, 7.8, 8.1, 8.4, avgScoreNum || 8.2]} color="var(--primary)" />
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Active Screening Links
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <CountUp value={activeLinksCount} />
            </div>
          </div>
          <Sparkline values={[1, 2, 3, 2, 4, Math.max(1, activeLinksCount)]} color="var(--secondary)" />
        </div>
      </div>

      {/* Recruiter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Users size={15} /> Candidate Scorecards ({assignedEvals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={activeTab === 'links' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Link2 size={15} /> Manage Screening Links ({assessments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Award size={15} /> Recruiter Self-Test Practice ({practiceEvals.length})
        </button>
      </div>

      {/* TAB 1: Candidate Scorecards */}
      {activeTab === 'assigned' && (
        assignedEvals.length === 0 ? (
          <EmptyState
            variant="candidates"
            title="No Candidate Submissions Yet"
            description="Create an assessment link and send it to your candidates. Once they complete their voice screening, their 6-axis radar scorecard will appear here."
            actionLabel="Create Screening Link"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {assignedEvals.map((ev, i) => (
              <EvaluationCard
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

      {/* TAB 2: Manage Screening Links */}
      {activeTab === 'links' && (
        assessments.length === 0 ? (
          <EmptyState
            variant="assessments"
            title="No Active Screening Links"
            description="Generate tokenized links with custom expiry windows to screen candidates for BDA sales or technical roles."
            actionLabel="Create Screening Link"
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
                        <span>• Language: <strong>{a.language?.toUpperCase()}</strong></span>
                        <span>• Attempts: <strong>{a.attempts_used}/{a.max_attempts}</strong></span>
                        {a.claimed_by_email && <span>• Candidate: <strong style={{ color: 'var(--secondary)' }}>{a.claimed_by_email}</strong></span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="pn-btn pn-btn-outline"
                        onClick={() => onToggleShare(a.assessment_id, a.share_with_taker)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                      >
                        {a.share_with_taker ? '✅ Report Shared with Candidate' : '🔒 Report Hidden from Candidate'}
                      </button>

                      <button
                        className="pn-btn pn-btn-outline"
                        onClick={() => onToggleRevoke(a.assessment_id, a.status)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: a.status === 'active' ? 'var(--error)' : 'var(--success)' }}
                      >
                        {a.status === 'active' ? <><Ban size={13} /> Revoke</> : <><CheckCircle2 size={13} /> Reactivate</>}
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

      {/* TAB 3: Recruiter Self-Test Practice */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <EmptyState
            variant="assessments"
            title="No Self-Test Sessions Yet"
            description="Want to test the AI interviewer voice flow yourself before sending links to candidates?"
            actionLabel="Start Test Practice Session"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {practiceEvals.map((ev, i) => (
              <EvaluationCard
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

      {/* Candidate Detail Radar Modal */}
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
              Candidate: <strong>{selectedEval.taker_name || 'Candidate'}</strong> • {formatDate(selectedEval.timestamp)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <ScoreRadar scores={selectedEval.scores} size={220} />
              <div style={{ textAlign: 'center' }}>
                <ScoreDonut score={selectedEval.scores?.overall_score || 0} size={110} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>Overall Composite Score</div>
              </div>
            </div>
            {selectedEval.feedback && (
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--primary)' }}>Executive Summary: </strong>
                {selectedEval.feedback.summary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EvaluationCard({ ev, token, formatDate, getBaseUrl, onDelete, onInspect, isPractice = false, isSuperAdmin = false }) {
  return (
    <div className="pn-card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.9rem' }}>
        <div>
          <h3 className="brand-font" style={{ fontSize: '1.15rem', marginBottom: '0.25rem', fontWeight: 700 }}>{ev.role_title || 'Voice Screening'}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {formatDate(ev.timestamp)}</span>
            {ev.taker_name && !isPractice && <span>• Candidate: <strong style={{ color: 'var(--text-main)' }}>{ev.taker_name}</strong> {ev.taker_email ? `(${ev.taker_email})` : ''}</span>}
            {ev.language && <span>• Language: <strong style={{ color: 'var(--secondary)' }}>{ev.language.toUpperCase()}</strong></span>}
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
              <Download size={14} /> Download PDF
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
            <Award size={15} /> Score: {ev.scores?.overall_score}/10
          </div>
        </div>
      </div>

      {/* 5-Metric Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.1rem' }}>
        <MetricBar score={ev.scores?.technical_accuracy} label="Pitch & Domain Knowledge" />
        <MetricBar score={ev.scores?.communication} label="Hinglish / Speech Fluency" />
        <MetricBar score={ev.scores?.confidence} label="Confidence Under Pressure" />
        <MetricBar score={ev.scores?.depth} label="Objection Handling" />
        <MetricBar score={ev.scores?.completeness} label="Closing & Next Steps" />
      </div>

      {ev.feedback && (
        <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <strong style={{ color: 'var(--success)', fontSize: '0.84rem' }}>Candidate Strengths:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: 'var(--pn-saffron)', fontSize: '0.84rem' }}>Areas for Review:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {(ev.feedback.areas_for_improvement || []).map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.84rem' }}>Summary: </strong>
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
