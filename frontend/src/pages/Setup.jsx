import React, { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, ServerCog, Bot, Mic2 } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Setup() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [fileName, setFileName] = useState('')
  const { token } = useContext(AuthContext)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
      const res = await fetch(`${baseUrl}/api/upload-jd`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed")
      }

      setStatus('success')
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
      
      {/* 3-Step Workflow Graphic */}
      <div className="workflow-steps fade-in" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '4px solid var(--bg-main)' }}>
            <FileText size={20} />
          </div>
          <span style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>Upload JD</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: status === 'success' ? 'var(--primary)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status === 'success' ? 'white' : 'var(--text-muted)', border: `4px solid var(--bg-main)`, boxShadow: '0 0 0 1px var(--border)', transition: 'all 0.3s' }}>
            <Bot size={20} />
          </div>
          <span style={{ marginTop: '0.5rem', fontWeight: 600, color: status === 'success' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.875rem' }}>AI Preparation</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '4px solid var(--bg-main)', boxShadow: '0 0 0 1px var(--border)' }}>
            <Mic2 size={20} />
          </div>
          <span style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Live Interview</span>
        </div>
      </div>

      <div className="panel animate-in delay-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="brand-font" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>Initialize Context</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', lineHeight: 1.6 }}>
          Upload the candidate's Job Description (PDF or TXT) to provide the AI agent with specific context for this interview session.
        </p>

        <div 
          className={`dropzone ${status === 'uploading' ? 'uploading' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.txt"
            style={{ display: 'none' }} 
          />
          
          {status === 'idle' && (
            <>
              <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Click or drag file to upload</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>PDF or TXT up to 5MB</p>
            </>
          )}

          {status === 'uploading' && (
            <>
              <ServerCog size={48} color="var(--secondary)" className="spin" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Processing Document...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{fileName}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Context Ready</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{fileName} processed successfully</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertTriangle size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Upload Failed</h3>
              <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errorMessage}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Click to try again</p>
            </>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/interview')}
            disabled={status !== 'success'}
            style={{ opacity: status !== 'success' ? 0.5 : 1, width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            Start Interview <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
