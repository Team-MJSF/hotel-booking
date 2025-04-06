import { api } from '@/lib/api/client';
import { User } from '@/types/user';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const usersService = {
  /**
   * Get the current user's profile
   * @returns Promise with user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /**
   * Update the current user's profile
   * @param data - The profile data to update
   * @returns Promise with updated user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  /**
   * Change the current user's password
   * @param data - The password change data
   * @returns Promise with success message
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  /**
   * Request a password reset for a user
   * @param email - The user's email
   * @returns Promise with success message
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/users/reset-password-request', { email });
    return response.data;
  },

  /**
   * Reset a user's password with reset token
   * @param token - The reset token from email
   * @param newPassword - The new password
   * @returns Promise with success message
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/users/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  /**
   * Delete the current user's account
   * @returns Promise with success message
   */
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/users/me');
    return response.data;
  }
}; 