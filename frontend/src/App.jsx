import React, { useContext } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Setup from './pages/Setup'
import Interview from './pages/Interview'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AssessEntry from './pages/AssessEntry'
import Header from './components/Header'
import Footer from './components/Footer'
import RoleSelectionModal from './components/RoleSelectionModal'
import { AuthContext } from './context/AuthContext'

const ProtectedOrGuestRoute = ({ children }) => {
  const { token, guestMode, loading } = useContext(AuthContext)
  if (loading) return null
  if (!token && !guestMode) {
    return <Navigate to="/login" replace />
  }
  return children
}

const InterviewRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext)
  const location = useLocation()
  if (loading) return null

  const params = new URLSearchParams(location.search)
  const hasClaimedSession = Boolean(
    (params.get('session') || localStorage.getItem('intervai_session')) &&
    (params.get('secret') || localStorage.getItem('intervai_session_secret'))
  )

  if (!token && !hasClaimedSession) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <>
      <Header />
      <RoleSelectionModal />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/assess/:token" element={<AssessEntry />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedOrGuestRoute>
                <Dashboard />
              </ProtectedOrGuestRoute>
            }
          />
          <Route
            path="/setup"
            element={
              <ProtectedOrGuestRoute>
                <Setup />
              </ProtectedOrGuestRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <InterviewRoute>
                <Interview />
              </InterviewRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
