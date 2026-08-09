import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides authentication state.
 * On mount, checks /api/auth/me to restore session from the HttpOnly cookie.
 * Exposes login, register, logout, and the current user + loading state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    api.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email, newPassword, role) => {
    const data = await api.post('/auth/reset-password', { email, newPassword, role });
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state and actions.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
