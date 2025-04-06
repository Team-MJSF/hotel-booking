/**
 * Represents a user in the system
 */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
} 