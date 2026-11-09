import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Eye, RefreshCw, LayoutDashboard, Plus, Mic } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { PLATFORM_NAME } from '../brand'

const ROLE_LABELS = {
  teacher: 'Faculty',
  recruiter: 'Recruiter',
  student: 'Student',
  candidate: 'Candidate',
}

export default function Header() {
  const {
    user,
    logout,
    token,
    guestMode,
    effectiveRole,
    isAssessor,
    isSuperAdmin,
    switchSuperAdminRole,
    startGuestMode,
    openGuestRoleSwitcher,
  } = useContext(AuthContext)

  const location = useLocation()
  const roleLabel = ROLE_LABELS[effectiveRole] || 'Candidate'

  const navLinkStyle = (active) => ({
    textDecoration: 'none',
    color: active ? 'var(--text)' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 500,
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-btn)',
    background: active ? 'var(--bg-subtle)' : 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent',
  })

  return (
    <nav className="navbar" aria-label="Main navigation">
      {/* Brand Logo */}
      <Link to={token || guestMode ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: 'var(--sidebar)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--surface)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <Mic size={16} strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              {PLATFORM_NAME}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              Voice assessment &amp; viva studio
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={navLinkStyle(location.pathname === '/dashboard')}>
              <LayoutDashboard size={16} strokeWidth={1.5} /> Workspace
            </Link>

            <Link to="/setup" style={navLinkStyle(location.pathname === '/setup')}>
              <Plus size={16} strokeWidth={1.5} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'New viva link' : 'New screening link') : 'New practice run'}
            </Link>

            {isSuperAdmin ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-btn)',
                  padding: '4px 10px',
                }}
                title="Role view switcher"
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-soft-text)' }}>
                  Role view:
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
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    width: 'auto',
                  }}
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="teacher">Faculty</option>
                  <option value="candidate">Candidate</option>
                  <option value="student">Student</option>
                </select>
              </div>
            ) : (
              effectiveRole && (
                <span className="pn-badge pn-badge-primary">
                  {roleLabel}
                </span>
              )
            )}

            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '13px', padding: '0 4px' }}>
              {user?.full_name || user?.username}
            </span>

            <button
              type="button"
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <LogOut size={14} strokeWidth={1.5} /> Sign out
            </button>
          </>
        ) : guestMode ? (
          <>
            <Link to="/dashboard" style={navLinkStyle(location.pathname === '/dashboard')}>
              <LayoutDashboard size={16} strokeWidth={1.5} /> Workspace
            </Link>

            <Link to="/setup" style={navLinkStyle(location.pathname === '/setup')}>
              <Plus size={16} strokeWidth={1.5} />
              {isAssessor ? (effectiveRole === 'teacher' ? 'New viva link' : 'New screening link') : 'Practice'}
            </Link>

            <span className="pn-badge pn-badge-primary">
              Guest preview: {roleLabel}
            </span>

            <button
              type="button"
              onClick={openGuestRoleSwitcher}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <RefreshCw size={14} strokeWidth={1.5} /> Switch role
            </button>

            <Link to="/login" className="btn-google-nav">
              <GoogleGIcon size={16} />
              <span>Sign in</span>
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={startGuestMode}
              className="btn-secondary"
            >
              <Eye size={16} strokeWidth={1.5} /> Guest preview
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
