import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleClientId, setGoogleClientId] = useState('');

  // Guest Mode for Hackathon Judges / Explorers
  const [guestMode, setGuestMode] = useState(() => sessionStorage.getItem('intervai_guest_mode') === 'true');
  const [guestRole, setGuestRole] = useState(() => sessionStorage.getItem('intervai_guest_role') || '');
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Modal shown when a Guest Mode visitor clicks "Conduct Interview" or "Start Practice"
  const [authPromptModal, setAuthPromptModal] = useState({ open: false, reason: '' });

  const navigate = useNavigate();

  const getBaseUrl = () => (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : '');

  // Load Google Client ID from backend config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/auth/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.google_client_id) {
            setGoogleClientId(data.google_client_id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch auth config:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Real login exits Guest Mode
      sessionStorage.removeItem('intervai_guest_mode');
      sessionStorage.removeItem('intervai_guest_role');
      setGuestMode(false);
      setGuestRole('');
      fetchUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Whenever user has needs_onboarding=true OR guestMode is active without a guestRole, redirect to /select-role
  useEffect(() => {
    if (user && (user.needs_onboarding || !user.role)) {
      navigate('/select-role');
    } else if (!token && guestMode && !guestRole) {
      navigate('/select-role');
    }
  }, [user, token, guestMode, guestRole, navigate]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.needs_onboarding || !data.role) {
          navigate('/select-role');
        }
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${getBaseUrl()}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Google Sign-In failed');

    setAuthPromptModal({ open: false, reason: '' });
    setUser(data.user);
    setToken(data.access_token);
    if (data.needs_onboarding || !data.user?.role) {
      navigate('/select-role');
    }
    return data;
  };

  const loginWithPassword = async (username, password) => {
    const res = await fetch(`${getBaseUrl()}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');

    setAuthPromptModal({ open: false, reason: '' });
    setUser(data.user);
    setToken(data.access_token);
    if (data.needs_onboarding || !data.user?.role) {
      navigate('/select-role');
    }
    return data;
  };

  const registerWithPassword = async ({ username, email, password, role, full_name, organization }) => {
    const res = await fetch(`${getBaseUrl()}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role, full_name, organization })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');

    setAuthPromptModal({ open: false, reason: '' });
    setUser(data.user);
    setToken(data.access_token);
    if (data.user?.needs_onboarding || !data.user?.role) {
      navigate('/select-role');
    }
    return data;
  };

  const completeOnboarding = async ({ role, full_name, organization }) => {
    if (token) {
      const res = await fetch(`${getBaseUrl()}/api/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, full_name, organization })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save role');
      setUser(data.user);
      setShowRoleModal(false);
      return data.user;
    } else if (guestMode || !token) {
      sessionStorage.setItem('intervai_guest_mode', 'true');
      sessionStorage.setItem('intervai_guest_role', role);
      setGuestMode(true);
      setGuestRole(role);
      setShowRoleModal(false);
      return { role, isGuest: true };
    }
  };

  const startGuestMode = () => {
    sessionStorage.setItem('intervai_guest_mode', 'true');
    setGuestMode(true);
    navigate('/select-role');
  };

  const openGuestRoleSwitcher = () => {
    sessionStorage.setItem('intervai_guest_mode', 'true');
    setGuestMode(true);
    navigate('/select-role');
  };

  const triggerAuthRequired = (reason = 'Sign in with Google is required to create or practice live voice interviews.') => {
    setAuthPromptModal({ open: true, reason });
  };

  const closeAuthPrompt = () => {
    setAuthPromptModal({ open: false, reason: '' });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('intervai_guest_mode');
    sessionStorage.removeItem('intervai_guest_role');
    setGuestMode(false);
    setGuestRole('');
    setShowRoleModal(false);
    navigate('/');
  };

  // Effective user object (either real authenticated user or simulated Guest Explorer)
  const isSuperAdmin = Boolean(user?.is_super_admin);
  const effectiveRole = user?.role || (guestMode ? guestRole : null);
  const isAssessor = isSuperAdmin || effectiveRole === 'recruiter' || effectiveRole === 'teacher';

  const switchSuperAdminRole = async (targetRole) => {
    if (!token || !isSuperAdmin) return;
    try {
      const res = await fetch(`${getBaseUrl()}/api/super-admin/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to switch role');
      if (data.access_token) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Super Admin switch role error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        googleClientId,
        loginWithGoogle,
        loginWithPassword,
        registerWithPassword,
        completeOnboarding,
        guestMode,
        guestRole,
        effectiveRole,
        isAssessor,
        isSuperAdmin,
        switchSuperAdminRole,
        startGuestMode,
        openGuestRoleSwitcher,
        showRoleModal,
        setShowRoleModal,
        authPromptModal,
        triggerAuthRequired,
        closeAuthPrompt,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
