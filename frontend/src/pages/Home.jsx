import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  Mic2,
  ShieldCheck,
  ArrowRight,
  Eye,
  Zap,
  Globe2,
  TerminalSquare,
  GraduationCap,
  Briefcase,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import AnimatedOrb from '../components/ui/AnimatedOrb'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import CountUp from '../components/ui/CountUp'
import { PLATFORM_NAME } from '../brand'

const LANGUAGES = [
  'Hinglish (Hindi + English)',
  'हिन्दी • Hindi',
  'मराठी • Marathi',
  'தமிழ் • Tamil',
  'తెలుగు • Telugu',
  'ಕನ್ನಡ • Kannada',
  'বাংলা • Bengali',
  'ગુજરાતી • Gujarati',
  'ਪੰਜਾਬੀ • Punjabi',
  'മലയാളം • Malayalam',
  'Indian English',
]

const BENTO_FEATURES = [
  {
    icon: BrainCircuit,
    tone: 'primary',
    badge: 'Anti-Cheat Engine',
    title: 'Anti-Cheat Oral Viva & Coding',
    desc: 'Students write Python, C, C++, or Java in a live split-screen editor and defend their time & space complexity aloud in English or Hinglish.',
    span: 7,
  },
  {
    icon: Mic2,
    tone: 'secondary',
    badge: 'Sub-1.2s Turnaround',
    title: 'Gnani Prisma v3.0 + Timbre TTS',
    desc: 'Code-mixed Indic ASR with automatic JD keyterm boosting and natural Indian female voice synthesis over persistent WebSockets.',
    span: 5,
  },
  {
    icon: ShieldCheck,
    tone: 'primary',
    badge: 'Single-Claimer Links',
    title: 'Role-Based Access & Token Links',
    desc: 'Dedicated workflows for Teachers, Recruiters, Students, and Candidates with single-claimer encrypted assessment links.',
    span: 5,
  },
  {
    icon: TerminalSquare,
    tone: 'secondary',
    badge: '4 Languages',
    title: 'Live Compiler Diagnostics',
    desc: 'Real-time syntax, boundary, and Big-O verification across Python 3, C11, C++20, and Java with up to 3 guided compiler attempts.',
    span: 7,
  },
  {
    icon: Briefcase,
    tone: 'primary',
    badge: 'Enterprise Hiring',
    title: 'BDA Sales & Objection Role-Play',
    desc: 'AI acts as a realistic enterprise CXO pushing back on budget freezes and incumbent competitors in regional Indian languages.',
    span: 6,
  },
  {
    icon: GraduationCap,
    tone: 'secondary',
    badge: 'University Labs',
    title: 'Instant 5-Axis Radar Scorecards',
    desc: 'Automated grading across Technical Accuracy, Communication, Confidence, Depth, and Completeness with 1-click PDF export.',
    span: 6,
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Configure Role or Lab Viva in 30s',
    desc: 'Pick a 1-click SDE, BDA Sales, or CS301 Viva preset—or drop a PDF/DOCX JD. Select from 11 Indian languages and set link expiry.',
  },
  {
    step: '02',
    title: 'Share Single-Claimer Tokenized Link',
    desc: 'Candidates or students claim the link with verified identity. The room locks to their session secret to prevent impersonation.',
  },
  {
    step: '03',
    title: 'Live Voice + Code Defense & Instant Report',
    desc: 'Our AI interviewer conducts the oral viva, opens the live code editor automatically, and delivers a radar scorecard on completion.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { token, startGuestMode } = useContext(AuthContext)
  const [orbState, setOrbState] = useState('speaking')

  useEffect(() => {
    const states = ['speaking', 'listening', 'thinking']
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % states.length
      setOrbState(states[i])
    }, 3200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pn-container" style={{ paddingTop: '3.2rem', paddingBottom: '5rem' }}>
      {/* ── HERO SECTION ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          marginBottom: '4rem',
        }}
      >
        {/* Left Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="pn-eyebrow" style={{ marginBottom: '1.5rem' }}>
            <Sparkles size={14} />
            Gnani Prisma v3.0 STT + Timbre v2.5 TTS • 10+ Indian Languages
          </span>

          <h1
            className="pn-display"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.1rem)',
              marginBottom: '1.25rem',
              letterSpacing: '-0.035em',
            }}
          >
            Multilingual Voice Viva &amp; <br />
            <span className="pn-gradient-text">AI Role-Play Screening.</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.68,
              marginBottom: '2.1rem',
              maxWidth: '580px',
            }}
          >
            Built for both <strong>Education</strong> (Teachers conducting live Python coding &amp; oral defense vivas) and{' '}
            <strong>Hiring</strong> (Recruiters running BDA sales &amp; technical screenings in Hinglish, Hindi, Marathi, and 8 more Indic languages).
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              size="lg"
              onClick={() => navigate(token ? '/dashboard' : '/login')}
              iconRight={<ArrowRight size={17} />}
            >
              {token ? 'Go to Dashboard' : 'Get Started with Google'}
            </Button>

            {!token && (
              <Button
                variant="secondary"
                size="lg"
                onClick={startGuestMode}
                icon={<Eye size={17} />}
              >
                Explore in Guest Mode
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '2rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--primary)" /> Sub-1.2s Voice Latency
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--primary)" /> Python • C • C++ • Java Editor
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--primary)" /> Zero Setup Required
            </span>
          </div>
        </motion.div>

        {/* Right Interactive Studio Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: 380 }}
        >
          <AnimatedOrb state={orbState} size={270} />

          {/* Floating Code Card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="pn-card"
            style={{
              position: 'absolute',
              top: '4%',
              left: '2%',
              padding: '10px 14px',
              borderRadius: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              maxWidth: 215,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--secondary)', fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--secondary)' }} />
              workspace.py • O(N)
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: '#c084fc' }}>def</span> <span style={{ color: '#60a5fa' }}>two_sum</span>(nums, k):
            </div>
          </motion.div>

          {/* Floating Language Chip */}
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="pn-card"
            style={{
              position: 'absolute',
              bottom: '8%',
              left: '4%',
              padding: '9px 14px',
              borderRadius: 999,
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Globe2 size={14} color="var(--accent)" />
            <span>Hinglish • मराठी • हिन्दी • தமிழ்</span>
          </motion.div>

          {/* Floating Latency Pill */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="pn-card"
            style={{
              position: 'absolute',
              top: '12%',
              right: '2%',
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--success)',
            }}
          >
            <Zap size={14} /> 940ms Turnaround
          </motion.div>
        </motion.div>
      </div>

      {/* ── LANGUAGE MARQUEE ── */}
      <div className="pn-marquee" style={{ margin: '2rem 0 4rem 0', padding: '0.85rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="pn-marquee-track">
          {[...LANGUAGES, ...LANGUAGES].map((lang, idx) => (
            <span
              key={idx}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              🗣️ {lang}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '4.5rem',
        }}
      >
        {[
          { value: 1.1, decimals: 1, suffix: 's', label: 'Avg Voice Turnaround', sub: 'Groq LPU + Gnani WebSocket' },
          { value: 11, decimals: 0, suffix: '+', label: 'Indian Languages', sub: 'Native code-mixed Hinglish & Indic' },
          { value: 4, decimals: 0, suffix: '', label: 'Role Tailored Views', sub: 'Teacher • Recruiter • Student • Candidate' },
          { value: 100, decimals: 0, suffix: '%', label: 'Single-Claimer Lock', sub: 'Anti-impersonation token security' },
        ].map((st, idx) => (
          <Card key={idx} padding={22} tilt>
            <div className="pn-display" style={{ fontSize: '2.3rem', color: 'var(--primary)', marginBottom: 4 }}>
              <CountUp value={st.value} decimals={st.decimals} suffix={st.suffix} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 2 }}>{st.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── FEATURE BENTO GRID ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Badge tone="primary" style={{ marginBottom: 10 }}>
          Enterprise &amp; University Grade
        </Badge>
        <h2 className="pn-display" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)' }}>
          Engineered for Real-Time Oral Defense &amp; Screening
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.25rem',
          marginBottom: '4.5rem',
        }}
      >
        {BENTO_FEATURES.map((f, idx) => {
          const Icon = f.icon
          return (
            <Card
              key={idx}
              padding={24}
              style={{
                gridColumn: `span ${f.span}`,
              }}
              className="bento-col"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon size={20} />
                </div>
                <Badge tone={f.tone}>{f.badge}</Badge>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
            </Card>
          )
        })}
      </div>

      {/* ── 3-STEP HOW IT WORKS TIMELINE ── */}
      <div style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <Badge tone="secondary" style={{ marginBottom: 10 }}>
            3-Step Workflow
          </Badge>
          <h2 className="pn-display" style={{ fontSize: 'clamp(1.65rem, 3vw, 2.35rem)' }}>
            From Job Description or Lab Sheet to Graded Report
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {STEPS.map((s, idx) => (
            <Card key={idx} padding={24}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                }}
              >
                STEP {s.step}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA BANNER ── */}
      <Card
        padding={36}
        style={{
          textAlign: 'center',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border)',
        }}
      >
        <h2 className="pn-display" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', marginBottom: 10 }}>
          Experience {PLATFORM_NAME} Live
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 1.5rem auto', lineHeight: 1.6, fontSize: '0.92rem' }}>
          Preview Teacher, Recruiter, Student, or Candidate workflows immediately in Guest Mode, or sign in with Google to create live tokenized links.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate(token ? '/dashboard' : '/login')} iconRight={<ArrowRight size={17} />}>
            {token ? 'Open Dashboard' : 'Get Started with Google'}
          </Button>
          {!token && (
            <Button variant="secondary" size="lg" onClick={startGuestMode} icon={<Eye size={17} />}>
              Launch Guest Mode
            </Button>
          )}
        </div>
      </Card>

      <style>{`
        @media (max-width: 860px) {
          .bento-col { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  )
}
