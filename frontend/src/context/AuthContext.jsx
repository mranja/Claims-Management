import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('claims_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('claims_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res && res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('claims_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('claims_jwt_token', jwtToken);
      localStorage.setItem('claims_user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { token: jwtToken, user: registeredUser } = res.data;
    setToken(jwtToken);
    setUser(registeredUser);
    localStorage.setItem('claims_jwt_token', jwtToken);
    localStorage.setItem('claims_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const updateStoredUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('claims_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('claims_jwt_token');
    localStorage.removeItem('claims_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isPatient: user?.role === 'patient',
    isInsurer: user?.role === 'insurer',
    login,
    register,
    updateStoredUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
