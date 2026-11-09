import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { GraduationCap, Briefcase, UserCheck, Code2, Lock, X, Check } from 'lucide-react';
import { PLATFORM_NAME } from '../brand';

const ROLE_OPTIONS = [
  {
    id: 'teacher',
    title: 'Teacher / Professor',
    category: 'Education Assessor',
    icon: GraduationCap,
    desc: 'Create practical coding & oral viva exams, share student links, and review graded viva reports.',
    orgLabel: 'College / University Name',
    orgPlaceholder: 'e.g. COEP Technological University',
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Hiring Manager',
    category: 'Hiring Assessor',
    icon: Briefcase,
    desc: 'Create BDA sales role-play & tech screening links in 10+ Indian languages and review candidate scorecards.',
    orgLabel: 'Company / Organization Name',
    orgPlaceholder: 'e.g. Enterprise Technologies Ltd.',
  },
  {
    id: 'student',
    title: 'Student',
    category: 'Education Candidate',
    icon: Code2,
    desc: 'Take assigned college coding vivas and practice explaining algorithms and complexity aloud.',
    orgLabel: 'College / Institute Name',
    orgPlaceholder: 'e.g. VJTI Mumbai',
  },
  {
    id: 'candidate',
    title: 'Job Candidate',
    category: 'Hiring Candidate',
    icon: UserCheck,
    desc: 'Take assigned company screening interviews and practice sales pitches or technical interviews.',
    orgLabel: 'Current Role / Target Domain (Optional)',
    orgPlaceholder: 'e.g. SDE / BDA Specialist',
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

  const [selectedRole, setSelectedRole] = useState(guestRole || 'recruiter');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync state whenever modal opens or guest role changes
  useEffect(() => {
    if (guestRole) {
      setSelectedRole(guestRole);
    }
  }, [guestRole, showRoleModal]);

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
      setShowRoleModal(false);
    } catch (err) {
      setError(err.message || 'Could not save role');
    } finally {
      setSaving(false);
    }
  };

  const canDismiss = Boolean(guestMode && guestRole && !token);

  return (
    <>
      {/* 1. Role Selection Modal */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 15, 23, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              padding: '2rem',
              borderRadius: '12px',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Dismiss button if user already has an active guest role */}
            {canDismiss && (
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="pn-badge pn-badge-primary" style={{ marginBottom: '0.6rem' }}>
                {token ? 'Account Setup' : 'Guest Role Switcher'}
              </span>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem', fontWeight: 700 }}>
                {token ? `Select Your Workspace Role` : `Switch Preview Role`}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                {token
                  ? `Your permissions and dashboard will be configured for the role you choose.`
                  : `Select which persona dashboard you want to preview in Guest Mode.`}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--error)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.84rem',
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
                  gap: '0.85rem',
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
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface-2)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                        position: 'relative',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Icon size={18} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                            {roleOpt.title}
                          </strong>
                        </div>
                        {isSelected && (
                          <span style={{ color: 'var(--primary)', display: 'inline-flex' }}>
                            <Check size={16} />
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                        {roleOpt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {token && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>
                      {activeRoleMeta.orgLabel}
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={activeRoleMeta.orgPlaceholder}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {canDismiss && (
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : token
                    ? `Continue as ${activeRoleMeta.title}`
                    : `View as ${activeRoleMeta.title}`}
                </button>
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
            background: 'rgba(11, 15, 23, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <button
              onClick={closeAuthPrompt}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '1px solid rgba(37, 99, 235, 0.25)',
              }}
            >
              <Lock size={22} />
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', fontWeight: 700 }}>
              Sign In Required
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {authPromptModal.reason}
            </p>

            <GoogleSignInButton />

            <button
              type="button"
              onClick={closeAuthPrompt}
              className="btn-secondary"
              style={{ marginTop: '0.85rem', width: '100%' }}
            >
              Continue Exploring as Guest
            </button>
          </div>
        </div>
      )}
    </>
  );
}
