import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const AXES = [
  ['technical_accuracy', 'Technical'],
  ['communication', 'Communication'],
  ['confidence', 'Confidence'],
  ['depth', 'Depth'],
  ['completeness', 'Completeness'],
]

function ScoreRadar({ scores = {}, size = 240, max = 10 }) {
  const c = size / 2
  const R = size * 0.34
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]
  }
  const poly = useMemo(
    () => AXES.map(([k], i) => pt(i, Math.min(1, (Number(scores[k]) || 0) / max)).join(',')).join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scores, max, size]
  )

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size }} role="img" aria-label="Score radar chart">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--secondary)" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((lv) => (
        <polygon key={lv} points={AXES.map((_, i) => pt(i, lv).join(',')).join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(i, 1)
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      <motion.polygon
        points={poly}
        fill="url(#radarFill)"
        stroke="var(--primary)"
        strokeWidth="1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: `${c}px ${c}px` }}
      />
      {AXES.map(([k, label], i) => {
        const [x, y] = pt(i, 1.2)
        return (
          <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)">
            {label} <tspan fill="var(--text-main)" fontWeight="700">{scores[k] ?? '–'}</tspan>
          </text>
        )
      })}
    </svg>
  )
}

export const ScoreDonut = memo(function ScoreDonut({ score, value = 0, max = 10, size = 110, label = 'Score' }) {
  const actualVal = score !== undefined ? score : value
  const r = size / 2 - 10
  const C = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, actualVal / max))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${actualVal} of ${max}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-surface-2)" strokeWidth="8" fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        stroke="var(--primary)" strokeDasharray={C}
        initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="48%" textAnchor="middle" fontSize={size * 0.24} fontWeight="700" fill="var(--text-main)" fontFamily="var(--font-sans)">{actualVal}</text>
      <text x="50%" y="68%" textAnchor="middle" fontSize={size * 0.11} fontWeight="500" fill="var(--text-muted)">{label}</text>
    </svg>
  )
})

export const Sparkline = memo(function Sparkline({ data = [], values = [], color = 'var(--primary)', width = 110, height = 32 }) {
  const ptsData = data.length ? data : values
  if (!ptsData.length) return null
  const mx = Math.max(...ptsData, 1)
  const pts = ptsData.map((v, i) => `${(i / Math.max(1, ptsData.length - 1)) * width},${height - (v / mx) * (height - 6) - 3}`).join(' ')
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})

export default memo(ScoreRadar)
