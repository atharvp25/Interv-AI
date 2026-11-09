import React, { useState, useContext } from 'react'
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
  Stethoscope,
  Scale,
  TrendingUp,
  Code2,
  CheckCircle2,
  Globe2,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { PLATFORM_NAME } from '../brand'

const SUPPORTED_LANGUAGES = [
  { name: 'English', native: 'English (India)' },
  { name: 'Hinglish', native: 'Hinglish (Code-mixed)' },
  { name: 'Hindi', native: 'हिन्दी' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { name: 'Malayalam', native: 'മലയാളം' },
]

const SAMPLE_SESSIONS = [
  {
    id: 'medical',
    category: 'Healthcare & Medicine',
    icon: Stethoscope,
    title: 'MBBS Clinical Case Viva',
    examiner: 'Patient presents with acute substernal chest pressure radiating to the jaw. Troponin-I is elevated. What is your immediate diagnostic step and triage protocol?',
    respondentLang: 'Hinglish / English',
    respondent: 'Immediate 12-lead ECG within 10 minutes to verify STEMI, high-flow oxygen if saturation < 90%, Aspirin 325mg chewable, and prepare for primary PCI protocol.',
    telemetry: { stt: 290, llm: 380, tts: 260, total: 930 },
  },
  {
    id: 'legal',
    category: 'Law & Jurisprudence',
    icon: Scale,
    title: 'Moot Court Oral Advocacy',
    examiner: 'Respondent argues Article 21 procedure was enacted by parliament and thus non-justiciable. How do you rebut this under the Maneka Gandhi precedent?',
    respondentLang: 'English / Indic',
    respondent: 'Under Maneka Gandhi v. Union of India, procedure established by law must be just, fair, and reasonable. Mere statutory enactment without substantive fairness violates Article 21.',
    telemetry: { stt: 310, llm: 410, tts: 270, total: 990 },
  },
  {
    id: 'business',
    category: 'Corporate & Sales',
    icon: TrendingUp,
    title: 'Enterprise BDA Objection Role-Play',
    examiner: 'We have an executive freeze on new SaaS licenses this quarter and your annual commitment exceeds our remaining discretionary budget.',
    respondentLang: 'Hinglish',
    respondent: 'Bilkul samajh sakta hoon sir. That is why we propose a 60-day phased pilot offset against existing vendor spend, proving clear ROI before budget reallocation.',
    telemetry: { stt: 280, llm: 350, tts: 250, total: 880 },
  },
  {
    id: 'tech',
    category: 'STEM & Engineering',
    icon: Code2,
    title: 'Software Engineering Viva & Code Defense',
    examiner: 'Explain why your order-processing pipeline uses an event-driven architecture with Kafka rather than synchronous REST calls.',
    respondentLang: 'English / Hinglish',
    respondent: 'Kafka decouples high-throughput ingest from fulfillment workers, preventing cascading timeouts during flash sales and guaranteeing at-least-once message delivery.',
    telemetry: { stt: 300, llm: 390, tts: 280, total: 970 },
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { token, startGuestMode } = useContext(AuthContext)
  const [activeSessionTab, setActiveSessionTab] = useState('medical')

  const currentSample = SAMPLE_SESSIONS.find((s) => s.id === activeSessionTab) || SAMPLE_SESSIONS[0]
  const SampleIcon = currentSample.icon

  return (
    <div className="pn-container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
      {/* ── EDITORIAL SPLIT HEADER ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'start',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '36px',
        }}
      >
        {/* Left Column: Universal Value Proposition */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <span className="pn-badge pn-badge-primary">
              Universal Oral Assessment &amp; Viva Studio
            </span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              lineHeight: 1.22,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '16px',
            }}
          >
            Structured oral vivas, candidate screenings, and case defenses in 11 Indian languages.
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {PLATFORM_NAME} conducts real-time voice viva voce examinations, corporate interview screenings, and oral case defenses over WebRTC with sub-second turnaround. Built for educators, recruiters, and candidates across all disciplines — medicine, law, business, corporate sales, and engineering.
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
                onClick={() => {
                  sessionStorage.setItem('intervai_guest_mode', 'true');
                  navigate('/select-role');
                }}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Eye size={16} strokeWidth={1.5} /> Preview in guest mode
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Medicine, Law, MBA &amp; STEM</span>
            <span>·</span>
            <span>Gnani Prisma v3.0 Indic ASR</span>
            <span>·</span>
            <span>Human-reviewed 6-axis scorecards</span>
          </div>
        </div>

        {/* Right Column: Multi-Discipline Interactive Session Showcase */}
        <div className="panel" style={{ padding: '24px', backgroundColor: 'var(--surface)' }}>
          {/* Discipline Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            {SAMPLE_SESSIONS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeSessionTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSessionTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-btn)',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--bg)',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 120ms ease-out',
                  }}
                >
                  <TabIcon size={14} strokeWidth={1.5} />
                  <span>{tab.category}</span>
                </button>
              )
            })}
          </div>

          {/* Session Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SampleIcon size={18} strokeWidth={1.5} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Live session simulation</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{currentSample.title}</div>
              </div>
            </div>
            <span className="pn-badge pn-badge-success">Live WebRTC</span>
          </div>

          {/* Transcript Dialogue Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Examiner (AI Voice)
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                {currentSample.examiner}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border-strong)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', marginBottom: '3px' }}>
                Candidate Response ({currentSample.respondentLang})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                {currentSample.respondent}
              </div>
            </div>
          </div>

          {/* Sub-Second Turnaround Telemetry Strip */}
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
              <strong style={{ color: 'var(--text)' }}>{currentSample.telemetry.stt} ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>LLM</span>
              <strong style={{ color: 'var(--text)' }}>{currentSample.telemetry.llm} ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>TTS</span>
              <strong style={{ color: 'var(--text)' }}>{currentSample.telemetry.tts} ms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Turnaround</span>
              <strong style={{ color: 'var(--success-text)' }}>{currentSample.telemetry.total} ms</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 11 INDIAN LANGUAGES LEFT-TO-RIGHT SLIDING ANIMATION ── */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          <Globe2 size={16} strokeWidth={1.5} color="var(--primary)" />
          <span>Real-time voice synthesis and speech recognition across 11 Indian languages</span>
        </div>

        <div className="language-marquee-wrapper">
          <div className="language-slider-ltr">
            {[...SUPPORTED_LANGUAGES, ...SUPPORTED_LANGUAGES, ...SUPPORTED_LANGUAGES].map((lang, idx) => (
              <div key={idx} className="language-circle-pill">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                <span>{lang.native}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>· {lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 DISCIPLINE STREAMS OVERVIEW ── */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="pn-badge pn-badge-primary" style={{ marginBottom: '6px' }}>
            Multi-Disciplinary Oral Evaluation
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Engineered for every academic &amp; professional stream
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Healthcare & Medical */}
          <div className="panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Stethoscope size={18} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Medicine &amp; Healthcare</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 12px 0' }}>
              Conduct clinical case presentation vivas, pharmacology question rounds, and emergency triage oral exams with medical symptom rubrics.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Best for: MBBS vivas, nursing certifications &amp; clinical staff hiring
            </div>
          </div>

          {/* Law & Moot Court */}
          <div className="panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Scale size={18} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Law &amp; Jurisprudence</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 12px 0' }}>
              Evaluate statutory interpretation, constitutional doctrines, case precedents, and verbal argument coherence in mock courtroom scenarios.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Best for: Law moot courts, bar viva examinations &amp; associate screening
            </div>
          </div>

          {/* Corporate & Sales */}
          <div className="panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <TrendingUp size={18} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Business &amp; Sales</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 12px 0' }}>
              Put candidates through live objection role-plays against enterprise buyer personas with multi-turn pricing and competitive pushbacks.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Best for: Enterprise BDA screening, sales training &amp; MBA consulting cases
            </div>
          </div>

          {/* Engineering & STEM */}
          <div className="panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Code2 size={18} strokeWidth={1.5} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Engineering &amp; STEM</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 12px 0' }}>
              Verify true coding comprehension. Students write Python, C, C++, or Java and orally defend Big-O complexity over live WebRTC.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Best for: CS practical lab vivas, SDE hiring &amp; capstone defenses
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-STEP HOW IT WORKS ── */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Universal 3-step assessment workflow
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            {
              icon: FileCheck2,
              step: '1. Set rubrics or drop any JD / syllabus',
              desc: 'Select a template for Medicine, Law, Business, Sales, or STEM — or drop your own PDF syllabus / job description to extract evaluation keyterms.',
            },
            {
              icon: Mic,
              step: '2. Live speech viva & defense over WebRTC',
              desc: 'The student or candidate claims their tokenized single-claimer link and completes the multi-turn oral interview in their preferred language.',
            },
            {
              icon: ShieldCheck,
              step: '3. Human-reviewed 6-axis report',
              desc: 'Review automated scoring across Domain Knowledge, Articulation, Composure, Analytical Depth, and Thoroughness, with print-ready PDF export.',
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon size={16} strokeWidth={1.5} color="var(--primary)" />
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

      {/* ── BOTTOM CTA BANNER ── */}
      <div
        className="panel"
        style={{
          padding: '36px',
          textAlign: 'center',
          backgroundColor: 'var(--surface-subtle)',
          border: '1px solid var(--border-strong)',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          Experience {PLATFORM_NAME} for your discipline
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 20px auto', fontSize: '14px', lineHeight: 1.55 }}>
          Preview faculty, recruiter, student, or candidate workflows immediately in guest mode, or sign in to generate tokenized links with custom syllabi and rubrics.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(token ? '/dashboard' : '/login')}
            style={{ padding: '10px 22px', fontSize: '14px' }}
          >
            {token ? 'Open dashboard' : 'Get started with Google'} <ArrowRight size={16} strokeWidth={1.5} />
          </button>
          {!token && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                sessionStorage.setItem('intervai_guest_mode', 'true');
                navigate('/select-role');
              }}
              style={{ padding: '10px 22px', fontSize: '14px' }}
            >
              <Eye size={16} strokeWidth={1.5} /> Explore in guest mode
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
