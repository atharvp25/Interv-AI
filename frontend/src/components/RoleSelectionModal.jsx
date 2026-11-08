import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { GraduationCap, Briefcase, UserCheck, Code2, Sparkles, Lock, X } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    id: 'teacher',
    title: 'Teacher / Professor',
    badge: 'Education Assessor',
    icon: GraduationCap,
    color: '#2563eb',
    desc: 'Create practical coding & oral viva exams, share student links, and review graded viva reports.',
    orgLabel: 'College / University Name',
    orgPlaceholder: 'e.g. COEP Technological University',
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Hiring Manager',
    badge: 'Hiring Assessor',
    icon: Briefcase,
    color: '#10b981',
    desc: 'Create BDA sales role-play & tech screening links in 10+ Indian languages and view candidate scorecards.',
    orgLabel: 'Company / Organization Name',
    orgPlaceholder: 'e.g. Gnani.ai / TechCorp India',
  },
  {
    id: 'student',
    title: 'Student',
    badge: 'Education Taker',
    icon: Code2,
    color: '#8b5cf6',
    desc: 'Take assigned college coding/concept vivas and practice explaining your code aloud.',
    orgLabel: 'College / Institute Name',
    orgPlaceholder: 'e.g. VJTI Mumbai',
  },
  {
    id: 'candidate',
    title: 'Job Candidate',
    badge: 'Hiring Taker',
    icon: UserCheck,
    color: '#f59e0b',
    desc: 'Take assigned company screening interviews and practice BDA sales pitches or technical interviews.',
    orgLabel: 'Current Role / Target Domain (Optional)',
    orgPlaceholder: 'e.g. BDA / Python Developer',
  },
];

export default function RoleSelectionModal() {
  const {
    user,
    token,
    guestMode,
    guestRole,
    showRoleModal,
    completeOnboarding,
    authPromptModal,
    closeAuthPrompt,
  } = useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState(guestRole || 'teacher');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (user?.organization) setOrganization(user.organization);
  }, [user]);

  const activeRoleMeta = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleConfirmRole = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        role: selectedRole,
        full_name: fullName.trim() || user?.full_name || 'Explorer',
        organization: organization.trim(),
      });
    } catch (err) {
      setError(err.message || 'Could not save role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* 1. Mandatory Role Selection Modal (Unskippable on first signup or Guest Mode entry) */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="panel animate-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '2rem',
              borderRadius: '18px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--primary)',
                  marginBottom: '0.6rem',
                }}
              >
                <Sparkles size={14} />
                {token ? 'Mandatory Account Setup (One-Time)' : 'Guest Mode'}
              </span>
              <h2 className="brand-font" style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
                {token ? 'Choose Your Role on IntervAI' : 'Select a Role to Preview IntervAI'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {token
                  ? 'Your workspace, permissions, and dashboard will be tailored permanently to the role you select.'
                  : 'Explore how IntervAI works for Recruiters, Teachers, Students, or Candidates. (Live voice sessions require Google Sign-In).'}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--error)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmRole}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '0.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                {ROLE_OPTIONS.map((roleOpt) => {
                  const Icon = roleOpt.icon;
                  const isSelected = selectedRole === roleOpt.id;
                  return (
                    <div
                      key={roleOpt.id}
                      onClick={() => setSelectedRole(roleOpt.id)}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? roleOpt.color : 'var(--border)'}`,
                        background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              padding: '0.45rem',
                              borderRadius: '8px',
                              background: `${roleOpt.color}18`,
                              color: roleOpt.color,
                              display: 'flex',
                            }}
                          >
                            <Icon size={20} />
                          </div>
                          <strong style={{ fontSize: '0.95rem' }}>{roleOpt.title}</strong>
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            background: `${roleOpt.color}18`,
                            color: roleOpt.color,
                          }}
                        >
                          {roleOpt.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                        {roleOpt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {token && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeRoleMeta.orgLabel}</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={activeRoleMeta.orgPlaceholder}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center' }}
              >
                {saving
                  ? 'Saving Role...'
                  : token
                  ? `Confirm & Continue as ${activeRoleMeta.title}`
                  : `Explore Platform as ${activeRoleMeta.title}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Auth Required Modal (Shown when a Guest Explorer clicks Conduct or Practice Interview) */}
      {authPromptModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            className="panel animate-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={closeAuthPrompt}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <Lock size={24} />
            </div>

            <h3 className="brand-font" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Google Sign-In Required
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {authPromptModal.reason}
            </p>

            <GoogleSignInButton />

            <button
              onClick={closeAuthPrompt}
              className="btn-secondary"
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            >
              Continue Exploring in Guest Mode
            </button>
          </div>
        </div>
      )}
    </>
  );
}

