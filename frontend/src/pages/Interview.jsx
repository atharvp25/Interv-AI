import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useConnectionState,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/components-react'
import '@livekit/components-styles'
import {
  TerminalSquare,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Code2,
  Briefcase,
  Globe,
  Mic,
  MicOff,
  PhoneOff,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import AnimatedOrb from '../components/ui/AnimatedOrb'
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
  const { token: jwtToken, user } = useContext(AuthContext)

  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [completedGuest, setCompletedGuest] = useState(false)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false)
  const [liveTelemetry, setLiveTelemetry] = useState(null)
  const [transcripts, setTranscripts] = useState([])

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

        if (!res.ok) throw new Error(data.detail || 'Failed to retrieve token')

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 16px' }}>
        <div
          className="panel"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-text)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={20} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>
            Assessment completed
          </h2>
          <p style={{ marginBottom: '24px' }}>
            Your session on {PLATFORM_NAME} has been recorded and shared with your assessor for review.
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Return to home
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 16px' }}>
        <div className="panel" style={{ maxWidth: '460px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--danger-text)', marginBottom: '8px' }}>
            Unable to connect to session
          </h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/setup')}>
            Return to setup
          </button>
        </div>
      </div>
    )
  }

  if (!token || !url) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <AnimatedOrb state="thinking" />
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px' }}>
              Connecting to audio room
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
              Preparing voice channel and session rubric
            </p>
          </div>
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
      className="interview-container"
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
        onTranscript={(entry) => setTranscripts((prev) => [...prev.slice(-30), entry])}
      />

      {/* Completion Confirmation Overlay */}
      {isInterviewCompleted && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 25, 23, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px',
          }}
        >
          <div className="panel" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-overlay)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={20} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>
              Interview completed
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Your structured evaluation report has been generated and saved.
            </p>
            <div className="pn-badge mono-font" style={{ marginBottom: '20px' }}>
              <Clock size={14} strokeWidth={1.5} /> Closing session...
            </div>
            <div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (jwtToken) {
                    navigate('/dashboard')
                  } else {
                    setCompletedGuest(true)
                  }
                }}
              >
                {jwtToken ? 'View dashboard' : 'Finish session'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`interview-split ${isCodeEditorOpen ? 'split-active' : ''}`}>
        {/* Left Zone: Conversation, Status, Transcript & Quiet Telemetry Strip */}
        <div className="interview-panel">
          {/* Top Bar */}
          <div className="interview-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <ConnectionStatus />
              <span className="pn-badge mono-font">
                <Clock size={13} strokeWidth={1.5} /> {formatTimer(elapsedSeconds)}
              </span>
              <span className="pn-badge">
                {sessionTrack === 'tech' ? (
                  <Code2 size={13} strokeWidth={1.5} />
                ) : (
                  <Briefcase size={13} strokeWidth={1.5} />
                )}
                <span>{sessionTrack === 'tech' ? 'Technical viva' : 'Sales role-play'}</span>
              </span>
              <span className="pn-badge" title="Active assessment language">
                <Globe size={13} strokeWidth={1.5} />
                <span style={{ textTransform: 'uppercase' }}>{sessionLang}</span>
              </span>
              {keywordsCount > 0 && (
                <span className="pn-badge">
                  {keywordsCount} rubric terms
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Quiet Telemetry Strip */}
              {liveTelemetry && (
                <div
                  className="mono-font"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    padding: '4px 10px',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  title={`Turn #${liveTelemetry.turn || 1} latency telemetry`}
                >
                  <span>STT {liveTelemetry.stt_ms}ms</span>
                  <span>LLM {liveTelemetry.llm_ms}ms</span>
                  <span>TTS {liveTelemetry.tts_ms}ms</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                    Total {(liveTelemetry.total_e2e_ms / 1000).toFixed(2)}s
                  </span>
                </div>
              )}

              {(!sessionTrack || sessionTrack === 'tech' || isCodeEditorOpen) && (
                <button
                  type="button"
                  onClick={() => setIsCodeEditorOpen((v) => !v)}
                  className={`btn-code-toggle ${isCodeEditorOpen ? 'active' : ''}`}
                  title="Toggle live coding workspace"
                >
                  <TerminalSquare size={14} strokeWidth={1.5} />
                  <span>{isCodeEditorOpen ? 'Hide code editor' : 'Open code editor'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Conversation & Live Transcript Area */}
          <div className="interview-visualizer">
            <AgentVisualizer
              transcripts={transcripts}
              sessionLang={sessionLang}
              sessionTrack={sessionTrack}
            />
          </div>

          {/* Bottom Controls */}
          <div className="interview-controls">
            <QuietRoomControls
              onEndConfirmed={() => {
                if (jwtToken) {
                  navigate('/dashboard')
                } else {
                  setCompletedGuest(true)
                }
              }}
            />
          </div>
        </div>

        {/* Right Zone: Optional Code Editor Panel */}
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
    <span className={`pn-badge ${isConnected ? 'pn-badge-success' : 'pn-badge-warning'}`}>
      <span className="pn-dot" />
      {isConnected ? 'Connected' : 'Connecting'}
    </span>
  )
}

function AgentVisualizer({ transcripts = [], sessionLang = 'hinglish', sessionTrack = 'tech' }) {
  const { state } = useVoiceAssistant()
  const transcriptEndRef = useRef(null)

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcripts])

  let statusHeading = 'Listening — speak when ready'
  let statusSubtext = 'Your responses are transcribed in real time. Pause naturally when you finish your point.'
  if (state === 'speaking') {
    statusHeading = 'Interviewer is speaking'
    statusSubtext = 'Listen to the question. You can respond as soon as the prompt finishes.'
  } else if (state === 'thinking') {
    statusHeading = 'Processing your response'
    statusSubtext = 'Evaluating technical context and preparing the next follow-up.'
  } else if (state === 'disconnected') {
    statusHeading = 'Session disconnected'
    statusSubtext = 'Audio link is offline.'
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Clear State Indicator Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
            Current state
          </div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>
            {statusHeading}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            {statusSubtext}
          </p>
        </div>

        <AnimatedOrb state={state || 'listening'} />
      </div>

      {/* Live Transcript Box */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '240px',
          maxHeight: '360px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-subtle)',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Live transcript
          </span>
          <span className="pn-badge" style={{ backgroundColor: 'var(--surface)' }}>
            Language: {sessionLang.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.65,
          }}
        >
          {transcripts.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Session active ({sessionTrack === 'tech' ? 'Technical viva & coding defense' : 'Consultative sales role-play'}).
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Transcript segments appear here as you and the interviewer speak. Hindi, Marathi, and English (Devanagari &amp; Latin scripts) are supported.
              </p>
            </div>
          ) : (
            transcripts.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: item.speaker === 'Interviewer' ? 'var(--bg)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  {item.speaker}
                </div>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}>
                  {item.text}
                </div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  )
}

