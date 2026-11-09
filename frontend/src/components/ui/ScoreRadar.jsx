import React, { memo, useState, useEffect } from 'react'
import { X, Download, Printer, Award, AlertCircle } from 'lucide-react'

const AXES = [
  { key: 'technical_accuracy', label: 'Domain knowledge & subject competence' },
  { key: 'communication', label: 'Verbal articulation & speech fluency' },
  { key: 'confidence', label: 'Professional composure & poise' },
  { key: 'depth', label: 'Analytical depth & critical thinking' },
  { key: 'completeness', label: 'Solution thoroughness & completeness' },
  { key: 'overall_score', label: 'Composite evaluation score' },
]

function ScoreRadar({ scores = {} }) {
  const safeScores = scores || {}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
      }}
    >
      {AXES.map((axis) => {
        const raw = Number(
          safeScores[axis.key] ??
          (axis.key === 'technical_accuracy' ? safeScores.technical : null) ??
          (axis.key === 'depth' ? safeScores.concept_depth : null) ??
          0
        )
        const val = Math.max(0, Math.min(10, raw))
        const pct = (val / 10) * 100
        const barColor =
          val >= 7 ? 'var(--success-text)' : val >= 5 ? 'var(--accent)' : 'var(--danger-text)'

        return (
          <div key={axis.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{axis.label}</span>
              <span className="mono-font" style={{ color: 'var(--text)', fontWeight: 600 }}>
                {val.toFixed(1)} / 10
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '7px',
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '4px',
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

export function ScoreDonut({ value = 0, score = 0, max = 10 }) {
  const num = Number(value || score || 0)
  const badgeClass =
    num >= 7 ? 'pn-badge-success' : num >= 5 ? 'pn-badge-warning' : 'pn-badge-danger'

  return (
    <span className={`pn-badge ${badgeClass} mono-font`} style={{ fontSize: '14px', fontWeight: 600, padding: '4px 10px' }}>
      {num.toFixed(1)} / {max}
    </span>
  )
}

export function Sparkline({ data = [], values = [] }) {
  const pts = data.length ? data : values
  if (!pts || pts.length === 0) return null
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length
  return (
    <span className="mono-font" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
      Avg {avg.toFixed(1)}
    </span>
  )
}

export function ScorecardReport({ evaluation, ev, formatDate, onDownloadPdf, onClose }) {
  const item = evaluation || ev
  const [assessorNotes, setAssessorNotes] = useState(item?.assessor_notes || '')

  useEffect(() => {
    if (item?.assessor_notes) {
      setAssessorNotes(item.assessor_notes)
    }
  }, [item])

  if (!item) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
        <AlertCircle size={24} color="var(--danger-text)" style={{ marginBottom: '8px' }} />
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Scorecard details could not be loaded.</p>
        {onClose && (
          <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '12px' }}>
            Close
          </button>
        )}
      </div>
    )
  }

  const scores = item.scores || {}
  const overall = Number(scores.overall_score || 0)
  const statusLabel = overall >= 7 ? 'Recommended' : overall >= 5 ? 'Borderline' : 'Needs improvement'
  const statusClass = overall >= 7 ? 'pn-badge-success' : overall >= 5 ? 'pn-badge-warning' : 'pn-badge-danger'

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border-strong)',
        borderRadius: '8px',
        padding: '28px',
        width: '100%',
        boxShadow: 'var(--shadow-overlay)',
        position: 'relative',
      }}
    >
      {/* Top Close Button (X) */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scorecard"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="btn-ghost"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      )}

      {/* Scorecard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '24px',
          paddingRight: onClose ? '36px' : '0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Official assessment scorecard
            </span>
            <span className="pn-badge" style={{ textTransform: 'uppercase' }}>
              {item.language || 'en-IN'}
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>
            {item.taker_name || 'Candidate'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {item.role_title || 'Voice assessment'}
            {item.taker_email ? ` · ${item.taker_email}` : ''}
            {item.timestamp && formatDate ? ` · ${formatDate(item.timestamp)}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`pn-badge ${statusClass}`}>{statusLabel}</span>
            <div
              className="mono-font"
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text)',
                display: 'inline-flex',
                alignItems: 'baseline',
              }}
            >
              {overall.toFixed(1)}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}> / 10</span>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {onDownloadPdf && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => onDownloadPdf(item._id, item.role_title)}
              >
                <Download size={14} strokeWidth={1.5} /> Download PDF
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => window.print()}
            >
              <Printer size={14} strokeWidth={1.5} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* 6-Axis Competencies and Summary Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Award size={16} strokeWidth={1.5} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
              6-Axis competency breakdown
            </h3>
          </div>
          <ScoreRadar scores={scores} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
              Executive evaluation summary
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg)',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {item.feedback?.summary || 'No summary recorded for this session.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-text)', margin: '0 0 8px 0' }}>
                Observed strengths
              </h4>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.45 }}>
                {(item.feedback?.strengths || []).length > 0 ? (
                  item.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li>Demonstrated baseline domain competence</li>
                )}
              </ul>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning-text)', margin: '0 0 8px 0' }}>
                Areas to improve
              </h4>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.45 }}>
                {(item.feedback?.areas_for_improvement || []).length > 0 ? (
                  item.feedback.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)
                ) : (
                  <li>Maintain structured response pace under pressure</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Assessor Review Notes */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="assessor-notes-input"
          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '6px' }}
        >
          Assessor human review notes
        </label>
        <textarea
          id="assessor-notes-input"
          rows={2}
          value={assessorNotes}
          onChange={(e) => setAssessorNotes(e.target.value)}
          placeholder="Add reviewer observations, oral defense grading adjustments, or hiring recommendations..."
          style={{ fontSize: '13px', width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Governance Notice Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <span>AI-assisted evaluation — reviewed by a human assessor before final academic or hiring decision.</span>
        <span className="mono-font">Record: {String(item._id || 'session').slice(-8)}</span>
      </div>
    </div>
  )
}

export default memo(ScoreRadar)
