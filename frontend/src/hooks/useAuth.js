import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

/**
 * Custom hook to manage authentication state and operations
 */
export function useAuth() {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    try {
      const me = await authService.getMe();
      if (me) {
        setUser(me);
        setIsAuthenticated(true);
      }
    } catch {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password tidak sesuai.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.updateProfile(payload);
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui profil admin.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthExpired = (e) => {
      setUser(null);
      setIsAuthenticated(false);
      setError(e.detail?.message || 'Sesi login telah berakhir.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateProfile,
    checkAuth,
  };
}
