import { create } from 'zustand';
import { User } from '@/types/user';
import { api } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isAuthenticated: true, token, isLoading: false });
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<LoginResponse>('/auth/register', userData);
      const { user, token } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isAuthenticated: true, token, isLoading: false });
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    set({ user: null, isAuthenticated: false, token: null, error: null });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // First check if we have a token in localStorage
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        set({ isLoading: false });
        return;
      }
      
      // Token exists, verify it with the server
      const response = await api.get<User>('/auth/me');
      const storedUser = localStorage.getItem('user');
      
      if (response.data && storedUser) {
        set({
          user: response.data,
          isAuthenticated: true,
          token: storedToken,
          isLoading: false
        });
      } else {
        // If token is invalid, clear everything
        get().logout();
        set({ isLoading: false });
      }
    } catch (error: any) {
      // If any error occurs during verification, log the user out
      get().logout();
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Authentication failed. Please log in again.'
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useAuthStore; 