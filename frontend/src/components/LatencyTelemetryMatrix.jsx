import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Activity } from 'lucide-react'

export default function LatencyTelemetryMatrix({ telemetry, isSuperAdmin = false }) {
  const [showTurns, setShowTurns] = useState(false)

  if (!isSuperAdmin || !telemetry || !telemetry.avg_e2e_ms) return null

  const {
    avg_stt_ms = 0,
    avg_llm_ms = 0,
    avg_tts_ms = 0,
    avg_e2e_ms = 0,
    turn_count = 0,
    turns = [],
  } = telemetry

  return (
    <div
      style={{
        marginTop: '16px',
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} strokeWidth={1.5} color="var(--text-secondary)" />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Pipeline telemetry ({turn_count || turns.length || 1} turns)
          </span>
        </div>

        <div className="mono-font" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-xs)', color: 'var(--text)' }}>
          <span>STT {avg_stt_ms}ms</span>
          <span>LLM {avg_llm_ms}ms</span>
          <span>TTS {avg_tts_ms}ms</span>
          <span style={{ fontWeight: 600 }}>Total {(avg_e2e_ms / 1000).toFixed(2)}s</span>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTurns(!showTurns)}
              className="btn-ghost pn-btn-sm"
              style={{ padding: '2px 8px' }}
            >
              {showTurns ? (
                <>
                  <ChevronUp size={14} strokeWidth={1.5} /> Hide turns
                </>
              ) : (
                <>
                  <ChevronDown size={14} strokeWidth={1.5} /> Per-turn log
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showTurns && turns.length > 0 && (
        <div className="b2b-table-wrap" style={{ marginTop: '12px' }}>
          <table className="b2b-table mono-font" style={{ fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr>
                <th>Turn</th>
                <th>STT (ms)</th>
                <th>LLM (ms)</th>
                <th>TTS (ms)</th>
                <th>Total E2E</th>
              </tr>
            </thead>
            <tbody>
              {turns.map((t, idx) => (
                <tr key={idx}>
                  <td>#{t.turn_index || idx + 1}</td>
                  <td>{t.stt_ms} ms</td>
                  <td>{t.llm_ms} ms</td>
                  <td>{t.tts_ms} ms</td>
                  <td style={{ fontWeight: 600 }}>
                    {((t.total_e2e_ms || 0) / 1000).toFixed(2)} s ({t.total_e2e_ms} ms)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
