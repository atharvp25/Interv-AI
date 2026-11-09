import React from 'react'
import { PLATFORM_NAME } from '../brand'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="pn-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ margin: 0, fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} {PLATFORM_NAME}. Built with Gnani Prisma v3.0 STT + Timbre v2.5 TTS &amp; LiveKit WebRTC.
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem' }}>
          <span>⚡ Sub-1.2s Voice Latency</span>
          <span>•</span>
          <span>🌐 11 Indian Languages</span>
          <span>•</span>
          <span>🛡️ Single-Claimer Security</span>
        </div>
      </div>
    </footer>
  )
}
