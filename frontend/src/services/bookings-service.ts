import { API_URL } from '@/config/constants';
import { Booking, BookingStatus } from '@/types/booking';

interface CreateBookingPayload {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
}

interface UpdateBookingPayload {
  status?: BookingStatus;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  specialRequests?: string;
}

class BookingsService {
  private readonly baseUrl = `${API_URL}/bookings`;

  async getBookings(status?: BookingStatus): Promise<Booking[]> {
    let url = this.baseUrl;
    if (status) {
      url += `?status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return response.json();
  }

  async getBookingById(id: number): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch booking');
    }

    return response.json();
  }

  async createBooking(bookingData: CreateBookingPayload): Promise<Booking> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create booking');
    }

    return response.json();
  }

  async updateBooking(id: number, bookingData: UpdateBookingPayload): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error('Failed to update booking');
    }

    return response.json();
  }

  async cancelBooking(id: number): Promise<Booking> {
    return this.updateBooking(id, { status: 'cancelled' });
  }

  async deleteBooking(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete booking');
    }
  }
}

export const bookingsService = new BookingsService(); 