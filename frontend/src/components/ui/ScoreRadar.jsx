import React, { memo, useState } from 'react'

const AXES = [
  { key: 'technical_accuracy', label: 'Technical accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'depth', label: 'Concept depth' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'overall_score', label: 'Overall score' },
]

function ScoreRadar({ scores = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      }}
    >
      {AXES.map((axis) => {
        const raw = Number(scores[axis.key] ?? 0)
        const val = Math.max(0, Math.min(10, raw))
        const pct = (val / 10) * 100
        const barColor =
          val >= 7 ? 'var(--success-text)' : val >= 5 ? 'var(--accent)' : 'var(--danger-text)'

        return (
          <div key={axis.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{axis.label}</span>
              <span className="mono-font" style={{ color: 'var(--text)', fontWeight: 600 }}>
                {val.toFixed(1)} / 10
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  transition: 'width 140ms ease-out',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ScoreDonut({ value = 0, max = 10 }) {
  const num = Number(value || 0)
  const badgeClass =
    num >= 7 ? 'pn-badge-success' : num >= 5 ? 'pn-badge-warning' : 'pn-badge-danger'

  return (
    <span className={`pn-badge ${badgeClass} mono-font`} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, padding: '4px 10px' }}>
      {num.toFixed(1)} / {max}
    </span>
  )
}

export function Sparkline({ data = [], values = [] }) {
  const pts = data.length ? data : values
  if (!pts || pts.length === 0) return null
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length
  return (
    <span className="mono-font" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
      Avg {avg.toFixed(1)}
    </span>
  )
}

export function ScorecardReport({ evaluation, formatDate, onDownloadPdf, onClose }) {
  const [assessorNotes, setAssessorNotes] = useState(evaluation?.assessor_notes || '')
  if (!evaluation) return null

  const overall = Number(evaluation.scores?.overall_score || 0)
  const statusLabel = overall >= 7 ? 'Recommended' : overall >= 5 ? 'Borderline' : 'Needs improvement'
  const statusClass = overall >= 7 ? 'pn-badge-success' : overall >= 5 ? 'pn-badge-warning' : 'pn-badge-danger'

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        width: '100%',
      }}
    >
      {/* Scorecard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
              Assessment scorecard
            </span>
            <span className="pn-badge" style={{ textTransform: 'uppercase' }}>
              {evaluation.language || 'en-IN'}
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: '4px' }}>
            {evaluation.taker_name || 'Candidate'}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            {evaluation.role_title || 'Voice Assessment'}
            {evaluation.taker_email ? ` • ${evaluation.taker_email}` : ''}
            {evaluation.timestamp && formatDate ? ` • ${formatDate(evaluation.timestamp)}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`pn-badge ${statusClass}`}>{statusLabel}</span>
            <span className="mono-font" style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
              {overall.toFixed(1)}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
            </span>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {onDownloadPdf && (
              <button
                type="button"
                className="btn-secondary pn-btn-sm"
                onClick={() => onDownloadPdf(evaluation._id, evaluation.role_title)}
              >
                Download PDF
              </button>
            )}
            <button
              type="button"
              className="btn-secondary pn-btn-sm"
              onClick={() => window.print()}
            >
              Print
            </button>
            {onClose && (
              <button type="button" className="btn-ghost pn-btn-sm" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary & 6-Axis Horizontal Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '12px' }}>
            6-axis competency breakdown
          </h3>
          <ScoreRadar scores={evaluation.scores} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Executive summary
            </h3>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                margin: 0,
              }}
            >
              {evaluation.feedback?.summary || 'No summary recorded for this session.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--success-text)', marginBottom: '8px' }}>
                Observed strengths
              </h4>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(evaluation.feedback?.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--warning-text)', marginBottom: '8px' }}>
                Areas to improve
              </h4>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(evaluation.feedback?.areas_for_improvement || []).map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Assessor Notes Area */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="assessor-notes-input" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Assessor review notes
        </label>
        <textarea
          id="assessor-notes-input"
          rows={2}
          value={assessorNotes}
          onChange={(e) => setAssessorNotes(e.target.value)}
          placeholder="Add human reviewer observations, hiring decision notes, or viva grading adjustments..."
          style={{ fontSize: 'var(--text-xs)', marginTop: '4px' }}
        />
      </div>

      {/* Governance Notice */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}
      >
        <span>AI-assisted evaluation — reviewed by a human assessor before final decision.</span>
        <span className="mono-font">ID: {String(evaluation._id || 'session').slice(-8)}</span>
      </div>
    </div>
  )
}

export default memo(ScoreRadar)
