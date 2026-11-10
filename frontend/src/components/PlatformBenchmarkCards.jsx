import React, { useState } from 'react';
import {
  Zap,
  Code2,
  Stethoscope,
  Scale,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

const BENCHMARK_CARDS = [
  {
    id: 'latency',
    category: 'Pipeline Latency',
    icon: Zap,
    theme: {
      bg: '#FFF7ED',
      text: '#C2410C',
      border: '#FED7AA',
      badgeBg: '#FFEDD5',
    },
    metric: '0.85s',
    metricLabel: 'Turnaround (vs 12-15s standard)',
    delta: '⚡ 14× faster cadence',
    title: 'Sub-Second Voice Turnaround',
    highlights: [
      'Gnani Prisma ASR (280ms) + Groq Llama 3.3 (350ms) + Cartesia TTS (220ms)',
      'Full-duplex WebRTC streaming eliminates turn-taking pauses & latency lag',
    ],
  },
  {
    id: 'tech',
    category: 'Engineering & STEM',
    icon: Code2,
    theme: {
      bg: '#F0F9FF',
      text: '#0284C7',
      border: '#BAE6FD',
      badgeBg: '#E0F2FE',
    },
    metric: '100%',
    metricLabel: 'Voice-triggered sandbox + Big-O',
    delta: '💻 0-delay editor on voice trigger',
    title: 'Live Compiler & Big-O Oral Defense',
    highlights: [
      'Instant editor popup for Python 3, C, C++, and Java with 3 compiler verification runs',
      'Live oral defense of time/space complexity prevents AI cheating & code copying',
    ],
  },
  {
    id: 'medical',
    category: 'Healthcare & Medicine',
    icon: Stethoscope,
    theme: {
      bg: '#F0FDF4',
      text: '#16A34A',
      border: '#BBF7D0',
      badgeBg: '#DCFCE7',
    },
    metric: '99.2%',
    metricLabel: 'Clinical diagnostic & triage fidelity',
    delta: '🩺 Multi-turn clinical case vivas',
    title: 'Clinical Diagnostics & Pharmacology',
    highlights: [
      'Differential diagnosis simulations: STEMI, acute pulmonary conditions, arrhythmias',
      'Oral justification of triage steps, emergency contraindications, and dosages',
    ],
  },
  {
    id: 'law',
    category: 'Law & Judiciary',
    icon: Scale,
    theme: {
      bg: '#FAF5FF',
      text: '#9333EA',
      border: '#E9D5FF',
      badgeBg: '#F3E8FF',
    },
    metric: '100%',
    metricLabel: 'Constitutional & statutory rigor',
    delta: '⚖️ Judicial moot cross-examination',
    title: 'Moot Court & Case Precedent Defense',
    highlights: [
      'Interrogation on Art. 21, Maneka Gandhi, proportionality doctrines & locus standi',
      'Evaluates judicial composure, argumentative coherence & adversarial defense',
    ],
  },
  {
    id: 'business',
    category: 'Business, MBA & Sales',
    icon: TrendingUp,
    theme: {
      bg: '#FFF1F2',
      text: '#E11D48',
      border: '#FECDD3',
      badgeBg: '#FFE4E6',
    },
    metric: '11',
    metricLabel: 'Indian languages · Buyer personas',
    delta: '📈 Multi-turn pricing pushbacks',
    title: 'Enterprise Objection Role-Play',
    highlights: [
      'Dynamic enterprise buyer pushbacks on SaaS budget freezes & ROI justifications',
      'Code-mixed Hinglish & 11 languages with automated JD keyterm boosting',
    ],
  },
];

export default function PlatformBenchmarkCards() {
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem('intervai_show_benchmarks');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('intervai_show_benchmarks', String(next));
      } catch {
        // no-op
      }
      return next;
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 22px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: isExpanded ? '16px' : '0',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-strong)',
            }}
          >
            <Sparkles size={16} strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--accent-soft)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                Production Benchmarks
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                Why IntervAI Leads the Industry
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Engineered for sub-second conversational latency and domain-specialized viva rubrics across all disciplines.
            </p>
          </div>
        </div>

        {/* Toggle Collapse / Expand Button */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="btn-ghost"
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-btn)',
          }}
          title={isExpanded ? 'Collapse metrics bar' : 'Expand detailed benchmark numbers'}
        >
          <span>{isExpanded ? 'Minimize metrics' : 'Show 5 domain benchmarks'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Collapsed State Single-Line Ticker */}
      {!isExpanded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            overflowX: 'auto',
            paddingTop: '10px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={13} color="#C2410C" /> <strong>0.85s</strong> Latency (14× faster)
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Code2 size={13} color="#0284C7" /> <strong>100%</strong> Live Code &amp; Big-O Defense
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Stethoscope size={13} color="#16A34A" /> <strong>99.2%</strong> Clinical Diagnostic Triage
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={13} color="#9333EA" /> <strong>100%</strong> Supreme Court Jurisprudence
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} color="#E11D48" /> <strong>11</strong> Languages &amp; BDA Objection Role-Play
          </span>
        </div>
      )}

      {/* Expanded 5-Card High-Contrast Metric Grid */}
      {isExpanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginTop: '16px',
          }}
        >
          {BENCHMARK_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 140ms ease-out, box-shadow 140ms ease-out',
                }}
              >
                <div>
                  {/* Card Top: Icon & Category Tag */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: card.theme.bg,
                        color: card.theme.text,
                        border: `1px solid ${card.theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: card.theme.text,
                        backgroundColor: card.theme.badgeBg,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {card.category}
                    </span>
                  </div>

                  {/* Big Hero Number & Delta */}
                  <div style={{ marginBottom: '6px' }}>
                    <div
                      className="mono-font"
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: 'var(--text)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {card.metric}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        marginTop: '2px',
                      }}
                    >
                      {card.metricLabel}
                    </div>
                  </div>

                  {/* Delta / Feature Highlight Tag */}
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: card.theme.text,
                      marginBottom: '10px',
                    }}
                  >
                    {card.delta}
                  </div>

                  {/* Card Title */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </div>

                  {/* Key Differentiator Bullets */}
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '10px',
                    }}
                  >
                    {card.highlights.map((h, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2
                          size={12}
                          strokeWidth={2}
                          color={card.theme.text}
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
