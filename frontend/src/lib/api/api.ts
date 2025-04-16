import axios from 'axios';

// Create axios instance with base URL and default configs
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired tokens, network errors, etc.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Add redirect to login if needed
    }
    return Promise.reject(error);
  }
); 