function QuietRoomControls({ onEndConfirmed }) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const [isMuted, setIsMuted] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)

  const toggleMute = async () => {
    if (!localParticipant) return
    const nextMuted = !isMuted
    try {
      await localParticipant.setMicrophoneEnabled(!nextMuted)
      setIsMuted(nextMuted)
    } catch (e) {
      console.error('Microphone toggle error:', e)
    }
  }

  const handleEndSession = () => {
    try {
      room?.disconnect()
    } catch (e) {}
    if (onEndConfirmed) onEndConfirmed()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={toggleMute}
          className={isMuted ? 'btn-danger' : 'btn-secondary'}
        >
          {isMuted ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
          <span>{isMuted ? 'Unmute microphone' : 'Mute microphone'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!confirmEnd ? (
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="btn-secondary"
            style={{ color: 'var(--danger-text)', borderColor: '#FCA5A5' }}
          >
            <PhoneOff size={16} strokeWidth={1.5} />
            <span>End interview</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
              End session now?
            </span>
            <button type="button" onClick={handleEndSession} className="btn-danger pn-btn-sm">
              Confirm end
            </button>
            <button type="button" onClick={() => setConfirmEnd(false)} className="btn-ghost pn-btn-sm">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RoomEventListener({ onOpenEditor, onCloseEditor, onInterviewCompleted, onTelemetry, onTranscript }) {
  const room = useRoomContext()

  useEffect(() => {
    if (!room) return
    const handleData = (data) => {
      try {
        const payload = JSON.parse(new TextDecoder().decode(data))
        if (payload.type === 'enable_code_editor') {
          onOpenEditor()
        } else if (payload.type === 'disable_code_editor') {
          onCloseEditor()
        } else if (payload.type === 'latency_telemetry') {
          if (onTelemetry) onTelemetry(payload.data)
        } else if (payload.type === 'transcript' && payload.text) {
          if (onTranscript) {
            onTranscript({
              speaker: payload.speaker || 'Interviewer',
              text: payload.text,
            })
          }
        } else if (payload.type === 'interview_completed') {
          if (onInterviewCompleted) onInterviewCompleted()
          setTimeout(() => {
            try {
              room.disconnect()
            } catch (err) {
              console.error('Room disconnect error:', err)
            }
          }, 2500)
        }
      } catch (e) {}
    }

    const handleTranscription = (segments, participant) => {
      if (!segments || !onTranscript) return
      segments.forEach((seg) => {
        if (seg.final && seg.text?.trim()) {
          const isAgent = participant?.identity?.toLowerCase().includes('agent') || !participant?.isLocal
          onTranscript({
            speaker: isAgent ? 'Interviewer' : 'Candidate',
            text: seg.text.trim(),
          })
        }
      })
    }

    room.on('dataReceived', handleData)
    room.on('transcriptionReceived', handleTranscription)
    return () => {
      room.off('dataReceived', handleData)
      room.off('transcriptionReceived', handleTranscription)
    }
  }, [room, onOpenEditor, onCloseEditor, onInterviewCompleted, onTelemetry, onTranscript])

  return null
}

const CODE_LANGUAGES = {
  py: {
    id: 'py',
    label: 'Python 3',
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
    label: 'C++ (C++17)',
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
}

function CodeEditor() {
  const [selectedLang, setSelectedLang] = useState('py')
  const [code, setCode] = useState(CODE_LANGUAGES.py.template)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)
  const { localParticipant } = useLocalParticipant()

  const handleLangChange = (newLangId) => {
    setSelectedLang(newLangId)
    const isDefaultTemplate =
      !code.trim() || Object.values(CODE_LANGUAGES).some((l) => l.template.trim() === code.trim())
    if (isDefaultTemplate) {
      setCode(CODE_LANGUAGES[newLangId].template)
    }
    setIsSubmitted(false)
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setIsSubmitting(true)

    try {
      const payload = JSON.stringify({
        type: 'code_submission',
        code,
        language: selectedLang,
      })
      const encoder = new TextEncoder()
      const data = encoder.encode(payload)

      if (localParticipant) {
        await localParticipant.publishData(data, { topic: 'code_submission' })
        setIsSubmitted(true)
        setSubmissionCount((c) => c + 1)
      }
    } catch (err) {
      console.error('Failed to submit code:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentLangConfig = CODE_LANGUAGES[selectedLang] || CODE_LANGUAGES.py
  const lineCount = Math.max(14, code.split('\n').length)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      {/* Code Editor Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'var(--surface-subtle)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalSquare size={16} strokeWidth={1.5} color="var(--text-secondary)" />
          <span className="mono-font" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)' }}>
            {currentLangConfig.filename}
          </span>
          <span className="pn-badge mono-font" style={{ backgroundColor: 'var(--surface)' }}>
            Submissions: {submissionCount}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="code-lang-select" style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Language
          </label>
          <select
            id="code-lang-select"
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value)}
            style={{
              width: 'auto',
              padding: '4px 10px',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
            }}
          >
            <option value="py">Python 3</option>
            <option value="c">C (C11)</option>
            <option value="cpp">C++ (C++17)</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Monospace Code Area with Line Numbers */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--surface)' }}>
        <div
          className="mono-font"
          style={{
            padding: '16px 10px 16px 12px',
            backgroundColor: 'var(--bg)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            lineHeight: '1.6',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid var(--border)',
            minWidth: '44px',
          }}
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setIsSubmitted(false)
          }}
          placeholder={`// Write your ${currentLangConfig.shortLabel} solution here...`}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '16px',
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            tabSize: 4,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              const target = e.target
              const start = target.selectionStart
              const end = target.selectionEnd
              setCode(code.substring(0, start) + '    ' + code.substring(end))
              setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 4
              }, 0)
            }
          }}
        />
      </div>

      {/* Editor Footer */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--surface-subtle)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span className="mono-font" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {currentLangConfig.label} • UTF-8
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isSubmitted || !code.trim()}
          className={isSubmitted ? 'btn-secondary' : 'btn-primary'}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : isSubmitted ? (
            <>
              <Check size={16} strokeWidth={1.5} /> Submitted — explain your approach
            </>
          ) : (
            <>
              <Play size={16} strokeWidth={1.5} /> Submit code for review
            </>
          )}
        </button>
      </div>
    </div>
  )
}
