import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, LogOut, Eye, RefreshCw, LayoutDashboard, PlusCircle, Sparkles } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const ROLE_BADGES = {
  teacher: { label: 'Teacher', emoji: '🎓', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  recruiter: { label: 'Recruiter', emoji: '💼', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  student: { label: 'Student', emoji: '🧑‍🎓', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  candidate: { label: 'Candidate', emoji: '👨‍💻', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
}

export default function Header() {
  const {
    user,
    logout,
    token,
    guestMode,
    guestRole,
    effectiveRole,
    isAssessor,
    isSuperAdmin,
    switchSuperAdminRole,
    startGuestMode,
    openGuestRoleSwitcher,
  } = useContext(AuthContext)

  const location = useLocation()
  const roleMeta = ROLE_BADGES[effectiveRole] || ROLE_BADGES.candidate

  return (
    <nav className="navbar fade-in" style={{ padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)' }}>
      {/* Brand Logo */}
      <Link to={token || guestMode ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
        <div className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
          }}>
            <Briefcase size={20} />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.5px' }}>IntervAI</span>
        </div>
      </Link>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {token ? (
          /* ── Authenticated User State ── */
          <>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: location.pathname === '/dashboard' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link
              to="/setup"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/setup' ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: location.pathname === '/setup' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              }}
            >
              <PlusCircle size={16} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'Create Viva' : 'Create Screening') : 'Start Practice'}
            </Link>

            {/* Role Badge or Super Admin Switcher */}
            {isSuperAdmin ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.12))',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '20px',
                  padding: '0.2rem 0.65rem',
                }}
                title="Super Admin: Full platform privileges + dynamic role switcher"
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ⚡ Super Admin:
                </span>
                <select
                  value={effectiveRole || 'recruiter'}
                  onChange={async (e) => {
                    await switchSuperAdminRole(e.target.value);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    padding: '0.1rem 0.2rem',
                    outline: 'none',
                  }}
                >
                  <option value="recruiter" style={{ background: 'var(--bg-panel)' }}>💼 Recruiter</option>
                  <option value="teacher" style={{ background: 'var(--bg-panel)' }}>🎓 Teacher</option>
                  <option value="candidate" style={{ background: 'var(--bg-panel)' }}>👨‍💻 Candidate</option>
                  <option value="student" style={{ background: 'var(--bg-panel)' }}>🧑‍🎓 Student</option>
                </select>
              </div>
            ) : effectiveRole && (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: roleMeta.bg,
                  color: roleMeta.color,
                  border: `1px solid ${roleMeta.color}30`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{roleMeta.emoji}</span>
                <span>{roleMeta.label}</span>
              </span>
            )}

            {/* User Profile */}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.88rem', marginLeft: '0.2rem' }}>
              {user?.full_name || user?.username}
            </span>

            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderRadius: '10px' }}
            >
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : guestMode ? (
          /* ── Guest Mode State (Cleaned up: NO 'Setup Preview', properly arranged) ── */
          <>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: location.pathname === '/dashboard' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link
              to="/setup"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/setup' ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: location.pathname === '/setup' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              }}
            >
              <PlusCircle size={16} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'Create Viva' : 'Create Screening') : 'Practice'}
            </Link>

            {/* Guest Role Indicator Pill */}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Eye size={13} />
              <span>Preview: {roleMeta.label}</span>
            </span>

            {/* Switch Role Button */}
            <button
              onClick={openGuestRoleSwitcher}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }}
            >
              <RefreshCw size={13} /> Switch Role
            </button>

            {/* Rounded Sign in with Google Button */}
            <Link
              to="/login"
              className="btn-primary"
              style={{
                padding: '0.5rem 1.15rem',
                fontSize: '0.88rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <GoogleGIcon size={16} />
              <span>Sign In with Google</span>
            </Link>
          </>
        ) : (
          /* ── Logged Out State (Cleanly arranged & matching rounded buttons) ── */
          <>
            <button
              onClick={startGuestMode}
              className="btn-secondary"
              style={{
                padding: '0.55rem 1.1rem',
                fontSize: '0.88rem',
                borderRadius: '10px',
              }}
            >
              <Eye size={16} /> Guest Mode
            </button>

            <Link
              to="/login"
              className="btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.88rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <GoogleGIcon size={16} />
              <span>Sign In with Google</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function GoogleGIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}
