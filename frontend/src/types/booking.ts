/**
 * Represents a booking in the system
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Define Room interface inline
export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  type: string;
  images: string[];
  amenities: string[];
  size: number;
  hasBalcony: boolean;
  hasSeaView: boolean;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations - inline definitions to avoid import issues
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    phoneNumber?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
  };
} 