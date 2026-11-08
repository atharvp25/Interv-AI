import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, LogOut, Eye, RefreshCw } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const ROLE_LABELS = {
  teacher: '🎓 Teacher',
  recruiter: '💼 Recruiter',
  student: '🧑‍🎓 Student',
  candidate: '👨‍💻 Candidate',
}

export default function Header() {
  const {
    user,
    logout,
    token,
    guestMode,
    guestRole,
    effectiveRole,
    startGuestMode,
    openGuestRoleSwitcher,
  } = useContext(AuthContext)

  return (
    <nav className="navbar fade-in">
      <Link to={token || guestMode ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
        <div className="logo-text">
          <Briefcase size={24} color="var(--primary)" />
          IntervAI
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>
              Dashboard
            </Link>
            <Link to="/setup" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>
              {effectiveRole === 'recruiter' || effectiveRole === 'teacher' ? 'Create / Practice' : 'Practice'}
            </Link>
            {effectiveRole && (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '14px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--primary)',
                }}
              >
                {ROLE_LABELS[effectiveRole] || effectiveRole}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
              {user?.full_name || user?.username}
            </span>
            <button onClick={logout} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : guestMode ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>
              Dashboard
            </Link>
            <Link to="/setup" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>
              Setup Preview
            </Link>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.25rem 0.7rem',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.14)',
                color: '#d97706',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Eye size={14} /> Guest: {ROLE_LABELS[guestRole] || 'Select Role'}
            </span>
            <button
              onClick={openGuestRoleSwitcher}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              <RefreshCw size={14} /> Switch Role
            </button>
            <Link to="/login" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Sign In with Google
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={startGuestMode}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Eye size={16} /> Guest Mode 
            </button>
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Sign In with Google
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
