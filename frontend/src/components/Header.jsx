import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, LogOut, Eye, RefreshCw, LayoutDashboard, PlusCircle } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import ThemeToggle from './ui/ThemeToggle'
import Badge from './ui/Badge'
import { PLATFORM_NAME } from '../brand'

const ROLE_BADGES = {
  teacher: { label: 'Teacher', tone: 'primary' },
  recruiter: { label: 'Recruiter', tone: 'secondary' },
  student: { label: 'Student', tone: 'primary' },
  candidate: { label: 'Candidate', tone: 'secondary' },
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

  const navLinkStyle = (active) => ({
    textDecoration: 'none',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.86rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    background: active ? 'var(--primary-soft)' : 'transparent',
    transition: 'all 0.15s ease',
  })

  return (
    <nav className="navbar" style={{ padding: '0.75rem 1.75rem' }} aria-label="Main navigation">
      {/* Brand Logo */}
      <Link to={token || guestMode ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Sparkles size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              {PLATFORM_NAME}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Voice Assessment Platform
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={navLinkStyle(location.pathname === '/dashboard')}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>

            <Link to="/setup" style={navLinkStyle(location.pathname === '/setup')}>
              <PlusCircle size={14} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'Create Viva' : 'Create Screening') : 'Start Practice'}
            </Link>

            {isSuperAdmin ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'var(--primary-soft)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.55rem',
                }}
                title="Super Admin Role Switcher"
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Super Admin:
                </span>
                <select
                  value={effectiveRole || 'recruiter'}
                  onChange={async (e) => {
                    await switchSuperAdminRole(e.target.value)
                  }}
                  aria-label="Switch active role view"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    padding: '0.1rem 0.2rem',
                    outline: 'none',
                  }}
                >
                  <option value="recruiter" style={{ background: 'var(--bg-surface)' }}>Recruiter</option>
                  <option value="teacher" style={{ background: 'var(--bg-surface)' }}>Teacher</option>
                  <option value="candidate" style={{ background: 'var(--bg-surface)' }}>Candidate</option>
                  <option value="student" style={{ background: 'var(--bg-surface)' }}>Student</option>
                </select>
              </div>
            ) : (
              effectiveRole && (
                <Badge tone={roleMeta.tone}>
                  <span>{roleMeta.label}</span>
                </Badge>
              )
            )}

            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.82rem', padding: '0 0.25rem' }}>
              {user?.full_name || user?.username}
            </span>

            <ThemeToggle />

            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <LogOut size={13} /> Logout
            </button>
          </>
        ) : guestMode ? (
          <>
            <Link to="/dashboard" style={navLinkStyle(location.pathname === '/dashboard')}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>

            <Link to="/setup" style={navLinkStyle(location.pathname === '/setup')}>
              <PlusCircle size={14} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'Create Viva' : 'Create Screening') : 'Practice'}
            </Link>

            <span className="pn-badge pn-badge-secondary" style={{ fontSize: '0.75rem' }}>
              Preview: {roleMeta.label}
            </span>

            <button
              onClick={openGuestRoleSwitcher}
              className="btn-secondary"
              style={{ padding: '0.38rem 0.75rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={12} /> Switch Role
            </button>

            <ThemeToggle />

            <Link to="/login" className="btn-google-nav">
              <GoogleGIcon size={16} />
              <span>Sign in with Google</span>
            </Link>
          </>
        ) : (
          <>
            <ThemeToggle />

            <button
              onClick={startGuestMode}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.84rem' }}
            >
              <Eye size={14} /> Guest Mode
            </button>

            <Link to="/login" className="btn-google-nav">
              <GoogleGIcon size={16} />
              <span>Sign in with Google</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function GoogleGIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
