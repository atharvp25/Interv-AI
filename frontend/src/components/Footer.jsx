import React from 'react'
import { PLATFORM_NAME } from '../brand'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="pn-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
          &copy; {new Date().getFullYear()} {PLATFORM_NAME}. Structured voice assessments &amp; oral vivas.
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Gnani Prisma STT &amp; Timbre TTS</span>
          <span>·</span>
          <span>11 Indian languages</span>
          <span>·</span>
          <span>Human-reviewed evaluations</span>
        </div>
      </div>
    </footer>
  )
}
