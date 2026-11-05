import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, LogOut } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Header() {
  const { user, logout, token } = useContext(AuthContext)

  return (
    <nav className="navbar fade-in">
      <Link to={token ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
        <div className="logo-text">
          <Briefcase size={24} color="var(--primary)" />
          IntervAI
        </div>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>Dashboard</Link>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>| {user?.username}</span>
            <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
