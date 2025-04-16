'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; message?: string}>;
  register: (userData: {email: string; password: string; confirmPassword: string; firstName: string; lastName: string}) => Promise<{success: boolean; message?: string}>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log('Checking auth status, token exists:', !!token, token ? `Token prefix: ${token.slice(0, 15)}...` : '');

        if (token) {
          console.log('Fetching current user profile...');
          const response = await authService.getCurrentUser();
          console.log('Auth check response:', response);
          
          if (response.success && response.data) {
            console.log('Setting user from profile:', response.data);
            setUser(response.data);
          } else {
            // Token is invalid, remove it
            console.log('Invalid token or failed to fetch profile, removing from localStorage');
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          console.log('No token found, user is not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        // Clear token if there was an error
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Logging in with email:', email);
      
      // First try with the standard axios-based login
      let response = await authService.login(email, password);
      console.log('Initial login response from authService:', response);
      
      // If the standard login failed with invalid response, try the fetch-based approach
      if (!response.success && response.error === 'Invalid response from server') {
        console.log('Trying alternative fetch-based login method...');
        response = await authService.loginWithFetch(email, password);
        console.log('Fetch-based login response:', response);
      }
      
      if (response.success && response.data) {
        console.log('Setting user data from login response:', response.data.user);
        setUser(response.data.user);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          console.error('Token was not stored properly in localStorage');
          return { 
            success: false, 
            message: 'Failed to store authentication token' 
          };
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.error || 'Invalid email or password' 
      };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('Starting registration in AuthContext with:', userData.email);
      
      // First try with the standard axios-based registration
      let response = await authService.register(userData);
      console.log('Initial registration response from authService:', response);
      
      // If the standard registration failed with invalid response, try the fetch-based approach
      if (!response.success && response.error === 'Network error or server unavailable') {
        console.log('Trying alternative fetch-based registration method...');
        response = await authService.registerWithFetch(userData);
        console.log('Fetch-based registration response:', response);
      }
      
      if (response.success && response.data) {
        console.log('Registration successful:', response.data);
        return { success: true };
      }
      
      console.error('Registration failed with error:', response.error);
      return { 
        success: false, 
        message: response.error || 'Registration failed' 
      };
    } catch (error) {
      console.error('Registration failed with exception:', error);
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 