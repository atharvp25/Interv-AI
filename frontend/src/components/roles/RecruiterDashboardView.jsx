import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, Copy, Ban, CheckCircle2, Eye, ArrowUpDown, Trash2, Share2, Lock
} from 'lucide-react';
import { ScorecardReport } from '../ui/ScoreRadar';
import EmptyState from '../ui/EmptyState';

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
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}) {
  const navigate = useNavigate();
  const [localTab, setLocalTab] = useState('assigned');
  const activeTab = propActiveTab || localTab;
  const setActiveTab = propSetActiveTab || setLocalTab;

  const [copiedId, setCopiedId] = useState('');
  const [selectedEval, setSelectedEval] = useState(null);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const assignedEvals = useMemo(() => evaluations.filter((e) => !e.is_practice), [evaluations]);
  const practiceEvals = useMemo(() => evaluations.filter((e) => e.is_practice), [evaluations]);

  const avgScoreNum = assignedEvals.length
    ? assignedEvals.reduce((acc, curr) => acc + (curr.scores?.overall_score || 0), 0) / assignedEvals.length
    : 0;
  const activeLinksCount = assessments.filter((a) => a.status === 'active').length;
  const recommendedCount = assignedEvals.filter((e) => (e.scores?.overall_score || 0) >= 7.5).length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedAssigned = useMemo(() => {
    const filtered = assignedEvals.filter((ev) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (ev.taker_name || '').toLowerCase().includes(q) ||
        (ev.taker_email || '').toLowerCase().includes(q) ||
        (ev.role_title || '').toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      let va;
      let vb;
      if (sortField === 'overall') {
        va = Number(a.scores?.overall_score || 0);
        vb = Number(b.scores?.overall_score || 0);
      } else if (sortField === 'technical') {
        va = Number(a.scores?.technical_accuracy || 0);
        vb = Number(b.scores?.technical_accuracy || 0);
      } else if (sortField === 'communication') {
        va = Number(a.scores?.communication || 0);
        vb = Number(b.scores?.communication || 0);
      } else if (sortField === 'name') {
        va = (a.taker_name || 'Candidate').toLowerCase();
        vb = (b.taker_name || 'Candidate').toLowerCase();
      } else {
        va = a.timestamp || '';
        vb = b.timestamp || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assignedEvals, sortField, sortDir, searchQuery]);

  const getStatusBadge = (score) => {
    const s = Number(score || 0);
    if (s >= 7.5) return <span className="pn-badge pn-badge-success">Recommended</span>;
    if (s >= 5.5) return <span className="pn-badge pn-badge-warning">Borderline</span>;
    return <span className="pn-badge pn-badge-danger">Needs review</span>;
  };

  const handleDownloadPdf = (ev) => {
    if (!token || String(ev._id).startsWith('sample_')) {
      window.print();
      return;
    }
    window.open(`${getBaseUrl()}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank');
  };

  return (
    <div>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>
            Hiring &amp; candidate screening
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {user?.organization ? `${user.organization} · ` : ''}Compare structured candidate evaluations, manage screening links, and export scorecards.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')}>
          <Plus size={16} strokeWidth={1.5} /> Create screening link
        </button>
      </div>

      {/* Summary Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
            Candidates evaluated
          </div>
          <div className="mono-font" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)' }}>
            {assignedEvals.length}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
            Recommended (≥ 7.5)
          </div>
          <div className="mono-font" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--success-text)' }}>
            {recommendedCount}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
            Mean composite score
          </div>
          <div className="mono-font" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)' }}>
            {assignedEvals.length ? `${avgScoreNum.toFixed(1)} / 10` : '—'}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
            Active screening links
          </div>
          <div className="mono-font" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)' }}>
            {activeLinksCount}
          </div>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('assigned')}
            className={activeTab === 'assigned' ? 'btn-secondary' : 'btn-ghost'}
            style={{
              fontWeight: activeTab === 'assigned' ? 600 : 500,
              borderColor: activeTab === 'assigned' ? 'var(--border-strong)' : 'transparent',
              background: activeTab === 'assigned' ? 'var(--surface)' : 'transparent',
            }}
          >
            Candidate comparison ({assignedEvals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={activeTab === 'links' ? 'btn-secondary' : 'btn-ghost'}
            style={{
              fontWeight: activeTab === 'links' ? 600 : 500,
              borderColor: activeTab === 'links' ? 'var(--border-strong)' : 'transparent',
              background: activeTab === 'links' ? 'var(--surface)' : 'transparent',
            }}
          >
            Screening links ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={activeTab === 'practice' ? 'btn-secondary' : 'btn-ghost'}
            style={{
              fontWeight: activeTab === 'practice' ? 600 : 500,
              borderColor: activeTab === 'practice' ? 'var(--border-strong)' : 'transparent',
              background: activeTab === 'practice' ? 'var(--surface)' : 'transparent',
            }}
          >
            Calibration runs ({practiceEvals.length})
          </button>
        </div>

        {activeTab === 'assigned' && assignedEvals.length > 0 && (
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by candidate or role..."
            style={{ width: '240px', padding: '6px 12px', fontSize: '13px' }}
          />
        )}
      </div>

      {/* TAB 1: Candidate Comparison Table */}
      {activeTab === 'assigned' && (
        assignedEvals.length === 0 ? (
          <EmptyState
            title="No candidate evaluations yet"
            description="Create a screening link and share it with applicants. Completed voice assessments and 6-axis scorecards will populate this comparison table."
            actionLabel="Create screening link"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div className="b2b-table-wrap">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Candidate <ArrowUpDown size={12} strokeWidth={1.5} />
                    </span>
                  </th>
                  <th>Role / Assessment</th>
                  <th>Language</th>
                  <th className="sortable numeric" onClick={() => handleSort('technical')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Domain <ArrowUpDown size={12} strokeWidth={1.5} />
                    </span>
                  </th>
                  <th className="sortable numeric" onClick={() => handleSort('communication')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Fluency <ArrowUpDown size={12} strokeWidth={1.5} />
                    </span>
                  </th>
                  <th className="sortable numeric" onClick={() => handleSort('overall')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Overall <ArrowUpDown size={12} strokeWidth={1.5} />
                    </span>
                  </th>
                  <th>Status</th>
                  <th className="sortable" onClick={() => handleSort('timestamp')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Completed <ArrowUpDown size={12} strokeWidth={1.5} />
                    </span>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssigned.map((ev, i) => (
                  <tr key={ev._id || i}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{ev.taker_name || 'Candidate'}</div>
                      {ev.taker_email && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.taker_email}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{ev.role_title || 'Voice screening'}</div>
                      {ev.feedback?.summary && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.feedback.summary}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="pn-badge" style={{ textTransform: 'capitalize' }}>
                        {ev.language || 'en'}
                      </span>
                    </td>
                    <td className="numeric">{Number(ev.scores?.technical_accuracy || 0).toFixed(1)}</td>
                    <td className="numeric">{Number(ev.scores?.communication || 0).toFixed(1)}</td>
                    <td className="numeric" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {Number(ev.scores?.overall_score || 0).toFixed(1)} / 10
                    </td>
                    <td>{getStatusBadge(ev.scores?.overall_score)}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(ev.timestamp)}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEval(ev)}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          <Eye size={14} strokeWidth={1.5} /> Scorecard
                        </button>
                        {token && !String(ev._id).startsWith('sample_') && (
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(ev)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            title="Download PDF report"
                          >
                            <Download size={14} strokeWidth={1.5} /> PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 2: Manage Screening Links */}
      {activeTab === 'links' && (
        assessments.length === 0 ? (
          <EmptyState
            title="No screening links created"
            description="Generate tokenized links with configurable expiry windows and attempt limits for BDA sales or technical roles."
            actionLabel="Create screening link"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div className="b2b-table-wrap">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Role / Title</th>
                  <th>Track &amp; Language</th>
                  <th className="numeric">Attempts</th>
                  <th>Claimed by</th>
                  <th>Candidate access</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Shareable link &amp; controls</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const fullLink = `${window.location.origin}/assess/${a.share_token}`;
                  return (
                    <tr key={a.assessment_id}>
                      <td style={{ fontWeight: 600 }}>{a.role_title}</td>
                      <td>
                        <span className="pn-badge" style={{ marginRight: '6px' }}>{a.track}</span>
                        <span className="pn-badge">{a.language}</span>
                      </td>
                      <td className="numeric">
                        {a.attempts_used} / {a.max_attempts}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {a.claimed_by_email || 'Unclaimed'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onToggleShare(a.assessment_id, a.share_with_taker)}
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          {a.share_with_taker ? (
                            <><Share2 size={13} strokeWidth={1.5} /> Shared with candidate</>
                          ) : (
                            <><Lock size={13} strokeWidth={1.5} /> Hidden from candidate</>
                          )}
                        </button>
                      </td>
                      <td>
                        <span className={`pn-badge ${a.status === 'active' ? 'pn-badge-success' : 'pn-badge-danger'}`}>
                          {a.status === 'active' ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="text"
                            readOnly
                            value={fullLink}
                            className="mono-font"
                            style={{ width: '210px', padding: '4px 8px', fontSize: '12px', background: 'var(--bg)' }}
                          />
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(fullLink);
                              setCopiedId(a.assessment_id);
                              setTimeout(() => setCopiedId(''), 2000);
                            }}
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            <Copy size={13} strokeWidth={1.5} /> {copiedId === a.assessment_id ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onToggleRevoke(a.assessment_id, a.status)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              color: a.status === 'active' ? 'var(--danger-text)' : 'var(--success-text)',
                            }}
                          >
                            {a.status === 'active' ? (
                              <><Ban size={13} strokeWidth={1.5} /> Revoke</>
                            ) : (
                              <><CheckCircle2 size={13} strokeWidth={1.5} /> Reactivate</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 3: Calibration Practice Runs */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <EmptyState
            title="No calibration runs yet"
            description="Test the interview flow and rubric prompts yourself before sending screening links to applicants."
            actionLabel="Start calibration session"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div className="b2b-table-wrap">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Calibration title</th>
                  <th>Language</th>
                  <th className="numeric">Overall score</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {practiceEvals.map((ev, i) => (
                  <tr key={ev._id || i}>
                    <td style={{ fontWeight: 600 }}>{ev.role_title || 'Calibration run'}</td>
                    <td><span className="pn-badge">{ev.language || 'en'}</span></td>
                    <td className="numeric" style={{ fontWeight: 600 }}>
                      {Number(ev.scores?.overall_score || 0).toFixed(1)} / 10
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDate(ev.timestamp)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEval(ev)}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          <Eye size={14} strokeWidth={1.5} /> Scorecard
                        </button>
                        {onDeletePractice && (
                          <button
                            type="button"
                            onClick={() => onDeletePractice(ev._id)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--danger-text)' }}
                          >
                            <Trash2 size={14} strokeWidth={1.5} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Full B2B Scorecard Modal (Priority 2 Report View) */}
      {selectedEval && (
        <div
          onClick={() => setSelectedEval(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <ScorecardReport
              ev={selectedEval}
              formatDate={formatDate}
              onDownloadPdf={!String(selectedEval._id).startsWith('sample_') ? () => handleDownloadPdf(selectedEval) : null}
              onClose={() => setSelectedEval(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
