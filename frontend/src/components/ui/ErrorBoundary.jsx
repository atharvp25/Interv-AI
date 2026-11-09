import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured in ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            width: '100%',
          }}
        >
          <div
            className="panel"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
              Temporary Display Issue
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              We encountered a minor rendering issue while displaying this view. Your session and data remain safe.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem' }}
              >
                <RotateCcw size={15} /> Reload View
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/' }}
                className="btn-secondary"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem' }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

