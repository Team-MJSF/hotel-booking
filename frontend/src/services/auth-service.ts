import { api } from '@/lib/api/client';
import { User } from '@/types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  /**
   * Login a user
   * @param credentials - The login credentials
   * @returns Promise with user data and JWT token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * @param userData - The user registration data
   * @returns Promise with user data and JWT token
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout the current user (client-side)
   * Note: Primarily manages local state as JWT tokens are stateless
   */
  logout: (): void => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get the current authenticated user
   * @returns Promise with user data
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Verify if a token is valid
   * @param token - The JWT token to verify
   * @returns Promise with verification result
   */
  verifyToken: async (token?: string): Promise<{ valid: boolean }> => {
    try {
      const response = await api.post<{ valid: boolean }>('/auth/verify-token', { token });
      return response.data;
    } catch {
      return { valid: false };
    }
  },

  /**
   * Verify email with confirmation token
   * @param token - The verification token from email
   * @returns Promise with success message
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Refresh the auth token
   * @returns Promise with new token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/auth/refresh-token');
    return response.data;
  },

  /**
   * Check if the user is authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
}; 