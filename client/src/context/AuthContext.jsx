import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Decode JWT to get user info (simple base64 decode of payload)
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ userId: payload.userId, email: payload.email });
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password
      });

      const { token: newToken } = response.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);

      // Decode and set user
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ userId: payload.userId, email: payload.email });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken } = response.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);

      // Decode and set user
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ userId: payload.userId, email: payload.email });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
