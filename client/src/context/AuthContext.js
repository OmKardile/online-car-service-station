import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';

// Use port 5001 since that's where your server is running
const SERVER_PORT = 5001;

const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${SERVER_PORT}/api`;
    }
    return `http://localhost:${SERVER_PORT}/api`;
  }
  return 'https://your-production-server.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  isLoading: true,
  apiUrl: API_BASE_URL,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.defaults.timeout = 10000;
    console.log('🔗 API Base URL:', API_BASE_URL);
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { 
        email, 
        password 
      });
      
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ Login successful');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      
      let errorMessage = 'Login failed';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5001.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Check if server is running and URL is correct.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration to:', `${API_BASE_URL}/auth/register`);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      console.log('✅ Registration successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      
      let errorMessage = 'Registration failed';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5001.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Check if server is running and URL is correct.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log('🚪 User logged out');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    apiUrl: API_BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};