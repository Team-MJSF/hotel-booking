import { api } from './client';
import type { UserProfile } from './authService';

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const usersService = {
  updateCurrentUser: async (userData: UpdateUserRequest): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/users/profile', userData);
    return response.data;
  },
  
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/users/password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  },
  
  // Admin functions
  getAllUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<UserProfile>> => {
    const response = await api.get<PaginatedResponse<UserProfile>>('/users', {
      params: { page, limit }
    });
    return response.data;
  },
  
  getUserById: async (id: number): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData: any): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users', userData);
    return response.data;
  },
  
  updateUser: async (id: number, userData: any): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export default usersService; 