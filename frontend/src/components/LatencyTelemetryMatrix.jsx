import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Activity, Mic, Cpu, Volume2 } from 'lucide-react';

export default function LatencyTelemetryMatrix({ telemetry, isSuperAdmin = false }) {
  const [showTurns, setShowTurns] = useState(false);

  // Exclusively visible to Super Admin
  if (!isSuperAdmin || !telemetry || !telemetry.avg_e2e_ms) return null;

  const { avg_stt_ms = 0, avg_llm_ms = 0, avg_tts_ms = 0, avg_e2e_ms = 0, turn_count = 0, turns = [] } = telemetry;

  const sttPct = avg_e2e_ms > 0 ? Math.round((avg_stt_ms / avg_e2e_ms) * 100) : 33;
  const llmPct = avg_e2e_ms > 0 ? Math.round((avg_llm_ms / avg_e2e_ms) * 100) : 45;
  const ttsPct = avg_e2e_ms > 0 ? Math.max(0, 100 - sttPct - llmPct) : 22;

  return (
    <div style={{
      marginTop: '1.25rem',
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '1.15rem 1.35rem',
      color: 'var(--text-main)',
    }}>
      {/* Matrix Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'var(--primary-soft)', border: '1px solid rgba(37, 99, 235, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
          }}>
            <Zap size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em', color: 'var(--text-main)' }}>
                Real-Time Latency Telemetry Matrix
              </span>
              <span className="pn-badge pn-badge-primary">
                Super Admin HUD
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Pipeline Turnaround • Gnani Prisma v3.0 STT + LLM Inference + Gnani Timbre v2.5 TTS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Turns Evaluated: <strong className="mono-font" style={{ color: 'var(--text-main)' }}>{turn_count || turns.length || 1}</strong>
          </span>
          {turns.length > 0 && (
            <button
              onClick={() => setShowTurns(!showTurns)}
              className="btn-secondary"
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                gap: '0.3rem',
              }}
            >
              {showTurns ? <><ChevronUp size={13} /> Hide Turns</> : <><ChevronDown size={13} /> View Turns ({turns.length})</>}
            </button>
          )}
        </div>
      </div>

      {/* 4 Pipeline Latency Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', marginBottom: '0.85rem' }}>
        {/* STT */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <Mic size={13} color="var(--primary)" /> STT (Prisma v3.0)
          </div>
          <div className="mono-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {avg_stt_ms} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)', marginTop: '0.15rem' }}>Speech End → Transcript</div>
        </div>

        {/* LLM */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <Cpu size={13} color="var(--primary)" /> LLM Reasoning
          </div>
          <div className="mono-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {avg_llm_ms} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)', marginTop: '0.15rem' }}>Transcript → First Token</div>
        </div>

        {/* TTS */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <Volume2 size={13} color="var(--secondary)" /> TTS (Timbre v2.5)
          </div>
          <div className="mono-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {avg_tts_ms} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)', marginTop: '0.15rem' }}>Text → Audio Stream Out</div>
        </div>

        {/* Total Turnaround E2E */}
        <div style={{ background: 'var(--primary-soft)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '6px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--primary)', marginBottom: '0.2rem', fontWeight: 600 }}>
            <Activity size={13} /> Turnaround (E2E)
          </div>
          <div className="mono-font" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            {(avg_e2e_ms / 1000).toFixed(2)} <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>sec ({avg_e2e_ms}ms)</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Candidate done → Audio Audible</div>
        </div>
      </div>

      {/* Proportional Latency Stack Bar */}
      <div style={{ background: 'var(--bg-surface)', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: showTurns ? '0.75rem' : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          <span>Pipeline Latency Breakdown:</span>
          <div className="mono-font" style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--primary)' }}>● STT: {sttPct}%</span>
            <span style={{ color: '#6366F1' }}>● LLM: {llmPct}%</span>
            <span style={{ color: 'var(--secondary)' }}>● TTS: {ttsPct}%</span>
          </div>
        </div>
        <div style={{ height: '6px', display: 'flex', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-surface-2)' }}>
          <div style={{ width: `${sttPct}%`, background: 'var(--primary)' }} title={`STT: ${sttPct}%`} />
          <div style={{ width: `${llmPct}%`, background: '#6366F1' }} title={`LLM: ${llmPct}%`} />
          <div style={{ width: `${ttsPct}%`, background: 'var(--secondary)' }} title={`TTS: ${ttsPct}%`} />
        </div>
      </div>

      {/* Per-Turn Latency Breakdown Table */}
      {showTurns && turns.length > 0 && (
        <div style={{
          marginTop: '0.65rem',
          background: 'var(--bg-surface)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          fontSize: '0.74rem',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.45rem 0.75rem' }}>Turn #</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>STT Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>LLM Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>TTS Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>Turnaround (E2E)</th>
              </tr>
            </thead>
            <tbody className="mono-font">
              {turns.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>Turn {t.turn_index || idx + 1}</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: 'var(--primary)' }}>{t.stt_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: '#6366F1' }}>{t.llm_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: 'var(--secondary)' }}>{t.tts_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    {(t.total_e2e_ms / 1000).toFixed(2)} s ({t.total_e2e_ms} ms)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
