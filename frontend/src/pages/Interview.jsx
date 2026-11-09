import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  LiveKitRoom, 
  RoomAudioRenderer,
  BarVisualizer,
  ControlBar,
  useVoiceAssistant,
  useConnectionState,
  useRoomContext,
  useLocalParticipant
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Activity, Shield, TerminalSquare, CheckCircle2, Clock, Sparkles, Radio, Play, Check, Code2, Briefcase, Globe } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import AnimatedOrb from '../components/ui/AnimatedOrb'
import Confetti from '../components/ui/Confetti'
import { PLATFORM_NAME } from '../brand'

export default function Interview() {
  const [token, setToken] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [sessionTrack, setSessionTrack] = useState('tech')
  const [sessionLang, setSessionLang] = useState('hinglish')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token: jwtToken, user, isSuperAdmin } = useContext(AuthContext)
  
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [completedGuest, setCompletedGuest] = useState(false)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false)
  const [liveTelemetry, setLiveTelemetry] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0')
    const s = String(sec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const roomName = `interview-${user?.username || 'guest'}`
        const identity = `Candidate_${Math.floor(Math.random() * 10000)}`
        const language = searchParams.get('lang') || localStorage.getItem('intervai_lang') || 'hinglish'
        const track = searchParams.get('track') || localStorage.getItem('intervai_track') || 'tech'
        const sessionId = searchParams.get('session') || localStorage.getItem('intervai_session') || ''
        const sessionSecret = searchParams.get('secret') || localStorage.getItem('intervai_session_secret') || ''

        if (!sessionId) {
          throw new Error('No active interview session found. Please initialize a session first.')
        }

        setSessionTrack(track)
        setSessionLang(language)
        
        const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
        const query = new URLSearchParams({
          room: roomName,
          identity,
          language,
          track,
          session_id: sessionId,
          session_secret: sessionSecret,
        })
        const headers = {}
        if (jwtToken) {
          headers['Authorization'] = `Bearer ${jwtToken}`
        }
        const res = await fetch(`${baseUrl}/api/token?${query.toString()}`, { headers })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.detail || "Failed to retrieve token")
        
        setToken(data.token)
        setUrl(data.url)
        if (data.track) setSessionTrack(data.track)
        if (data.language) setSessionLang(data.language)
        if (data.keywords_count) setKeywordsCount(data.keywords_count)
      } catch (err) {
        setError(err.message)
      }
    }
    
    fetchToken()
  }, [])

  useEffect(() => {
    if (isInterviewCompleted) {
      const timer = setTimeout(() => {
        if (jwtToken) {
          navigate('/dashboard')
        } else {
          setCompletedGuest(true)
        }
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [isInterviewCompleted, jwtToken, navigate])

  if (completedGuest) {
    return (
      <div className="setup-layout">
        <Confetti active={true} />
        <div className="pn-card pn-card-elevated text-center animate-in" style={{ maxWidth: '490px', padding: '2.75rem', borderRadius: '24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(22, 219, 147, 0.14)',
              border: '1px solid rgba(22, 219, 147, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle2 size={36} color="var(--success)" />
          </div>
          <h2 className="brand-font" style={{ color: 'var(--text-main)', marginBottom: '0.6rem', fontSize: '1.85rem', fontWeight: 800 }}>
            Assessment Completed!
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.75rem', fontSize: '0.94rem' }}>
            Thank you for completing your voice assessment on {PLATFORM_NAME}. Your evaluation has been saved and shared with your assessor.
          </p>
          <button className="pn-btn pn-btn-primary" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="setup-layout">
        <div className="pn-card pn-card-elevated text-center animate-in" style={{ maxWidth: '480px', padding: '2.5rem', borderRadius: '24px' }}>
          <h2 className="brand-font" style={{ color: 'var(--error)', marginBottom: '0.6rem' }}>Connection Error</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button className="pn-btn pn-btn-outline" onClick={() => navigate('/setup')} style={{ marginTop: '1.5rem' }}>
            Return to Setup
          </button>
        </div>
      </div>
    )
  }

  if (!token || !url) {
    return (
      <div className="setup-layout">
        <div className="text-center animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <AnimatedOrb state="thinking" size={140} />
          <h3 className="brand-font" style={{ fontSize: '1.4rem', margin: '0.5rem 0 0 0' }}>Establishing Secure WebRTC Studio...</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Negotiating Gnani Prisma v3.0 &amp; Timbre v2.5 voice channels</p>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect={true}
      audio={{
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }}
      video={false}
      className="interview-container animate-in"
      onDisconnected={() => {
        if (jwtToken) {
          navigate('/dashboard')
        } else {
          setCompletedGuest(true)
        }
      }}
    >
      <RoomAudioRenderer />
      <RoomEventListener
        onOpenEditor={() => setIsCodeEditorOpen(true)}
        onCloseEditor={() => setIsCodeEditorOpen(false)}
        onInterviewCompleted={() => setIsInterviewCompleted(true)}
        onTelemetry={setLiveTelemetry}
      />

      {/* Super Admin Live Latency HUD Overlay */}
      {isSuperAdmin && liveTelemetry && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: '18px',
            right: '18px',
            background: 'rgba(10, 10, 18, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(124, 92, 255, 0.45)',
            borderRadius: '16px',
            padding: '0.9rem 1.2rem',
            zIndex: 999,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            color: '#fff',
            minWidth: '335px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.45rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="var(--primary)" /> Super Admin Latency HUD (Turn #{liveTelemetry.turn})
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
              LIVE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', padding: '0.45rem 0.3rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>STT</div>
              <div className="mono-font" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{liveTelemetry.stt_ms}<span style={{ fontSize: '0.62rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', padding: '0.45rem 0.3rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>LLM</div>
              <div className="mono-font" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{liveTelemetry.llm_ms}<span style={{ fontSize: '0.62rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', padding: '0.45rem 0.3rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>TTS</div>
              <div className="mono-font" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{liveTelemetry.tts_ms}<span style={{ fontSize: '0.62rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', padding: '0.45rem 0.3rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>E2E</div>
              <div className="mono-font" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
                {(liveTelemetry.total_e2e_ms / 1000).toFixed(2)}<span style={{ fontSize: '0.62rem' }}>s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Disconnect Completion Overlay */}
      {isInterviewCompleted && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 18, 0.94)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <Confetti active={true} />
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={36} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: '1.85rem', color: '#FFFFFF', marginBottom: '0.45rem', fontWeight: 700 }}>
            Interview Completed
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your assessment has concluded and your structured evaluation report has been submitted.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 500,
              border: '1px solid var(--border)',
            }}
          >
            <Clock size={14} color="var(--primary)" /> Leaving room in 2s...
          </div>
          <button
            className="pn-btn pn-btn-primary"
            style={{ marginTop: '1.25rem', fontSize: '0.92rem', padding: '0.65rem 1.5rem' }}
            onClick={() => {
              if (jwtToken) {
                navigate('/dashboard')
              } else {
                setCompletedGuest(true)
              }
            }}
          >
            {jwtToken ? 'Go to Dashboard' : 'Finish & Return Home'}
          </button>
        </div>
      )}

      <div className={`interview-split ${isCodeEditorOpen ? 'split-active' : ''}`}>
        {/* Interview Panel — full width by default, 50% when code editor opens */}
        <div className="interview-panel">
          <div className="interview-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <ConnectionStatus />
              <div
                className="mono-font"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                }}
              >
                <Clock size={12} color="var(--primary)" /> {formatTimer(elapsedSeconds)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Shield size={13} color="var(--secondary)" /> E2E Encrypted
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.22rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
              }}>
                {sessionTrack === 'tech' ? <Code2 size={13} color="var(--primary)" /> : <Briefcase size={13} color="var(--primary)" />}
                <span>{sessionTrack === 'tech' ? 'Tech Viva' : 'BDA Role-Play'}</span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.22rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                <Globe size={13} /> {sessionLang.toUpperCase()}
              </div>
              {keywordsCount > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                }}>
                  <Sparkles size={11} /> {keywordsCount} Keyterms
                </div>
              )}
            </div>
            {isCodeEditorOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-soft)', border: '1px solid rgba(37, 99, 235, 0.3)', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                <TerminalSquare size={14} />
                Live IDE Active
              </div>
            )}
          </div>

          <div className="interview-visualizer">
            <AgentVisualizer />
          </div>

          <div className="interview-controls">
            <ControlBar
              controls={{ microphone: true, camera: false, screenShare: false }}
            />
          </div>
        </div>

        {/* Code Editor Panel — slides in as the right 50% */}
        {isCodeEditorOpen && (
          <div className="code-panel">
            <CodeEditor />
          </div>
        )}
      </div>
    </LiveKitRoom>
  )
}

