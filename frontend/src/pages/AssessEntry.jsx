import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Lock,
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
      <div style={{ maxWidth: '580px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <SkeletonCard rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '540px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '2.5rem', borderRadius: '12px' }}>
          <AlertTriangle size={40} color="var(--error)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Assessment Link Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isTech = assessment?.track === 'tech';

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1.5rem', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel"
        style={{ padding: '2.2rem', borderRadius: '12px', position: 'relative' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
            }}
          >
            {isTech ? <Code size={14} /> : <Briefcase size={14} />}
            {isTech ? 'Practical Coding & Oral Viva' : 'BDA Sales & Objection Role-Play'}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <Globe size={14} /> {assessment.language?.toUpperCase()}
          </span>
        </div>

        <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {assessment.role_title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Assigned by <strong style={{ color: 'var(--text-main)' }}>{assessment.owner_name}</strong>
          {assessment.owner_organization ? ` (${assessment.owner_organization})` : ''} •{' '}
          <span style={{ textTransform: 'capitalize' }}>{assessment.owner_role}</span> Assessment
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="var(--primary)" />
            <span><strong>{assessment.keywords_count}</strong> Boosted Keyterms</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--primary)" />
            <span>
              Attempts: <strong>{assessment.attempts_used}/{assessment.max_attempts}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={15} color="var(--primary)" />
            <span>One-Claimer Protected</span>
          </div>
        </div>

        {claimError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
            }}
          >
            {claimError}
          </div>
        )}

        <form onSubmit={handleStartAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user ? (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'var(--primary-soft)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.86rem',
              }}
            >
              <UserCheck size={18} color="var(--primary)" />
              <span>
                Signed in as <strong>{user.full_name || user.username}</strong> ({user.email}). This session will be bound to your account.
              </span>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={takerName}
                  onChange={(e) => setTakerName(e.target.value)}
                  placeholder="Enter your full name (for your evaluation report)"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>Your Email Address *</label>
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
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              lineHeight: 1.45,
              marginTop: '0.25rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-2)',
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
              I consent to real-time microphone audio processing via Gnani Prisma STT and AI-assisted evaluation. I understand the human assessor makes the final decision.
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={claiming}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem', justifyContent: 'center', marginTop: '0.35rem', borderRadius: '8px' }}
          >
            {claiming ? 'Claiming & Locking Session...' : 'Claim & Start Live Voice Assessment'} <ArrowRight size={16} />
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
      </motion.div>
    </div>
  );
}
