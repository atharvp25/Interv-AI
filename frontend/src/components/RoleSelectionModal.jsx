import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { GraduationCap, Briefcase, UserCheck, Code2, Lock, X, Check } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    id: 'teacher',
    title: 'Faculty / Professor',
    icon: GraduationCap,
    desc: 'Create practical coding & oral viva links, manage class rosters, and review graded viva reports.',
    orgLabel: 'University / College name',
    orgPlaceholder: 'e.g. COEP Technological University',
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Hiring manager',
    icon: Briefcase,
    desc: 'Create sales & technical screening links across Indian languages and compare candidate scorecards.',
    orgLabel: 'Company / Organization name',
    orgPlaceholder: 'e.g. Acme Technologies',
  },
  {
    id: 'student',
    title: 'Student',
    icon: Code2,
    desc: 'Complete assigned college coding vivas and practice defending algorithms aloud.',
    orgLabel: 'College / Institute name',
    orgPlaceholder: 'e.g. VJTI Mumbai',
  },
  {
    id: 'candidate',
    title: 'Job candidate',
    icon: UserCheck,
    desc: 'Complete company screening assessments and practice sales or technical interviews.',
    orgLabel: 'Current role / Target domain (optional)',
    orgPlaceholder: 'e.g. Backend Engineer / BDA',
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
        full_name: fullName.trim() || user?.full_name || 'Guest',
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
            background: 'rgba(28, 25, 23, 0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '28px',
              position: 'relative',
              boxShadow: 'var(--shadow-overlay)',
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
                  padding: '4px',
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            )}

            <div style={{ marginBottom: '20px' }}>
              <span className="pn-badge pn-badge-primary" style={{ marginBottom: '8px' }}>
                {token ? 'Workspace setup' : 'Guest role switcher'}
              </span>
              <h2 style={{ fontSize: '20px', marginBottom: '4px', fontWeight: 600, color: 'var(--text)' }}>
                {token ? 'Select your workspace role' : 'Select a role to preview'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                {token
                  ? 'Your navigation, tables, and permissions will be configured for this role.'
                  : 'Switch between assessor and candidate views in guest mode.'}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  border: '1px solid var(--border-strong)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-btn)',
                  marginBottom: '16px',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
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
                        padding: '16px',
                        borderRadius: 'var(--radius-card)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'border-color 120ms ease-out, background-color 120ms ease-out',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={16} strokeWidth={1.5} color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'} />
                          <strong style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                            {roleOpt.title}
                          </strong>
                        </div>
                        {isSelected && (
                          <span style={{ color: 'var(--primary)', display: 'inline-flex' }}>
                            <Check size={16} strokeWidth={1.5} />
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        {roleOpt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {token && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
                    : `Preview as ${activeRoleMeta.title}`}
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
            background: 'rgba(28, 25, 23, 0.45)',
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
              maxWidth: '400px',
              padding: '28px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-overlay)',
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
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div
              style={{
                width: '40px',
                height: '40px',
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
              Continue in guest preview
            </button>
          </div>
        </div>
      )}
    </>
  );
}
