import React, { memo, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

const getInitial = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark'

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitial)

  useEffect(() => {
    const c = document.documentElement.classList
    c.remove('dark', 'light')
    c.add(theme)
    try { localStorage.setItem('pn_theme', theme) } catch (e) {}
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'relative', width: 64, height: 34, padding: 3, borderRadius: 999,
        background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
        display: 'flex', justifyContent: isDark ? 'flex-end' : 'flex-start', alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: isDark ? 'linear-gradient(135deg,#7C5CFF,#22D3B6)' : 'linear-gradient(135deg,#FFB347,#FF9F43)',
          color: '#fff', boxShadow: isDark ? '0 0 14px rgba(124,92,255,.6)' : '0 0 14px rgba(255,159,67,.6)',
        }}
      >
        <motion.span key={theme} initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.35 }}>
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </motion.span>
      </motion.span>
    </button>
  )
}

export default memo(ThemeToggle)

