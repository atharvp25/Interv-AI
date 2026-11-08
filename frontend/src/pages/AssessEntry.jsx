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
  Sparkles,
} from 'lucide-react';

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
      setClaimError('Please check the consent box before starting the voice assessment.');
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

      // Save claim & session secrets for one-claimer validation
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
      <div style={{ maxWidth: '560px', margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h3>Verifying Assessment Link...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '540px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="panel animate-in" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <AlertTriangle size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
          <h2 className="brand-font" style={{ marginBottom: '0.5rem' }}>Assessment Link Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isTech = assessment?.track === 'tech';

  return (
    <div style={{ maxWidth: '620px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="panel animate-in" style={{ padding: '2.25rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: isTech ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: isTech ? 'var(--primary)' : 'var(--success)',
            }}
          >
            {isTech ? <Code size={15} /> : <Briefcase size={15} />}
            {isTech ? 'Practical Coding & Oral Viva' : 'BDA Sales & Objection Role-Play'}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.7rem',
              borderRadius: '16px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <Globe size={14} /> {assessment.language?.toUpperCase()}
          </span>
        </div>

        <h1 className="brand-font" style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
          {assessment.role_title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          Assigned by <strong>{assessment.owner_name}</strong>
          {assessment.owner_organization ? ` (${assessment.owner_organization})` : ''} •{' '}
          <span style={{ textTransform: 'capitalize' }}>{assessment.owner_role}</span> Assessment
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            marginBottom: '1.75rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span><strong>{assessment.keywords_count}</strong> Boosted Keyterms</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--primary)" />
            <span>
              Attempts: <strong>{assessment.attempts_used}/{assessment.max_attempts}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>One-Claimer Protected</span>
          </div>
        </div>

        {claimError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            {claimError}
          </div>
        )}

        <form onSubmit={handleStartAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {user ? (
            <div
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.88rem',
              }}
            >
              <UserCheck size={18} color="var(--success)" />
              <span>
                Signed in as <strong>{user.full_name || user.username}</strong> ({user.email}). This session will be bound to your account.
              </span>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={takerName}
                  onChange={(e) => setTakerName(e.target.value)}
                  placeholder="Enter your full name (for your evaluation report)"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={takerEmail}
                  onChange={(e) => setTakerEmail(e.target.value)}
                  placeholder="you@college.edu or you@example.com"
                />
              </div>
            </>
          )}

          {/* Mandatory Audio & AI Evaluation Consent */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              lineHeight: 1.45,
              marginTop: '0.25rem',
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '2px' }}
            />
            <span>
              I consent to real-time microphone audio processing via Gnani Prisma STT and AI-assisted evaluation. I understand the human assessor makes the final decision.
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={claiming}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {claiming ? 'Claiming & Locking Session...' : 'Claim & Start Live Voice Assessment'} <ArrowRight size={18} />
          </button>
        </form>

        {!user && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Or sign in with Google to link this assessment to your Student/Candidate dashboard:
            </p>
            <GoogleSignInButton />
          </div>
        )}
      </div>
    </div>
  );
}

