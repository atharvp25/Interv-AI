import React, { useContext, Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Setup from './pages/Setup'
import Interview from './pages/Interview'
import Login from './pages/Login'
import Register from './pages/Register'
import AssessEntry from './pages/AssessEntry'
import Header from './components/Header'
import Footer from './components/Footer'
import RoleSelectionModal from './components/RoleSelectionModal'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { SkeletonCard } from './components/ui/Skeleton'
import { AuthContext } from './context/AuthContext'

const Dashboard = lazy(() => import('./pages/Dashboard'))

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

const PageWrap = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
  >
    {children}
  </motion.div>
)

function App() {
  const location = useLocation()
  return (
    <>
      <Header />
      <RoleSelectionModal />
      <main>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="pn-container" style={{ paddingTop: 48, display: 'grid', gap: 16 }}>
                <SkeletonCard lines={4} />
                <SkeletonCard lines={3} />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrap><Home /></PageWrap>} />
                <Route path="/login" element={<PageWrap><Login /></PageWrap>} />
                <Route path="/register" element={<PageWrap><Register /></PageWrap>} />
                <Route path="/assess/:token" element={<PageWrap><AssessEntry /></PageWrap>} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedOrGuestRoute>
                      <PageWrap><Dashboard /></PageWrap>
                    </ProtectedOrGuestRoute>
                  }
                />
                <Route
                  path="/setup"
                  element={
                    <ProtectedOrGuestRoute>
                      <PageWrap><Setup /></PageWrap>
                    </ProtectedOrGuestRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <InterviewRoute>
                      <PageWrap><Interview /></PageWrap>
                    </InterviewRoute>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  )
}

export default App
