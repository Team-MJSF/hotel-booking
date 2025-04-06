import { api } from './client';
import authService, { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  UserProfile 
} from './authService';

// Mock the API client
jest.mock('./client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

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
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_TOKEN_NAME: 'hotel_booking_token',
  };
  // Reset localStorage mock before each test
  localStorageMock.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Auth Service', () => {
  // Shared test data
  const mockLoginCredentials: LoginCredentials = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterData: RegisterData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    phoneNumber: '1234567890',
    address: '123 Main St',
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
  };

  const mockUserProfile: UserProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'user',
    phoneNumber: '1234567890',
    address: '123 Main St',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  // Core functionality tests
  describe('authentication methods', () => {
    it('should handle login successfully', async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.login(mockLoginCredentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', mockLoginCredentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hotel_booking_token', mockAuthResponse.access_token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refresh_token);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle registration with token storage', async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.register(mockRegisterData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', mockRegisterData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hotel_booking_token', mockAuthResponse.access_token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refresh_token);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should not store tokens when none returned from registration', async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({ data: {} });
      await authService.register(mockRegisterData);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      await expect(authService.login(mockLoginCredentials)).rejects.toThrow('API error');
      
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Registration error'));
      await expect(authService.register(mockRegisterData)).rejects.toThrow('Registration error');
      
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Profile error'));
      await expect(authService.getProfile()).rejects.toThrow('Profile error');
      
      const mockRefreshToken = 'expired_token';
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Refresh error'));
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow('Refresh error');
    });
  });

  describe('session management', () => {
    it('should handle logout process', async () => {
      // Test with existing refresh token
      const mockRefreshToken = 'mock_refresh_token';
      localStorageMock.getItem.mockReturnValueOnce(mockRefreshToken);
      (api.post as jest.Mock).mockResolvedValueOnce({});

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: mockRefreshToken });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hotel_booking_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Test without refresh token
      localStorageMock.getItem.mockReturnValueOnce(null);
      await authService.logout();
      expect(api.post).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hotel_booking_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should clean up localStorage even when API logout fails', async () => {
      localStorageMock.getItem.mockReturnValueOnce('token');
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await authService.logout();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hotel_booking_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      
      consoleErrorSpy.mockRestore();
    });

    it('should correctly identify authentication state', () => {
      // When authenticated
      localStorageMock.getItem.mockReturnValueOnce('token');
      expect(authService.isAuthenticated()).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('hotel_booking_token');
      
      // When not authenticated
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('user data and token refresh', () => {
    it('should retrieve user profile', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUserProfile });
      
      const result = await authService.getProfile();
      
      expect(api.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUserProfile);
    });

    it('should handle token refresh flow', async () => {
      // Test with full response (both tokens)
      const mockRefreshToken = 'current_refresh_token';
      const newAuthResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      };

      (api.post as jest.Mock).mockResolvedValueOnce({ data: newAuthResponse });

      const result = await authService.refreshToken(mockRefreshToken);

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: mockRefreshToken });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hotel_booking_token', newAuthResponse.access_token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', newAuthResponse.refresh_token);
      expect(result).toEqual(newAuthResponse);
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Test with partial response (only access token)
      const partialResponse = {
        access_token: 'new_access_token',
        refresh_token: '',
      };
      
      (api.post as jest.Mock).mockResolvedValueOnce({ data: partialResponse });
      
      await authService.refreshToken(mockRefreshToken);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hotel_booking_token', partialResponse.access_token);
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('refresh_token', '');
    });
  });
}); 