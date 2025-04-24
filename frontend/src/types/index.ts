export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  imageUrl?: string;
  amenities?: string[];
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId?: string;
  roomType?: RoomType;
  type?: string;
  pricePerNight?: number;
  maxGuests?: number;
  amenities?: string;
  availabilityStatus?: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithAvailability extends Room {
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  roomId: string;
  room?: Room;
  roomTypeId: string;
  roomTypeName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  numberOfGuests?: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSearchParams {
  checkInDate?: string;
  checkOutDate?: string;
  maxGuests?: number;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  amenities?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
} 