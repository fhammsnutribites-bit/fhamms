import React, { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api.js';

const AuthContext = createContext();
const initialState = {
  user: null,
  loading: true, // Start with loading true to check localStorage
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOAD_USER':
      return { user: action.payload, loading: false, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, loading: false, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // Verify token is still valid by making a request
          const { data } = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Update user data from server
          localStorage.setItem('user', JSON.stringify(data));
          dispatch({ type: 'LOAD_USER', payload: data });
        } catch (err) {
          // Token is invalid, clear storage
          console.error('Token validation failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token or user, set loading to false
        dispatch({ type: 'LOGOUT' });
      }
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return null;
    }
  };

  const register = async (name, email, password, isAdmin = false) => {
    dispatch({ type: 'LOADING' });
    try {
      console.log('Registering with:', { name, email, isAdmin, API_URL: `${API_URL}/api/auth/register` });
      const { data } = await axios.post(
        `${API_URL}/api/auth/register`,
        { name, email, password, isAdmin }
      );
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      return data.user;
    } catch (err) {
      console.error('Register error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Register failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
