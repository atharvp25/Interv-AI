import React, { useEffect, useRef, useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function GoogleSignInButton({ onSuccessRedirect, text = 'continue_with' }) {
  const { googleClientId, loginWithGoogle } = useContext(AuthContext);
  const buttonContainerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!googleClientId) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (window.google && window.google.accounts && window.google.accounts.id && buttonContainerRef.current) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              setError('');
              try {
                const data = await loginWithGoogle(response.credential);
                if (onSuccessRedirect) {
                  onSuccessRedirect(data);
                }
              } catch (err) {
                setError(err.message || 'Google Sign-In failed');
              }
            },
          });

          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text,
            shape: 'rectangular',
          });
        } catch (err) {
          console.error('Error initializing Google Sign-In button:', err);
        }
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId, onSuccessRedirect, text]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          width: '100%',
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div
        ref={buttonContainerRef}
        style={{
          minHeight: '44px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </div>
  );
}

