import { api } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens in localStorage
    localStorage.setItem(
      process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token', 
      response.data.access_token
    );
    localStorage.setItem('refresh_token', response.data.refresh_token);
    
    return response.data;
  },
  
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens in localStorage if the API returns them on register
    if (response.data.access_token && response.data.refresh_token) {
      localStorage.setItem(
        process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token', 
        response.data.access_token
      );
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        // Invalidate the refresh token on the server
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear tokens from localStorage
    localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token');
    localStorage.removeItem('refresh_token');
  },
  
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token');
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    
    // Update the tokens in localStorage
    localStorage.setItem(
      process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token', 
      response.data.access_token
    );
    
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  }
};

export default authService; 