import axios from 'axios';
import { ApiResponse, Booking, Room, RoomSearchParams, RoomType, User } from '@/types';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  // Login user
  login: async (email: string, password: string): Promise<ApiResponse<{user: User, token: string}>> => {
    try {
      const response = await api.post<ApiResponse<{user: User, token: string}>>('/auth/login', { email, password });
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<{user: User, token: string}>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Register user
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<User>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<User>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
  },
};

// Room services
export const roomService = {
  // Get all room types
  getRoomTypes: async (): Promise<ApiResponse<RoomType[]>> => {
    try {
      const response = await api.get<ApiResponse<RoomType[]>>('/room-types');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get room type by ID
  getRoomTypeById: async (id: string): Promise<ApiResponse<RoomType>> => {
    try {
      const response = await api.get<ApiResponse<RoomType>>(`/room-types/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Search available rooms
  searchRooms: async (params: RoomSearchParams): Promise<ApiResponse<Room[]>> => {
    try {
      const response = await api.get<ApiResponse<Room[]>>('/rooms/available', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Room[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get room by ID
  getRoomById: async (id: string): Promise<ApiResponse<Room>> => {
    try {
      const response = await api.get<ApiResponse<Room>>(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Room>;
      }
      return { success: false, error: 'Network error' };
    }
  },
};

// Booking services
export const bookingService = {
  // Create new booking
  createBooking: async (bookingData: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    specialRequests?: string;
  }): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get user's bookings
  getUserBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get booking by ID
  getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Cancel booking
  cancelBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
};

// Payment services (mocked for school project)
export const paymentService = {
  // Process payment
  processPayment: async (bookingId: string, paymentDetails: {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
  }): Promise<ApiResponse<{success: boolean; transactionId: string}>> => {
    try {
      // This is a mock implementation for the school project
      // In a real-world scenario, this would connect to a payment gateway
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Always return success for mock implementation
      return {
        success: true,
        data: {
          success: true,
          transactionId: `mock-tx-${Date.now()}`
        }
      };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  },
}; 