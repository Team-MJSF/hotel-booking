import { User } from '@/types/user';

// Mock localStorage implementation for tests
export const createLocalStorageMock = () => {
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
};

// Common test user data
export const mockUser: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

// Common authentication data
export const mockAuthData = {
  mockToken: 'mock-jwt-token',
  loginCredentials: {
    email: 'john@example.com',
    password: 'Password123!'
  },
  registerData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123!',
    phoneNumber: '1234567890'
  }
};

// Setup for API mocking
export const mockApiResponse = (mockFn: jest.Mock, data: any) => {
  mockFn.mockResolvedValueOnce({ data });
};

// Setup auth-related mocks (localStorage and API)
export const setupAuthMocks = (api: any, localStorageMock: any) => {
  // Reset mocks
  jest.clearAllMocks();
  localStorageMock.clear();
  
  // Set default values
  localStorageMock.setItem('token', mockAuthData.mockToken);
  
  return {
    mockSuccessResponse: (endpoint: string, data: any) => {
      if (endpoint.startsWith('/auth')) {
        mockApiResponse(api.post, data);
      } else {
        mockApiResponse(api.get, data);
      }
    },
    mockErrorResponse: (endpoint: string, error: any) => {
      if (endpoint.startsWith('/auth')) {
        api.post.mockRejectedValueOnce(error);
      } else {
        api.get.mockRejectedValueOnce(error);
      }
    }
  };
}; 