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
import { Activity, Shield, TerminalSquare, CheckCircle2, Clock } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Interview() {
  const [token, setToken] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [sessionTrack, setSessionTrack] = useState('tech')
  const [sessionLang, setSessionLang] = useState('hinglish')
  const [keywordsCount, setKeywordsCount] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token: jwtToken, user, isSuperAdmin } = useContext(AuthContext)
  
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [completedGuest, setCompletedGuest] = useState(false)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false)
  const [liveTelemetry, setLiveTelemetry] = useState(null)

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
        <div className="glass-panel text-center animate-in" style={{ maxWidth: '480px', padding: '2.5rem' }}>
          <h2 className="brand-font" style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>
            Assessment Completed!
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Thank you for completing your voice assessment. Your evaluation has been saved and shared with your assessor.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="setup-layout">
        <div className="glass-panel text-center animate-in">
          <h2 style={{ color: 'var(--error)' }}>Connection Error</h2>
          <p>{error}</p>
          <button className="btn-secondary" onClick={() => navigate('/setup')} style={{ marginTop: '1.5rem' }}>
            Return to Setup
          </button>
        </div>
      </div>
    )
  }

  if (!token || !url) {
    return (
      <div className="setup-layout">
        <div className="text-center animate-in">
          <Activity size={48} className="dz-icon-lg" style={{ animation: 'pulse-glow 1.5s infinite' }} />
          <h3>Establishing Secure Connection...</h3>
          <p style={{ color: 'var(--text-muted)' }}>Negotiating WebRTC parameters</p>
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
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            zIndex: 999,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            color: '#fff',
            minWidth: '320px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
              ⚡ Super Admin Latency HUD (Turn #{liveTelemetry.turn})
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.45rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              LIVE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.45rem 0.3rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.66rem', color: '#7dd3fc', marginBottom: '0.15rem' }}>STT</div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#38bdf8' }}>{liveTelemetry.stt_ms}<span style={{ fontSize: '0.65rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)', padding: '0.45rem 0.3rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.66rem', color: '#d8b4fe', marginBottom: '0.15rem' }}>LLM</div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#c084fc' }}>{liveTelemetry.llm_ms}<span style={{ fontSize: '0.65rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.45rem 0.3rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.66rem', color: '#86efac', marginBottom: '0.15rem' }}>TTS</div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#34d399' }}>{liveTelemetry.tts_ms}<span style={{ fontSize: '0.65rem' }}>ms</span></div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.45rem 0.3rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.66rem', color: '#fca5a5', marginBottom: '0.15rem' }}>Turnaround</div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f87171' }}>
                {(liveTelemetry.total_e2e_ms / 1000).toFixed(2)}<span style={{ fontSize: '0.65rem' }}>s</span>
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
            background: 'rgba(10, 15, 30, 0.94)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '2px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            <CheckCircle2 size={42} color="var(--success)" />
          </div>
          <h2 className="brand-font" style={{ fontSize: '2.1rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 700 }}>
            Interview Completed!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', maxWidth: '440px', lineHeight: 1.55, marginBottom: '1.75rem' }}>
            Your interview is over and your report has been successfully submitted. Thank you!
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '20px',
              background: 'rgba(37, 99, 235, 0.15)',
              color: 'var(--primary)',
              fontSize: '0.86rem',
              fontWeight: 600,
              border: '1px solid rgba(37, 99, 235, 0.3)',
            }}
          >
            <Clock size={15} /> Leaving room in 2s...
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: '1.25rem', fontSize: '0.9rem', padding: '0.55rem 1.4rem' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <ConnectionStatus />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Shield size={14} color="var(--success)" /> Encrypted
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: sessionTrack === 'tech' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: sessionTrack === 'tech' ? 'var(--primary)' : 'var(--success)',
              }}>
                {sessionTrack === 'tech' ? '💻 Tech Viva' : '💼 BDA Role-Play'}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: 'var(--bg-main)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                🌐 {sessionLang.toUpperCase()}
              </div>
            </div>
            {isCodeEditorOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'rgba(37, 99, 235, 0.08)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
                <TerminalSquare size={14} />
                Code Editor Active
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
      color: isConnected ? 'var(--success)' : 'var(--error)',
      background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
    }}>
      <div style={{ 
        width: '8px', height: '8px', borderRadius: '50%', 
        background: isConnected ? 'var(--success)' : 'var(--error)',
        boxShadow: `0 0 10px ${isConnected ? 'var(--success)' : 'var(--error)'}`
      }}></div>
      {isConnected ? 'Connected' : 'Connecting...'}
    </div>
  )
}

function AgentVisualizer() {
  const { state, audioTrack } = useVoiceAssistant()
  
  let statusText = "Awaiting Input..."
  if (state === 'speaking') statusText = "Agent Transmitting..."
  else if (state === 'thinking') statusText = "Computing Response..."
  else if (state === 'disconnected') statusText = "Agent Offline"

  return (
    <div style={{ textAlign: 'center' }}>
      <div className={`orb-wrapper ${state === 'speaking' ? 'speaking' : 'idle'}`}>
        <div className="orb-ring"></div>
        <div className="orb-core"></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          {audioTrack ? (
            <BarVisualizer 
              trackRef={audioTrack}
              barCount={5}
              options={{ minHeight: 10 }}
              style={{ width: '80px', height: '60px', color: 'white' }}
            />
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 className="brand-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Interviewer AI Core
        </h2>
        <p style={{ color: state === 'speaking' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }}>
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
          // Automatically disconnect the WebRTC room after 2.5 seconds
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
    // If editor has not been modified or is a default template, switch to new template
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

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      background: '#0d1117',
      overflow: 'hidden',
    }}>
      {/* Terminal Header with Multi-Language Selector */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0.65rem 1rem', 
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#8b949e', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.5px' }}>
            <TerminalSquare size={14} />
            <span>{currentLangConfig.filename}</span>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>Language:</span>
          <select
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value)}
            style={{
              background: '#21262d',
              border: '1px solid #30363d',
              color: '#e6edf3',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
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

      {/* Editor Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
            color: '#e6edf3',
            border: 'none',
            fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
            fontSize: '0.9rem',
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
        padding: '0.75rem 1rem', 
        background: '#161b22', 
        borderTop: '1px solid #30363d',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
          {currentLangConfig.label} • UTF-8
        </span>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || isSubmitted || !code.trim()}
          style={{ 
            padding: '0.6rem 1.25rem', 
            fontSize: '0.9rem',
            fontWeight: 600,
            background: (isSubmitting || isSubmitted) ? '#21262d' : 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (isSubmitting || !code.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: (isSubmitting || isSubmitted || !code.trim()) ? 'none' : '0 4px 12px rgba(35, 134, 54, 0.3)',
          }}
        >
          {isSubmitting ? 'Evaluating...' : isSubmitted ? '✓ Submitted — Waiting' : '▶ Run & Submit'}
        </button>
      </div>
    </div>
  );
}