function ConnectionStatus() {
  const state = useConnectionState()
  const isConnected = state === 'connected'
  
  return (
    <div className="status-badge" style={{ 
      color: isConnected ? 'var(--secondary)' : 'var(--error)',
      background: isConnected ? 'rgba(34, 211, 182, 0.12)' : 'rgba(255, 92, 124, 0.12)',
      borderColor: isConnected ? 'rgba(34, 211, 182, 0.3)' : 'rgba(255, 92, 124, 0.3)'
    }}>
      <div style={{ 
        width: '8px', height: '8px', borderRadius: '50%', 
        background: isConnected ? 'var(--secondary)' : 'var(--error)',
        boxShadow: `0 0 10px ${isConnected ? 'var(--secondary)' : 'var(--error)'}`
      }}></div>
      {isConnected ? 'Connected' : 'Connecting...'}
    </div>
  )
}

function AgentVisualizer() {
  const { state, audioTrack } = useVoiceAssistant()
  
  let statusText = "Listening — Speak Naturally..."
  let statusColor = 'var(--secondary)'
  if (state === 'speaking') {
    statusText = "AI Interviewer Speaking..."
    statusColor = 'var(--primary)'
  } else if (state === 'thinking') {
    statusText = "Synthesizing Response..."
    statusColor = 'var(--pn-saffron)'
  } else if (state === 'disconnected') {
    statusText = "Agent Offline"
    statusColor = 'var(--text-muted)'
  }

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedOrb state={state || 'listening'} size={210} showLabel={false} />
        {audioTrack ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <BarVisualizer 
              trackRef={audioTrack}
              barCount={5}
              options={{ minHeight: 10 }}
              style={{ width: '80px', height: '56px', color: 'white' }}
            />
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: '2.2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.9rem',
            borderRadius: '999px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            marginBottom: '0.6rem',
          }}
        >
          <Radio size={13} color={statusColor} />
          <span className="mono-font" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusColor }}>
            {state || 'ready'}
          </span>
        </div>
        <h2 className="brand-font" style={{ fontSize: '1.45rem', marginBottom: '0.35rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 800 }}>
          {PLATFORM_NAME} Voice Core
        </h2>
        <p style={{ color: statusColor, fontWeight: 600, fontSize: '0.94rem', transition: 'color 0.3s', margin: 0 }}>
          {statusText}
        </p>
      </div>
    </div>
  )
}

