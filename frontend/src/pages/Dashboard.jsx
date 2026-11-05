import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Plus, Award, Calendar, BarChart3, Clock, AlertCircle, MessageSquareText, FileText, Download } from 'lucide-react'

export default function Dashboard() {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token, user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
        const res = await fetch(`${baseUrl}/api/evaluations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Failed to load evaluations")
        setEvaluations(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvaluations()
  }, [token])

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 2rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome, {user?.username}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your past AI interview performances.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/setup')} style={{ fontSize: '1rem' }}>
          <Plus size={18} /> New Interview
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BarChart3 className="spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading evaluations...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="panel animate-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Award size={64} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>No Interviews Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't completed any AI interviews. Start one now to get your baseline score.</p>
          <button className="btn-primary" onClick={() => navigate('/setup')}>Take an Interview</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
          {evaluations.map((ev, i) => (
            <div key={ev._id || i} className="panel fade-in" style={{ animationDelay: `${i * 0.1}s`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Calendar size={18} />
                  <span style={{ fontWeight: 500 }}>{formatDate(ev.timestamp)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ev.jd_id && (
                    <button 
                      onClick={() => {
                        const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
                        window.open(`${baseUrl}/api/jd/${ev.jd_id}?token=${token}`, '_blank')
                      }}
                      className="btn-secondary" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <FileText size={16} /> View JD
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : ''
                      window.open(`${baseUrl}/api/evaluations/${ev._id}/pdf?token=${token}`, '_blank')
                    }}
                    className="btn-secondary" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <Download size={16} /> Download PDF
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600 }}>
                    <Award size={18} />
                    Score: {ev.scores.overall_score}/10
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                <Metric score={ev.scores.technical_accuracy} label="Technical Accuracy" />
                <Metric score={ev.scores.communication} label="Communication" />
                <Metric score={ev.scores.confidence} label="Confidence" />
                <Metric score={ev.scores.depth} label="Depth of Answer" />
                <Metric score={ev.scores.completeness} label="Completeness" />
              </div>

              {ev.feedback ? (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.25rem', 
                  background: 'var(--bg-main)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)' 
                }}>
                  <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <div>
                      <h4 style={{ color: 'var(--success)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Strengths</h4>
                      <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                        {ev.feedback.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ color: '#eab308', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Areas for Improvement</h4>
                      <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                        {ev.feedback.areas_for_improvement.map((a, idx) => <li key={idx}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Summary</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {ev.feedback.summary}
                    </p>
                  </div>
                </div>
              ) : ev.review ? (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.25rem', 
                  background: 'var(--bg-main)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <MessageSquareText size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>AI Review</span>
                  </div>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.7, 
                    fontSize: '0.9rem', 
                    margin: 0 
                  }}>
                    {ev.review}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ score, label }) {
  // Simple color mapping
  const getColor = (s) => {
    if (s >= 8) return 'var(--success)'
    if (s >= 6) return '#eab308' // yellow
    return 'var(--error)'
  }
  
  const color = getColor(score)
  
  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', width: '30px' }}>{score}</div>
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(score/10)*100}%`, background: color, borderRadius: '3px' }}></div>
        </div>
      </div>
    </div>
  )
}
