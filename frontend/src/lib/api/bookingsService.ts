import { api } from './client';
import { Room } from './roomsService';

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  guestCount: number;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  specialRequests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingSearchParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
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

const bookingsService = {
  getUserBookings: async (params?: BookingSearchParams): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
    return response.data;
  },
  
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },
  
  createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', bookingData);
    return response.data;
  },
  
  updateBooking: async (id: number, bookingData: UpdateBookingRequest): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}`, bookingData);
    return response.data;
  },
  
  cancelBooking: async (id: number): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}`, { status: 'cancelled' });
    return response.data;
  },
  
  // Admin functions
  getAllBookings: async (params?: BookingSearchParams): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings/all', { params });
    return response.data;
  },
  
  deleteBooking: async (id: number): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  }
};

export default bookingsService; 