function RoomEventListener({ onOpenEditor, onCloseEditor, onInterviewCompleted, onTelemetry }) {
  const room = useRoomContext();
  
  useEffect(() => {
    if (!room) return;
    const handleData = (data) => {
      try {
        const payload = JSON.parse(new TextDecoder().decode(data));
        if (payload.type === 'enable_code_editor') {
          onOpenEditor();
        } else if (payload.type === 'disable_code_editor') {
          onCloseEditor();
        } else if (payload.type === 'latency_telemetry') {
          if (onTelemetry) onTelemetry(payload.data);
        } else if (payload.type === 'interview_completed') {
          if (onInterviewCompleted) onInterviewCompleted();
          setTimeout(() => {
            try {
              room.disconnect();
            } catch (err) {
              console.error('Room disconnect error:', err);
            }
          }, 2500);
        }
      } catch (e) {}
    };
    room.on('dataReceived', handleData);
    return () => room.off('dataReceived', handleData);
  }, [room, onOpenEditor, onCloseEditor, onInterviewCompleted, onTelemetry]);

  return null;
}

const CODE_LANGUAGES = {
  py: {
    id: 'py',
    label: 'Python (3.x)',
    shortLabel: 'Python 3',
    filename: 'workspace.py',
    template: `# Write your Python solution here\ndef solution():\n    pass\n`,
  },
  c: {
    id: 'c',
    label: 'C (C11)',
    shortLabel: 'C (C11)',
    filename: 'workspace.c',
    template: `// Write your C solution here\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (17/20)',
    shortLabel: 'C++',
    filename: 'workspace.cpp',
    template: `// Write your C++ solution here\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n`,
  },
  java: {
    id: 'java',
    label: 'Java',
    shortLabel: 'Java',
    filename: 'Solution.java',
    template: `// Write your Java solution here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n`,
  },
};

