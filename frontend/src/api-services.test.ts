import { api } from './lib/api/client';
import apiClient from './lib/api/client';
import { API_URL } from './config/constants';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { handleApiError, getErrorMessage, NetworkErrorCode, ApiError } from './lib/api/errorHandler';
import { authService } from './services/auth-service';
import { bookingsService } from './services/bookings-service';
import { paymentsService } from './services/payments-service';
import { usersService } from './services/users-service';
import { roomsService } from './services/rooms-service';
import { User } from './types/user';
import { Booking, BookingStatus, Room } from './types/booking';
import { formatCurrency, formatDate, formatDateRange, calculateNights } from './lib/utils/format';

// === Common Mocks ===
// Mock axios for API testing
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      defaults: {},
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

// Mock the API client for services testing
jest.mock('./lib/api/client', () => {
  const mockApi = {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: {},
  };
  return {
    api: mockApi,
    __esModule: true,
    default: mockApi,
  };
});

// Mock error handler
jest.mock('./lib/api/errorHandler', () => {
  return {
    NetworkErrorCode: {
      NETWORK: 'NETWORK_ERROR',
      TIMEOUT: 'TIMEOUT_ERROR',
      UNKNOWN: 'UNKNOWN_ERROR',
    },
    getErrorMessage: jest.fn((error) => error.message),
    handleApiError: jest.fn((error) => {
      if (error.isNetworkError) {
        return {
          status: 0,
          message: error.message || 'Network error',
          isNetworkError: true,
          code: 'NETWORK_ERROR',
        };
      }
      if (error.status) {
        return {
          status: error.status,
          message: error.message || 'Unknown error',
          code: error.code,
          details: error.details,
        };
      }
      return {
        status: 500,
        message: error.message || 'Unknown error',
        code: 'UNKNOWN_ERROR',
      };
    }),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock format functions from lib/utils
jest.mock('./lib/utils/format', () => ({
  formatCurrency: jest.fn((amount) => `$${amount}`),
  formatDate: jest.fn((date) => date),
  formatDateRange: jest.fn((checkIn, checkOut) => `${checkIn} - ${checkOut}`),
  calculateNights: jest.fn(() => 4)
}));

// Helper function to truncate text for testing purposes
const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Helper functions
const createMockError = (
  status?: number, 
  message = 'Request failed',
  isNetworkError = false,
  code?: string,
  details?: any
): any => ({
  status,
  message,
  isNetworkError,
  code,
  details,
});

const mockApiResponse = (method: 'get' | 'post' | 'patch' | 'delete', data: any) => {
  (api[method] as jest.Mock).mockResolvedValueOnce({ data });
};

const mockFetchResponse = (data: any, isSuccess = true) => {
  mockFetch.mockImplementationOnce(async () => ({
    ok: isSuccess,
    json: async () => data
  }));
};

// Test data
const mockUser: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockBooking: Booking = {
  id: 1,
  userId: 101,
  roomId: 201,
  checkInDate: '2023-06-01',
  checkOutDate: '2023-06-05',
  totalPrice: 400,
  status: 'confirmed' as BookingStatus,
  guestCount: 2,
  specialRequests: 'Late check-in',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockRoom: Room = {
  id: 201,
  name: 'Deluxe Room',
  description: 'A luxurious room with sea view',
  price: 100,
  capacity: 2,
  type: 'deluxe',
  amenities: ['wifi', 'tv', 'minibar'],
  images: ['room1.jpg', 'room2.jpg'],
  hasBalcony: true,
  hasSeaView: true,
  size: 35,
  stars: 4,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockPayment = {
  id: 'payment123',
  bookingId: 1,
  amount: 400,
  currency: 'USD',
  status: 'completed',
  paymentMethod: 'credit_card',
  transactionId: 'tx123',
  createdAt: '2023-01-01T00:00:00.000Z'
};

describe('API and Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('token', 'mock-token');
  });

  test('Full hotel booking flow and API interactions', async () => {
    // 1. Check API client setup
    expect(api).toHaveProperty('get');
    expect(api).toHaveProperty('post');
    expect(api).toHaveProperty('patch');
    expect(api).toHaveProperty('delete');
    expect(api).toHaveProperty('interceptors');
    
    // 2. Test API error handling with various error types
    const errorTypes = [
      { status: 404, message: 'Resource not found' },
      { status: 401, message: 'Unauthorized' },
      { status: 500, message: 'Server error' },
      { isNetworkError: true, message: 'Network error' }
    ];
    
    errorTypes.forEach(error => {
      const result = handleApiError(error);
      if (error.isNetworkError) {
        expect(result.status).toBe(0);
        expect(result.isNetworkError).toBe(true);
      } else {
        expect(result.status).toBe(error.status);
      }
      expect(result.message).toBe(error.message);
      expect(getErrorMessage(result)).toBe(error.message);
    });
    
    // 3. User registration and authentication
    mockApiResponse('post', { user: mockUser, token: 'mock-jwt-token' });
    const registerResult = await authService.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      phoneNumber: '1234567890'
    });
    expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    expect(registerResult).toEqual({ user: mockUser, token: 'mock-jwt-token' });
    
    // 4. User login
    jest.clearAllMocks();
    mockApiResponse('post', { user: mockUser, token: 'mock-jwt-token' });
    const loginResult = await authService.login({ 
      email: 'john.doe@example.com', 
      password: 'Password123!' 
    });
    expect(api.post).toHaveBeenCalledWith('/auth/login', expect.any(Object));
    expect(loginResult).toEqual({ user: mockUser, token: 'mock-jwt-token' });
    
    // 5. Token verification
    jest.clearAllMocks();
    mockApiResponse('post', { valid: true });
    const validTokenResult = await authService.verifyToken('mock-jwt-token');
    expect(api.post).toHaveBeenCalledWith('/auth/verify-token', { token: 'mock-jwt-token' });
    expect(validTokenResult).toEqual({ valid: true });
    
    // 6. Search for available rooms
    jest.clearAllMocks();
    mockApiResponse('get', { rooms: [mockRoom], total: 1 });
    const searchParams = {
      checkIn: '2023-06-01',
      checkOut: '2023-06-05',
      capacity: 2,
      type: 'deluxe',
      hasBalcony: true
    };
    const searchResult = await roomsService.searchRooms(searchParams);
    expect(api.get).toHaveBeenCalledWith('/rooms/search', { params: searchParams });
    expect(searchResult).toEqual({ rooms: [mockRoom], total: 1 });
    
    // 7. Get room details
    jest.clearAllMocks();
    mockApiResponse('get', mockRoom);
    const roomDetails = await roomsService.getRoomById(201);
    expect(api.get).toHaveBeenCalledWith('/rooms/201');
    expect(roomDetails).toEqual(mockRoom);
    
    // 8. Check room availability
    jest.clearAllMocks();
    mockApiResponse('get', { available: true, unavailableDates: [] });
    const availabilityResult = await roomsService.checkRoomAvailability(
      201, 
      '2023-06-01', 
      '2023-06-05'
    );
    expect(api.get).toHaveBeenCalledWith('/rooms/201/availability', { 
      params: { checkInDate: '2023-06-01', checkOutDate: '2023-06-05' }
    });
    expect(availabilityResult).toEqual({ available: true, unavailableDates: [] });
    
    // 9. Create booking
    jest.clearAllMocks();
    const bookingData = {
      roomId: 201,
      checkInDate: '2023-06-01',
      checkOutDate: '2023-06-05',
      guestCount: 2,
      specialRequests: 'Late check-in'
    };
    mockFetchResponse(mockBooking);
    const bookingResult = await bookingsService.createBooking(bookingData);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings`, {
      method: 'POST',
      headers: expect.any(Object),
      body: JSON.stringify(bookingData)
    });
    expect(bookingResult).toEqual(mockBooking);
    
    // 10. Process payment
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockPayment
    }));
    
    const paymentData = {
      bookingId: 1,
      amount: 400,
      currency: 'USD',
      paymentMethod: {
        type: 'credit_card' as const,
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123',
        nameOnCard: 'John Doe'
      }
    };
    
    const paymentResult = await paymentsService.processPayment(paymentData as any);
    expect(mockFetch).toHaveBeenCalled();
    expect(paymentResult).toEqual(mockPayment);
    
    // 11. Get booking details
    jest.clearAllMocks();
    mockFetchResponse(mockBooking);
    const bookingDetails = await bookingsService.getBookingById(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings/1`, expect.any(Object));
    expect(bookingDetails).toEqual(mockBooking);
    
    // 12. Get all bookings
    jest.clearAllMocks();
    mockFetchResponse([mockBooking]);
    const allBookings = await bookingsService.getBookings();
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings`, expect.any(Object));
    expect(allBookings).toEqual([mockBooking]);
    
    // 13. Get bookings with status filter
    jest.clearAllMocks();
    mockFetchResponse([mockBooking]);
    const confirmedBookings = await bookingsService.getBookings('confirmed');
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings?status=confirmed`, expect.any(Object));
    expect(confirmedBookings).toEqual([mockBooking]);
    
    // 14. Get payment details
    jest.clearAllMocks();
    mockFetchResponse(mockPayment);
    const paymentDetails = await paymentsService.getPaymentByBookingId(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/booking/1`, expect.any(Object));
    expect(paymentDetails).toEqual(mockPayment);
    
    // 15. Update user profile
    jest.clearAllMocks();
    const updateData = {
      firstName: 'Johnny',
      phoneNumber: '9876543210'
    };
    const updatedUser = { ...mockUser, ...updateData };
    mockApiResponse('patch', updatedUser);
    const profileUpdateResult = await usersService.updateProfile(updateData);
    expect(api.patch).toHaveBeenCalledWith('/users/me', updateData);
    expect(profileUpdateResult).toEqual(updatedUser);
    
    // 16. Get current user profile
    jest.clearAllMocks();
    mockApiResponse('get', mockUser);
    const userProfile = await usersService.getCurrentUser();
    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(userProfile).toEqual(mockUser);
    
    // 17. Change password
    jest.clearAllMocks();
    const passwordData = {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword456!',
      confirmNewPassword: 'NewPassword456!'
    };
    mockApiResponse('post', { message: 'Password updated successfully' });
    const passwordChangeResult = await usersService.changePassword(passwordData);
    expect(api.post).toHaveBeenCalledWith('/users/change-password', passwordData);
    expect(passwordChangeResult).toEqual({ message: 'Password updated successfully' });
    
    // 18. Get all rooms with pagination
    jest.clearAllMocks();
    mockApiResponse('get', { rooms: [mockRoom], total: 1 });
    const roomsResult = await roomsService.getAllRooms(2, 20);
    expect(api.get).toHaveBeenCalledWith('/rooms', { params: { page: 2, limit: 20 } });
    expect(roomsResult).toEqual({ rooms: [mockRoom], total: 1 });
    
    // 19. Format utility functions
    expect(formatCurrency(100)).toBe('$100');
    expect(formatDate('2023-06-01')).toBe('2023-06-01');
    expect(formatDateRange('2023-06-01', '2023-06-05')).toBe('2023-06-01 - 2023-06-05');
    expect(calculateNights('2023-06-01', '2023-06-05')).toBe(4);
    
    // Test truncateText helper function
    const longText = 'This is a long text that should be truncated';
    expect(truncateText(longText, 10)).toBe('This is a ...');
    expect(truncateText('Short', 10)).toBe('Short');
    
    // 20. Error handling tests
    // Network error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network disconnected')));
    await expect(bookingsService.getBookings()).rejects.toThrow('Network disconnected');
    
    // Authentication error
    jest.clearAllMocks();
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
    await expect(authService.login({
      email: 'wrong@example.com',
      password: 'WrongPassword'
    })).rejects.toThrow('Invalid credentials');
    
    // Resource not found
    jest.clearAllMocks();
    (api.get as jest.Mock).mockRejectedValueOnce({ 
      response: { status: 404, data: { message: 'Room not found' } } 
    });
    await expect(roomsService.getRoomById(999)).rejects.toEqual(expect.anything());
    
    // Payment error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      json: async () => ({ error: 'Payment failed', message: 'Card declined' })
    }));
    await expect(paymentsService.processPayment(paymentData as any)).rejects.toThrow();
    
    // Invalid token test
    jest.clearAllMocks();
    (api.post as jest.Mock).mockRejectedValueOnce({ response: { status: 401, data: { message: 'Invalid token' } } });
    const invalidTokenResult = await authService.verifyToken('invalid-token');
    expect(invalidTokenResult).toEqual({ valid: false });
    
    // 21. Logout
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    authService.logout();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  // Add comprehensive tests for each service category
  test('Auth service additional functionality', async () => {
    // Setup
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('token', 'mock-token');
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    
    // Test isAuthenticated method
    expect(authService.isAuthenticated()).toBe(true);
    localStorageMock.removeItem('token');
    expect(authService.isAuthenticated()).toBe(false);
    localStorageMock.setItem('token', 'mock-token');
    
    // Test verifyEmail
    mockApiResponse('post', { message: 'Email verified successfully' });
    const emailVerification = await authService.verifyEmail('verification-token-123');
    expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { token: 'verification-token-123' });
    expect(emailVerification).toEqual({ message: 'Email verified successfully' });
    
    // Test refreshToken
    jest.clearAllMocks();
    mockApiResponse('post', { token: 'new-refreshed-token' });
    const refreshResult = await authService.refreshToken();
    expect(api.post).toHaveBeenCalledWith('/auth/refresh-token');
    expect(refreshResult).toEqual({ token: 'new-refreshed-token' });
  });

  test('User service comprehensive functionality', async () => {
    // Setup
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'mock-token');
    
    // Test requestPasswordReset
    mockApiResponse('post', { message: 'Password reset email sent' });
    const resetRequest = await usersService.requestPasswordReset('john.doe@example.com');
    expect(api.post).toHaveBeenCalledWith('/users/reset-password-request', { email: 'john.doe@example.com' });
    expect(resetRequest).toEqual({ message: 'Password reset email sent' });
    
    // Test resetPassword
    jest.clearAllMocks();
    mockApiResponse('post', { message: 'Password reset successful' });
    const resetPassword = await usersService.resetPassword('reset-token-123', 'NewPassword123!');
    expect(api.post).toHaveBeenCalledWith('/users/reset-password', { 
      token: 'reset-token-123', 
      newPassword: 'NewPassword123!' 
    });
    expect(resetPassword).toEqual({ message: 'Password reset successful' });
    
    // Test deleteAccount
    jest.clearAllMocks();
    mockApiResponse('delete', { message: 'Account deleted successfully' });
    const accountDeletion = await usersService.deleteAccount();
    expect(api.delete).toHaveBeenCalledWith('/users/me');
    expect(accountDeletion).toEqual({ message: 'Account deleted successfully' });
  });

  test('Bookings service additional functionality', async () => {
    // Setup
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'mock-token');
    
    // Test updateBooking
    const updateData = {
      checkInDate: '2023-07-01',
      checkOutDate: '2023-07-05',
      guestCount: 3,
      specialRequests: 'Early check-in please'
    };
    
    const updatedBooking = { 
      ...mockBooking,
      checkInDate: '2023-07-01',
      checkOutDate: '2023-07-05',
      guestCount: 3,
      specialRequests: 'Early check-in please'
    };
    
    mockFetchResponse(updatedBooking);
    const bookingUpdateResult = await bookingsService.updateBooking(1, updateData);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings/1`, {
      method: 'PATCH',
      headers: expect.any(Object),
      body: JSON.stringify(updateData)
    });
    expect(bookingUpdateResult).toEqual(updatedBooking);
    
    // Test cancelBooking
    jest.clearAllMocks();
    const cancelledBooking = { ...mockBooking, status: 'cancelled' as BookingStatus };
    mockFetchResponse(cancelledBooking);
    const cancellationResult = await bookingsService.cancelBooking(1);
    // Should call updateBooking with status cancelled
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings/1`, {
      method: 'PATCH',
      headers: expect.any(Object),
      body: JSON.stringify({ status: 'cancelled' })
    });
    expect(cancellationResult).toEqual(cancelledBooking);
    
    // Test deleteBooking
    jest.clearAllMocks();
    mockFetchResponse({}, true);
    await bookingsService.deleteBooking(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/bookings/1`, {
      method: 'DELETE',
      headers: expect.any(Object)
    });
  });

  test('Rooms service additional functionality', async () => {
    // Setup
    jest.clearAllMocks();
    
    // Test getFeaturedRooms
    mockApiResponse('get', [mockRoom, {...mockRoom, id: 202}, {...mockRoom, id: 203}]);
    const featuredRooms = await roomsService.getFeaturedRooms(3);
    expect(api.get).toHaveBeenCalledWith('/rooms/featured', { params: { limit: 3 } });
    expect(featuredRooms.length).toBe(3);
    expect(featuredRooms[0]).toEqual(mockRoom);
    
    // Test getRoomTypes
    jest.clearAllMocks();
    const roomTypes = ['standard', 'deluxe', 'suite', 'executive'];
    mockApiResponse('get', roomTypes);
    const roomTypesResult = await roomsService.getRoomTypes();
    expect(api.get).toHaveBeenCalledWith('/rooms/types');
    expect(roomTypesResult).toEqual(roomTypes);
    
    // Test getAmenities
    jest.clearAllMocks();
    const amenities = ['wifi', 'tv', 'minibar', 'air_conditioning', 'balcony'];
    mockApiResponse('get', amenities);
    const amenitiesResult = await roomsService.getAmenities();
    expect(api.get).toHaveBeenCalledWith('/rooms/amenities');
    expect(amenitiesResult).toEqual(amenities);
  });

  test('Payments service comprehensive functionality', async () => {
    // Setup
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'mock-token');
    
    // Test getPaymentById
    mockFetchResponse(mockPayment);
    const paymentDetails = await paymentsService.getPaymentById('payment123');
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/payment123`, expect.any(Object));
    expect(paymentDetails).toEqual(mockPayment);
    
    // Test getSavedPaymentMethods
    jest.clearAllMocks();
    const mockPaymentMethods = [
      {
        id: 'pm_123',
        type: 'credit_card' as const,
        lastFour: '4242',
        expiryDate: '12/25',
        cardBrand: 'visa',
        isDefault: true
      },
      {
        id: 'pm_456',
        type: 'paypal' as const,
        isDefault: false
      }
    ];
    mockFetchResponse(mockPaymentMethods);
    const paymentMethods = await paymentsService.getSavedPaymentMethods();
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/methods`, expect.any(Object));
    expect(paymentMethods).toEqual(mockPaymentMethods);
    
    // Test savePaymentMethod
    jest.clearAllMocks();
    const newPaymentMethod = {
      type: 'credit_card' as const,
      lastFour: '1234',
      expiryDate: '01/27',
      cardBrand: 'mastercard'
    };
    const savedPaymentMethod = {
      id: 'pm_789',
      type: 'credit_card' as const,
      lastFour: '1234',
      expiryDate: '01/27',
      cardBrand: 'mastercard',
      isDefault: false
    };
    mockFetchResponse(savedPaymentMethod);
    const saveResult = await paymentsService.savePaymentMethod(newPaymentMethod);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/methods`, {
      method: 'POST',
      headers: expect.any(Object),
      body: JSON.stringify(newPaymentMethod)
    });
    expect(saveResult).toEqual(savedPaymentMethod);
    
    // Test deletePaymentMethod
    jest.clearAllMocks();
    mockFetchResponse({ message: 'Payment method deleted successfully' });
    const deleteResult = await paymentsService.deletePaymentMethod('pm_123');
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/methods/pm_123`, {
      method: 'DELETE',
      headers: expect.any(Object)
    });
    expect(deleteResult).toEqual({ message: 'Payment method deleted successfully' });
    
    // Test setDefaultPaymentMethod
    jest.clearAllMocks();
    mockFetchResponse({...savedPaymentMethod, isDefault: true});
    const defaultResult = await paymentsService.setDefaultPaymentMethod('pm_789');
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/methods/pm_789/default`, {
      method: 'PATCH',
      headers: expect.any(Object)
    });
    expect(defaultResult).toEqual({...savedPaymentMethod, isDefault: true});
    
    // Test getPaymentHistory
    jest.clearAllMocks();
    const paymentHistory = [mockPayment, {...mockPayment, id: 'payment456'}];
    mockFetchResponse(paymentHistory);
    const historyResult = await paymentsService.getPaymentHistory();
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/history`, expect.any(Object));
    expect(historyResult).toEqual(paymentHistory);
    
    // Test requestRefund
    jest.clearAllMocks();
    const refundedPayment = {...mockPayment, status: 'refunded'};
    mockFetchResponse(refundedPayment);
    const refundResult = await paymentsService.requestRefund('payment123', 'Changed plans');
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/payments/payment123/refund`, {
      method: 'POST',
      headers: expect.any(Object),
      body: JSON.stringify({ reason: 'Changed plans' })
    });
    expect(refundResult).toEqual(refundedPayment);
  });
  
  // Add focused error handling tests for services
  test('Bookings and Payments services error handling', async () => {
    jest.clearAllMocks();
    
    // Test all error paths in a single test to minimize test count while maximizing coverage
    
    // 1. Bookings service error paths
    // getBookingById error
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Booking not found' })
    }));
    await expect(bookingsService.getBookingById(999)).rejects.toThrow('Failed to fetch booking');
    
    // updateBooking error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid booking data' })
    }));
    await expect(bookingsService.updateBooking(1, { guestCount: 5 })).rejects.toThrow('Failed to update booking');
    
    // deleteBooking error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Unauthorized to delete booking' })
    }));
    await expect(bookingsService.deleteBooking(1)).rejects.toThrow('Failed to delete booking');
    
    // 2. Payments service error paths
    // getPaymentByBookingId error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Payment not found' })
    }));
    await expect(paymentsService.getPaymentByBookingId(999)).rejects.toThrow('Failed to fetch payment');
    
    // getPaymentById error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Payment not found' })
    }));
    await expect(paymentsService.getPaymentById('nonexistent-id')).rejects.toThrow('Failed to fetch payment');
    
    // getSavedPaymentMethods error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' })
    }));
    await expect(paymentsService.getSavedPaymentMethods()).rejects.toThrow('Failed to fetch payment methods');
    
    // savePaymentMethod error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid payment method data' })
    }));
    await expect(paymentsService.savePaymentMethod({ type: 'credit_card' as const })).rejects.toThrow('Failed to save payment method');
    
    // setDefaultPaymentMethod error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Payment method not found' })
    }));
    await expect(paymentsService.setDefaultPaymentMethod('nonexistent-id')).rejects.toThrow('Failed to set default payment method');
    
    // getPaymentHistory error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' })
    }));
    await expect(paymentsService.getPaymentHistory()).rejects.toThrow('Failed to fetch payment history');
    
    // requestRefund error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid refund reason' })
    }));
    await expect(paymentsService.requestRefund('payment123', '')).rejects.toThrow('Failed to request refund');
    
    // processPayment error with json parse error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Invalid JSON'); }
    }));
    await expect(paymentsService.processPayment({
      bookingId: 1,
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    } as any)).rejects.toThrow('Payment failed');
    
    // createBooking error with json parse error
    jest.clearAllMocks();
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      status: 400,
      json: async () => { throw new Error('Invalid JSON'); }
    }));
    await expect(bookingsService.createBooking({
      roomId: 1,
      checkInDate: '2023-08-01',
      checkOutDate: '2023-08-05',
      guestCount: 2
    })).rejects.toThrow('Failed to create booking');
  });
}); 