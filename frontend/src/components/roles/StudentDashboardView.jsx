import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, Trash2, Link2, ArrowRight, Eye
} from 'lucide-react';
import { ScorecardReport } from '../ui/ScoreRadar';
import EmptyState from '../ui/EmptyState';

export default function StudentDashboardView({
  user,
  evaluations,
  token,
  onDeletePractice,
  formatDate,
  getBaseUrl,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}) {
  const navigate = useNavigate();
  const [localTab, setLocalTab] = useState('practice');
  const activeTab = propActiveTab || localTab;
  const setActiveTab = propSetActiveTab || setLocalTab;

  const [assignedLinkInput, setAssignedLinkInput] = useState('');
  const [selectedEval, setSelectedEval] = useState(null);

  const practiceEvals = evaluations.filter((e) => e.is_practice);
  const releasedEvals = evaluations.filter((e) => !e.is_practice && e.share_with_taker);

  const handleJoinViva = (e) => {
    e.preventDefault();
    const raw = assignedLinkInput.trim();
    if (!raw) return;
    const match = raw.match(/\/assess\/([A-Za-z0-9_-]+)/);
    navigate(`/assess/${match ? match[1] : raw}`);
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
      {/* Student Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>
            Student lab &amp; viva workspace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {user?.organization ? `${user.organization} · ` : ''}Practice writing code and defending algorithmic complexity aloud before lab examinations.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/setup')}>
          <Plus size={16} strokeWidth={1.5} /> Start practice viva
        </button>
      </div>

      {/* Assigned Viva Link Bar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
            <Link2 size={16} strokeWidth={1.5} color="var(--text-secondary)" /> Enter instructor viva link
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Paste the `/assess/...` URL or token shared by your professor to begin an assigned examination.
          </div>
        </div>
        <form onSubmit={handleJoinViva} style={{ display: 'flex', gap: '8px', flex: '1 1 280px', maxWidth: '420px' }}>
          <input
            type="text"
            value={assignedLinkInput}
            onChange={(e) => setAssignedLinkInput(e.target.value)}
            placeholder="Paste /assess/... link or token"
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
          />
          <button type="submit" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            Open viva <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </form>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
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
          Practice vivas ({practiceEvals.length})
        </button>
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
          Released faculty grades ({releasedEvals.length})
        </button>
      </div>

      {/* TAB 1: Practice Vivas */}
      {activeTab === 'practice' && (
        practiceEvals.length === 0 ? (
          <EmptyState
            title="No practice vivas yet"
            description="Run a mock coding and oral defense session in English, Hindi, or Marathi to receive a 6-axis breakdown."
            actionLabel="Start practice viva"
            onAction={() => navigate('/setup')}
          />
        ) : (
          <div className="b2b-table-wrap">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Practice topic</th>
                  <th>Language</th>
                  <th className="numeric">Code &amp; logic</th>
                  <th className="numeric">Oral defense</th>
                  <th className="numeric">Fluency</th>
                  <th className="numeric">Overall grade</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {practiceEvals.map((ev, i) => (
                  <tr key={ev._id || i}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{ev.role_title || 'Practical coding viva'}</div>
                      {ev.feedback?.summary && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.feedback.summary}
                        </div>
                      )}
                    </td>
                    <td><span className="pn-badge">{ev.language || 'en'}</span></td>
                    <td className="numeric">{Number(ev.scores?.technical_accuracy || 0).toFixed(1)}</td>
                    <td className="numeric">{Number(ev.scores?.depth || 0).toFixed(1)}</td>
                    <td className="numeric">{Number(ev.scores?.communication || 0).toFixed(1)}</td>
                    <td className="numeric" style={{ fontWeight: 600, color: 'var(--text)' }}>
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
                        {token && !String(ev._id).startsWith('sample_') && (
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(ev)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            <Download size={14} strokeWidth={1.5} /> PDF
                          </button>
                        )}
                        {onDeletePractice && (
                          <button
                            type="button"
                            onClick={() => onDeletePractice(ev._id)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--danger-text)' }}
                            title="Delete practice session"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
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

      {/* TAB 2: Released Grades */}
      {activeTab === 'assigned' && (
        releasedEvals.length === 0 ? (
          <EmptyState
            title="No released grades yet"
            description="When your instructor reviews and releases your official viva scorecard, it will appear here."
          />
        ) : (
          <div className="b2b-table-wrap">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Course / Viva exam</th>
                  <th>Instructor</th>
                  <th>Language</th>
                  <th className="numeric">Overall grade</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {releasedEvals.map((ev, i) => (
                  <tr key={ev._id || i}>
                    <td style={{ fontWeight: 600 }}>{ev.role_title || 'Assigned viva'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {ev.assessor_username ? `Prof. ${ev.assessor_username}` : 'Faculty'}
                    </td>
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
                        {token && !String(ev._id).startsWith('sample_') && (
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(ev)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
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

      {/* Scorecard Modal */}
      {selectedEval && (
        <div
          onClick={() => setSelectedEval(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <ScorecardReport
              evaluation={selectedEval}
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
