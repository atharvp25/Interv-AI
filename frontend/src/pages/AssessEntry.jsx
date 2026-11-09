import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import {
  ShieldCheck,
  Code,
  Briefcase,
  Globe,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Mic,
} from 'lucide-react';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function AssessEntry() {
  const { token: shareToken } = useParams();
  const navigate = useNavigate();
  const { token: jwtToken, user } = useContext(AuthContext);

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Guest / Taker form state
  const [takerName, setTakerName] = useState('');
  const [takerEmail, setTakerEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '');

  useEffect(() => {
    if (user) {
      setTakerName(user.full_name || user.username || '');
      setTakerEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/assessments/by-token/${shareToken}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Invalid or expired assessment link.');
        setAssessment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [shareToken]);

  const handleStartAssessment = async (e) => {
    e.preventDefault();
    if (!consent) {
      setClaimError('Please confirm the audio and evaluation consent box before starting.');
      return;
    }
    setClaiming(true);
    setClaimError('');

    try {
      const savedClaimSecret = localStorage.getItem(`intervai_claim_${shareToken}`) || '';
      const headers = { 'Content-Type': 'application/json' };
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const res = await fetch(`${getBaseUrl()}/api/assessments/claim`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: shareToken,
          taker_name: takerName.trim(),
          taker_email: takerEmail.trim(),
          claim_secret: savedClaimSecret,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not start assessment.');

      if (data.claim_secret) {
        localStorage.setItem(`intervai_claim_${shareToken}`, data.claim_secret);
      }
      localStorage.setItem('intervai_session', data.session_id);
      localStorage.setItem('intervai_session_secret', data.session_secret);
      localStorage.setItem('intervai_track', data.track);
      localStorage.setItem('intervai_lang', data.language);

      navigate(
        `/interview?session=${data.session_id}&secret=${encodeURIComponent(data.session_secret)}&track=${data.track}&lang=${data.language}`
      );
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '580px', margin: '48px auto', padding: '0 24px' }}>
        <SkeletonCard rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '540px', margin: '48px auto', padding: '0 24px' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '32px' }}>
          <AlertTriangle size={32} strokeWidth={1.5} color="var(--danger-text)" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
            Assessment link unavailable
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const isTech = assessment?.track === 'tech';

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px', width: '100%' }}>
      <div className="panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <span className="pn-badge pn-badge-primary">
            {isTech ? <Code size={14} strokeWidth={1.5} /> : <Briefcase size={14} strokeWidth={1.5} />}
            {isTech ? 'Practical coding & oral viva' : 'BDA sales & objection role-play'}
          </span>

          <span className="pn-badge">
            <Globe size={14} strokeWidth={1.5} /> Language: {assessment.language?.toUpperCase()}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', marginBottom: '6px', fontWeight: 600, color: 'var(--text)' }}>
          {assessment.role_title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Assigned by <strong style={{ color: 'var(--text)' }}>{assessment.owner_name}</strong>
          {assessment.owner_organization ? ` (${assessment.owner_organization})` : ''} ·{' '}
          <span style={{ textTransform: 'capitalize' }}>{assessment.owner_role}</span> assessment
        </p>

        {/* Session Parameters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-btn)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mic size={15} strokeWidth={1.5} color="var(--text-muted)" />
            <span>Voice &amp; live transcript</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} strokeWidth={1.5} color="var(--text-muted)" />
            <span className="mono-font">
              Attempts: <strong style={{ color: 'var(--text)' }}>{assessment.attempts_used}/{assessment.max_attempts}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} strokeWidth={1.5} color="var(--text-muted)" />
            <span>Single-claimer bound</span>
          </div>
        </div>

        {/* Disclosure Callout */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-btn)',
            background: 'var(--accent-soft)',
            color: 'var(--accent-soft-text)',
            border: '1px solid var(--border-strong)',
            fontSize: '13px',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}
        >
          <strong>Session disclosure:</strong> This interview is conducted by an AI voice examiner, transcribed in real time, and shared with the human assessor ({assessment.owner_name}) for final review.
        </div>

        {claimError && (
          <div
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--border-strong)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-btn)',
              marginBottom: '16px',
              fontSize: '13px',
            }}
          >
            {claimError}
          </div>
        )}

        <form onSubmit={handleStartAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user ? (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              <UserCheck size={16} strokeWidth={1.5} color="var(--text)" />
              <span>
                Signed in as <strong style={{ color: 'var(--text)' }}>{user.full_name || user.username}</strong> ({user.email}).
              </span>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text)' }}>
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  value={takerName}
                  onChange={(e) => setTakerName(e.target.value)}
                  placeholder="Enter your full name for the evaluation report"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text)' }}>
                  Email address *
                </label>
                <input
                  type="email"
                  required
                  value={takerEmail}
                  onChange={(e) => setTakerEmail(e.target.value)}
                  placeholder="you@institution.edu or you@company.com"
                />
              </div>
            </>
          )}

          {/* Mandatory Audio & AI Evaluation Consent */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              lineHeight: 1.5,
              padding: '12px',
              borderRadius: 'var(--radius-btn)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--primary)' }}
            />
            <span>
              I understand that this session is AI-conducted, my microphone audio is transcribed in real time via Gnani Prisma STT, and the transcript and scorecard will be shared with the human assessor for final grading or hiring review.
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={claiming}
            style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}
          >
            {claiming ? 'Claiming & locking session...' : 'Confirm consent & start voice session'} <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>

        {!user && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Optional: Sign in with Google to save this session to your account history
            </p>
            <GoogleSignInButton />
          </div>
        )}
      </div>
    </div>
  );
}
