import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://13.126.101.248',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle response errors

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