function CodeEditor() {
  const [selectedLang, setSelectedLang] = useState('py');
  const [code, setCode] = useState(CODE_LANGUAGES.py.template);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { localParticipant } = useLocalParticipant();

  const handleLangChange = (newLangId) => {
    setSelectedLang(newLangId);
    const isDefaultTemplate = !code.trim() || Object.values(CODE_LANGUAGES).some((l) => l.template.trim() === code.trim());
    if (isDefaultTemplate) {
      setCode(CODE_LANGUAGES[newLangId].template);
    }
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    
    try {
      const payload = JSON.stringify({
        type: 'code_submission',
        code,
        language: selectedLang,
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      
      if (localParticipant) {
        await localParticipant.publishData(data, { topic: 'code_submission' });
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit code:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLangConfig = CODE_LANGUAGES[selectedLang] || CODE_LANGUAGES.py;
  const lineCount = Math.max(12, code.split('\n').length);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      background: '#0A0A12',
      overflow: 'hidden',
    }}>
      {/* VS Code Studio Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0.7rem 1.1rem', 
        background: '#11111E',
        borderBottom: '1px solid rgba(124, 92, 255, 0.2)',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#FF5C7C' }}></div>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#FFBE3D' }}></div>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#16DB93' }}></div>
          </div>
          <div
            className="mono-font"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#F5F5FA',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.25rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(124, 92, 255, 0.14)',
              border: '1px solid rgba(124, 92, 255, 0.28)',
            }}
          >
            <TerminalSquare size={13} color="#7C5CFF" />
            <span>{currentLangConfig.filename}</span>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.74rem', color: '#9896B0' }}>Runtime:</span>
          <select
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value)}
            style={{
              width: 'auto',
              background: '#181828',
              border: '1px solid rgba(124, 92, 255, 0.3)',
              color: '#F5F5FA',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.3rem 0.7rem',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="py">🐍 Python (3.x)</option>
            <option value="c">⚙️ C (C11)</option>
            <option value="cpp">⚡ C++ (17/20)</option>
            <option value="java">☕ Java</option>
          </select>
        </div>
      </div>

      {/* Editor Area with Line Numbers */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        <div
          className="mono-font"
          style={{
            padding: '1.25rem 0.65rem 1.25rem 0.85rem',
            background: '#0D0D18',
            color: '#4E4C67',
            fontSize: '0.84rem',
            lineHeight: '1.6',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => { setCode(e.target.value); setIsSubmitted(false); }}
          placeholder={`// Write your ${currentLangConfig.shortLabel} solution here...`}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '1.25rem',
            background: 'transparent',
            color: '#E6EDF3',
            border: 'none',
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            fontSize: '0.88rem',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            tabSize: 4,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const target = e.target;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              setCode(code.substring(0, start) + '    ' + code.substring(end));
              setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 4;
              }, 0);
            }
          }}
        />
      </div>

      {/* Footer / Actions */}
      <div style={{ 
        padding: '0.8rem 1.1rem', 
        background: '#11111E', 
        borderTop: '1px solid rgba(124, 92, 255, 0.2)',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span className="mono-font" style={{ fontSize: '0.76rem', color: '#9896B0' }}>
          {currentLangConfig.label} • UTF-8 • LiveKit DataChannel
        </span>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || isSubmitted || !code.trim()}
          style={{ 
            padding: '0.6rem 1.3rem', 
            fontSize: '0.88rem',
            fontWeight: 700,
            background: (isSubmitting || isSubmitted)
              ? 'rgba(34, 211, 182, 0.15)'
              : 'linear-gradient(135deg, #7C5CFF 0%, #22D3B6 100%)',
            color: (isSubmitting || isSubmitted) ? '#22D3B6' : 'white',
            border: (isSubmitting || isSubmitted) ? '1px solid rgba(34, 211, 182, 0.4)' : 'none',
            borderRadius: '10px',
            cursor: (isSubmitting || !code.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: (isSubmitting || isSubmitted || !code.trim()) ? 'none' : '0 8px 24px -6px rgba(124, 92, 255, 0.55)',
          }}
        >
          {isSubmitting ? 'Evaluating...' : isSubmitted ? <><Check size={15} /> Submitted — Defend Aloud</> : <><Play size={14} /> Run &amp; Submit to AI</>}
        </button>
      </div>
    </div>
  );
}
