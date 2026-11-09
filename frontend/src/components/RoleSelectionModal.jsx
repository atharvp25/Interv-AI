import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { GraduationCap, Briefcase, UserCheck, Code2, Lock, X, Check, ArrowRight } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    id: 'teacher',
    title: 'Faculty / Professor',
    badge: 'Academic Assessment',
    icon: GraduationCap,
    desc: 'Conduct live practical coding & oral complexity vivas with anti-cheat defense. Grade code submissions and oral defense in 11 languages.',
    capabilities: 'Live compiler sandbox • Complexity oral defense • Class viva roster',
    orgLabel: 'University / College name',
    orgPlaceholder: 'e.g. COEP Technological University',
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Hiring Manager',
    badge: 'Enterprise Screening',
    icon: Briefcase,
    desc: 'Screen software engineers and BDA sales reps across Indian and code-mixed languages. Benchmark candidate communication and objection handling.',
    capabilities: 'JD keyword boosting • Objection role-play • Candidate scorecard matrix',
    orgLabel: 'Company / Organization name',
    orgPlaceholder: 'e.g. Acme Technologies India',
  },
  {
    id: 'student',
    title: 'Student',
    badge: 'Lab Examination',
    icon: Code2,
    desc: 'Take assigned university coding vivas or run mock viva practice. Practice writing code and articulating Big-O complexity aloud.',
    capabilities: '3 guided compiler attempts • Instant AI feedback • Professor grade review',
    orgLabel: 'College / Institute name',
    orgPlaceholder: 'e.g. VJTI Mumbai',
  },
  {
    id: 'candidate',
    title: 'Job Candidate',
    badge: 'Interview Preparation',
    icon: UserCheck,
    desc: 'Claim official screening links from recruiters or practice sales pitch and engineering interview questions before company rounds.',
    capabilities: 'WebRTC voice studio • 6-axis scorecard report • Single-claimer security',
    orgLabel: 'Target role or domain (optional)',
    orgPlaceholder: 'e.g. Backend SDE / BDA Specialist',
  },
];

export default function RoleSelectionModal() {
  const {
    user,
    token,
    guestMode,
    guestRole,
    showRoleModal,
    setShowRoleModal,
    completeOnboarding,
    authPromptModal,
    closeAuthPrompt,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(guestRole || user?.role || 'recruiter');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (guestRole) {
      setSelectedRole(guestRole);
    } else if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [guestRole, user, showRoleModal]);

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
        full_name: fullName.trim() || user?.full_name || 'Guest Explorer',
        organization: organization.trim(),
      });
      setShowRoleModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not save role');
    } finally {
      setSaving(false);
    }
  };

  const canDismiss = Boolean(guestMode && guestRole && !token);

  return (
    <>
      {/* 1. Large High-Contrast B2B Role Selection Modal */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.82)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '880px',
              padding: '32px',
              position: 'relative',
              boxShadow: 'var(--shadow-overlay)',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--surface)',
            }}
          >
            {canDismiss && (
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
                className="btn-ghost"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            )}

            <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
              <span className="pn-badge pn-badge-primary" style={{ marginBottom: '8px' }}>
                {token ? 'Workspace setup' : 'Persona selection'}
              </span>
              <h2 style={{ fontSize: '22px', marginBottom: '6px', fontWeight: 600, color: 'var(--text)' }}>
                {token ? 'Select your primary workspace role' : 'Choose a persona to explore IntervAI'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                {token
                  ? 'Your dashboard, rubrics, and assessment permissions will be tailored to this persona.'
                  : 'Select an active role. You can switch personas at any time without entering credentials.'}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  border: '1px solid var(--border-strong)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-btn)',
                  marginBottom: '20px',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmRole}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                {ROLE_OPTIONS.map((roleOpt) => {
                  const Icon = roleOpt.icon;
                  const isSelected = selectedRole === roleOpt.id;
                  return (
                    <div
                      key={roleOpt.id}
                      onClick={() => setSelectedRole(roleOpt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedRole(roleOpt.id);
                      }}
                      style={{
                        padding: '18px 20px',
                        borderRadius: 'var(--radius-card)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--surface)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'border-color 140ms ease-out, background-color 140ms ease-out',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                                color: isSelected ? '#FFFFFF' : 'var(--text)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon size={17} strokeWidth={1.5} />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
                                {roleOpt.badge}
                              </div>
                              <strong style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                                {roleOpt.title}
                              </strong>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border-strong)',
                              backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && <Check size={12} strokeWidth={2.5} />}
                          </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                          {roleOpt.desc}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {roleOpt.capabilities}
                      </div>
                    </div>
                  );
                })}
              </div>

              {token && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text)' }}>
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text)' }}>
                      {activeRoleMeta.orgLabel}
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={activeRoleMeta.orgPlaceholder}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    navigate('/select-role');
                  }}
                  className="btn-ghost"
                  style={{ fontSize: '13px' }}
                >
                  Open full-screen role selector →
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {canDismiss && (
                    <button
                      type="button"
                      onClick={() => setShowRoleModal(false)}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    {saving
                      ? 'Configuring...'
                      : `Enter ${activeRoleMeta.title} workspace`}
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Auth Required Modal */}
      {authPromptModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.75)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '28px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-overlay)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <button
              type="button"
              onClick={closeAuthPrompt}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
              className="btn-ghost"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                border: '1px solid var(--border-strong)',
              }}
            >
              <Lock size={18} strokeWidth={1.5} />
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '6px', fontWeight: 600, color: 'var(--text)' }}>
              Sign in required
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              {authPromptModal.reason}
            </p>

            <GoogleSignInButton />

            <button
              type="button"
              onClick={closeAuthPrompt}
              className="btn-secondary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              Continue exploring as guest
            </button>
          </div>
        </div>
      )}
    </>
  );
}
