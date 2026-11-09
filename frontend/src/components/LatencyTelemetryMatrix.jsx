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
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      borderRadius: '12px',
      padding: '1.15rem 1.35rem',
      color: '#fff',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
    }}>
      {/* Matrix Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
          }}>
            <Zap size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.96rem', letterSpacing: '-0.2px', color: '#f87171' }}>
                Real-Time Latency Telemetry Matrix
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.35)'
              }}>
                Super Admin HUD
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Live Turnaround Telemetry • Gnani Prisma v3.0 + Gemini Flash + Gnani Timbre v2.5
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Turns Evaluated: <strong style={{ color: '#fff' }}>{turn_count || turns.length || 1}</strong>
          </span>
          {turns.length > 0 && (
            <button
              onClick={() => setShowTurns(!showTurns)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f1f5f9',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {showTurns ? <><ChevronUp size={13} /> Hide Turns</> : <><ChevronDown size={13} /> View Turns ({turns.length})</>}
            </button>
          )}
        </div>
      </div>

      {/* 4 Pipeline Latency Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        {/* STT */}
        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#7dd3fc', marginBottom: '0.25rem' }}>
            <Mic size={13} /> STT (Prisma v3.0)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8' }}>
            {avg_stt_ms} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#7dd3fc' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>Candidate speech end → Transcript</div>
        </div>

        {/* LLM */}
        <div style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)', borderRadius: '8px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#d8b4fe', marginBottom: '0.25rem' }}>
            <Cpu size={13} /> LLM (Gemini Flash)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c084fc' }}>
            {avg_llm_ms} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#d8b4fe' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>Transcript → Reasoning Token</div>
        </div>

        {/* TTS */}
        <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '8px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#86efac', marginBottom: '0.25rem' }}>
            <Volume2 size={13} /> TTS (Gnani Timbre)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399' }}>
            {avg_tts_ms} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#86efac' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>Text → Audio Stream Out</div>
        </div>

        {/* Total Turnaround E2E */}
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#fca5a5', marginBottom: '0.25rem' }}>
            <Activity size={13} /> Total Turnaround (E2E)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f87171' }}>
            {(avg_e2e_ms / 1000).toFixed(2)} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#fca5a5' }}>sec ({avg_e2e_ms}ms)</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginTop: '0.2rem' }}>Candidate done → AI Voice Audible</div>
        </div>
      </div>

      {/* Proportional Latency Stack Bar */}
      <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: showTurns ? '0.85rem' : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
          <span>Pipeline Turnaround Proportions:</span>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
            <span style={{ color: '#38bdf8' }}>● STT: {sttPct}%</span>
            <span style={{ color: '#c084fc' }}>● LLM: {llmPct}%</span>
            <span style={{ color: '#34d399' }}>● TTS: {ttsPct}%</span>
          </div>
        </div>
        <div style={{ height: '7px', display: 'flex', borderRadius: '4px', overflow: 'hidden', background: '#334155' }}>
          <div style={{ width: `${sttPct}%`, background: '#38bdf8' }} title={`STT: ${sttPct}%`} />
          <div style={{ width: `${llmPct}%`, background: '#c084fc' }} title={`LLM: ${llmPct}%`} />
          <div style={{ width: `${ttsPct}%`, background: '#34d399' }} title={`TTS: ${ttsPct}%`} />
        </div>
      </div>

      {/* Per-Turn Latency Breakdown Table */}
      {showTurns && turns.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          fontSize: '0.76rem',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.45rem 0.75rem' }}>Turn #</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>STT Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>LLM Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>TTS Latency</th>
                <th style={{ padding: '0.45rem 0.75rem' }}>Turnaround (E2E)</th>
              </tr>
            </thead>
            <tbody>
              {turns.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>Turn {t.turn_index || idx + 1}</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: '#38bdf8' }}>{t.stt_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: '#c084fc' }}>{t.llm_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: '#34d399' }}>{t.tts_ms} ms</td>
                  <td style={{ padding: '0.45rem 0.75rem', color: '#f87171', fontWeight: 600 }}>
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

