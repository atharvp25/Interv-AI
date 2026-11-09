import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  GraduationCap,
  Briefcase,
  TerminalSquare,
  Mic,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { PLATFORM_NAME } from '../brand'

const SUPPORTED_LANGUAGES = [
  'English (India)',
  'Hinglish (Code-mixed)',
  'हिन्दी (Hindi)',
  'मराठी (Marathi)',
  'தமிழ் (Tamil)',
  'తెలుగు (Telugu)',
  'ಕನ್ನಡ (Kannada)',
  'বাংলা (Bengali)',
  'ગુજરાતી (Gujarati)',
  'ਪੰਜਾਬੀ (Punjabi)',
  'മലയാളം (Malayalam)',
]

export default function Home() {
  const navigate = useNavigate()
  const { token, startGuestMode } = useContext(AuthContext)

  return (
    <div className="pn-container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
      {/* ── EDITORIAL SPLIT HEADER ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'start',
          paddingBottom: '48px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '48px',
        }}
      >
        {/* Left Column: Plain Value Proposition */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <span className="pn-badge pn-badge-primary">
              Voice assessment &amp; oral viva platform
            </span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              lineHeight: 1.2,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '16px',
            }}
          >
            Structured voice screenings and coding vivas in 11 Indian languages.
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {PLATFORM_NAME} pairs a real-time speech examiner (Gnani Prisma STT and Timbre TTS over WebRTC) with a live code editor. Built for university faculty conducting oral lab vivas and hiring teams screening engineering or sales candidates.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(token ? '/dashboard' : '/login')}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              {token ? 'Open workspace' : 'Sign in to workspace'} <ArrowRight size={16} strokeWidth={1.5} />
            </button>

            {!token && (
              <button
                type="button"
                className="btn-secondary"
                onClick={startGuestMode}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Eye size={16} strokeWidth={1.5} /> Preview in guest mode
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Single-claimer tokenized links</span>
            <span>·</span>
            <span>Python, C, C++, Java live defense</span>
            <span>·</span>
            <span>6-axis horizontal scorecards</span>
          </div>
        </div>

        {/* Right Column: Live Session Specification Card */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Sample session</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>CS301 Algorithms Oral Viva</div>
            </div>
            <span className="pn-badge pn-badge-success">Live WebRTC</span>
          </div>

          {/* Sample Transcript Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>Examiner (AI)</div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                Your `two_sum` implementation uses a hash map. Can you explain why the worst-case lookup remains O(1) on average?
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border-strong)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>Candidate (Hinglish)</div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                Hash table mein हर element के लिए complement check कर रहे हैं, so single pass में O(N) time और O(N) auxiliary space लगता है.
              </div>
            </div>
          </div>

          {/* Quiet Telemetry Strip Preview */}
          <div
            className="mono-font"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '10px 12px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--border)',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>STT</span>
              <strong style={{ color: 'var(--text)' }}>310 ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>LLM</span>
              <strong style={{ color: 'var(--text)' }}>420 ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>TTS</span>
              <strong style={{ color: 'var(--text)' }}>280 ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total</span>
              <strong style={{ color: 'var(--success-text)' }}>1010 ms</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO CORE TRACKS (EDUCATION & HIRING) ── */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Two dedicated workspaces
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <GraduationCap size={20} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>University labs &amp; faculty vivas</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
              Verify that students understand the code they submit. Students solve programming problems in a clean editor (Python, C, C++, Java) and defend their time and space complexity aloud.
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Configurable problem statements and rubric checklists</li>
              <li>Up to 3 compiler verification attempts per viva</li>
              <li>Class roster table with sortable grades and PDF export</li>
            </ul>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Briefcase size={20} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Recruiter technical &amp; sales screening</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
              Run structured first-round voice screenings for BDA sales role-play or software engineering roles. Upload a job description to extract domain keyterms automatically.
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Realistic objection handling in English, Hinglish, or regional languages</li>
              <li>Single-claimer links with custom expiration and revocation</li>
              <li>6-axis horizontal scorecard with human assessor review notes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── WORKFLOW STEPS ── */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Assessment workflow
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            {
              icon: TerminalSquare,
              step: '1. Configure rubric & link',
              desc: 'Select a technical or sales track, choose the interview language, set link expiry and attempt limits, or upload a PDF/DOCX job description.',
            },
            {
              icon: Mic,
              step: '2. Live voice & code session',
              desc: 'The candidate claims the link, confirms audio consent, and completes the two-zone voice interview and code defense.',
            },
            {
              icon: FileCheck2,
              step: '3. Human-reviewed scorecard',
              desc: 'Review the 6-axis horizontal bar breakdown, strengths, areas to improve, and per-turn latency metrics. Export a print-ready PDF.',
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon size={16} strokeWidth={1.5} color="var(--text-secondary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>{item.step}</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SUPPORTED LANGUAGES ── */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px 0' }}>
              Supported Indian &amp; code-mixed languages
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Powered by Gnani Prisma v3.0 ASR with automatic domain keyterm boosting and Devanagari / Indic script rendering.
            </p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={15} strokeWidth={1.5} /> AI-assisted evaluation, reviewed by a human assessor
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <span
              key={lang}
              className="pn-badge"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
