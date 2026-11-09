import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext({ push: () => {}, toast: () => {} })

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((arg1, arg2 = 'info', duration = 3600) => {
    const id = Date.now() + Math.random()
    let message = ''
    let tone = arg2
    if (typeof arg1 === 'object' && arg1 !== null) {
      message = arg1.title ? `${arg1.title}: ${arg1.message || ''}` : (arg1.message || '')
      tone = arg1.type || arg1.tone || 'info'
    } else {
      message = String(arg1 || '')
    }
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const toast = push

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ push, toast }}>
      {children}
      <div className="pn-toast-stack" role="region" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertTriangle : Info
            const color = t.tone === 'success' ? 'var(--success)' : t.tone === 'error' ? 'var(--error)' : 'var(--primary)'
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="pn-toast"
              >
                <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, lineHeight: 1.45 }}>{t.message}</div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="Close notification"
                  style={{ background: 'transparent', color: 'var(--text-muted)', padding: 2 }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
