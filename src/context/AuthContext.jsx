import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('campus_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Session expired or invalid, logging out', err);
        localStorage.removeItem('campus_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.loginUser({ email, password });
      localStorage.setItem('campus_auth_token', response.token);
      setUser({
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        phone: response.phone,
        studentId: response.studentId,
        role: response.role,
      });
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.registerUser(userData);
      localStorage.setItem('campus_auth_token', response.token);
      setUser({
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        phone: response.phone,
        studentId: response.studentId,
        role: response.role,
      });
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logoutUser();
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('campus_auth_token');
      setUser(null);
    }
  };

  const updateProfile = async (fullName, phone) => {
    await api.updateProfile({ fullName, phone });
    setUser((prev) => (prev ? { ...prev, fullName, phone } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
