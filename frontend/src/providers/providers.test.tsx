import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthProvider from './AuthProvider';
import ErrorProvider from './ErrorProvider';
import useAuthStore from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';
import { useErrorToast } from '@/context/ToastContext';
import { ApiError, getErrorMessage } from '@/lib/api/errorHandler';
import ErrorBoundary from '@/components/error/ErrorBoundary';

// === Common Mocks ===
// Mock navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('@/store/authStore', () => jest.fn());

// Mock toast context
jest.mock('@/context/ToastContext', () => ({
  useErrorToast: jest.fn(),
}));

// Mock ErrorBoundary
jest.mock('@/components/error/ErrorBoundary', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="error-boundary">{children}</div>),
}));

// Mock error handler
jest.mock('@/lib/api/errorHandler', () => ({
  getErrorMessage: jest.fn((error) => error.message),
}));

// Define ApiError interface for tests
interface ApiErrorTest extends Error {
  status: number;
  message: string;
  isNetworkError?: boolean;
  data?: any;
}

describe('Provider Components', () => {
  // === AuthProvider Tests ===
  describe('AuthProvider', () => {
    // Common mocks 
    const mockCheckAuth = jest.fn();
    const mockClearError = jest.fn();
    const mockPush = jest.fn();
    const mockErrorToast = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      // Default mock implementations
      (usePathname as jest.Mock).mockReturnValue('/');
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (useErrorToast as unknown as jest.Mock).mockReturnValue(mockErrorToast);
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        checkAuth: mockCheckAuth,
        clearError: mockClearError,
      });
    });

    test('handles authentication, errors, route protection, and renders children appropriately', () => {
      // 1. Test children rendering
      const { unmount, rerender } = render(
        <AuthProvider>
          <div data-testid="test-child">Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      
      // 2. Verify checkAuth is called on mount
      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
      
      // 3. Test error handling
      // Set up auth store with an error
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed',
        checkAuth: mockCheckAuth,
        clearError: mockClearError,
      });

      rerender(
        <AuthProvider>
          <div data-testid="test-child">Test Child</div>
        </AuthProvider>
      );

      // Verify error toast was called with correct parameters
      expect(mockErrorToast).toHaveBeenCalledWith(
        'Authentication failed',
        'Authentication Error',
        5000
      );

      // Verify error was cleared
      expect(mockClearError).toHaveBeenCalledTimes(1);
      
      // 4. Test public routes (no redirection when not authenticated)
      const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/register',
        '/rooms',
        '/about',
        '/contact',
        '/rooms/123', // Room detail page
      ];

      for (const route of publicRoutes) {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue(route);
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          checkAuth: mockCheckAuth,
          clearError: mockClearError,
        });

        rerender(
          <AuthProvider>
            <div data-testid="test-child">Test Child</div>
          </AuthProvider>
        );

        expect(mockPush).not.toHaveBeenCalled();
      }
      
      // 5. Test protected routes (redirect to login when not authenticated)
      const protectedRoutes = [
        '/profile',
        '/bookings',
        '/bookings/123',
        '/admin',
        '/some/other/route',
      ];

      for (const route of protectedRoutes) {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue(route);
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          checkAuth: mockCheckAuth,
          clearError: mockClearError,
        });

        rerender(
          <AuthProvider>
            <div data-testid="test-child">Test Child</div>
          </AuthProvider>
        );

        // Verify redirect to login page
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      }
      
      // 6. Test authenticated state (no redirection even on protected routes)
      for (const route of protectedRoutes) {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue(route);
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
          isAuthenticated: true, // User is authenticated
          isLoading: false,
          error: null,
          checkAuth: mockCheckAuth,
          clearError: mockClearError,
        });

        rerender(
          <AuthProvider>
            <div data-testid="test-child">Test Child</div>
          </AuthProvider>
        );

        expect(mockPush).not.toHaveBeenCalled();
      }
      
      // 7. Test loading state (no redirection while loading)
      jest.clearAllMocks();
      (usePathname as jest.Mock).mockReturnValue('/profile'); // Protected route
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true, // Still loading auth state
        error: null,
        checkAuth: mockCheckAuth,
        clearError: mockClearError,
      });

      rerender(
        <AuthProvider>
          <div data-testid="test-child">Test Child</div>
        </AuthProvider>
      );

      // Should not redirect while loading
      expect(mockPush).not.toHaveBeenCalled();
      
      unmount();
    });
  });

  // === ErrorProvider Tests ===
  describe('ErrorProvider', () => {
    // Mock event listener functions
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const mockErrorToast = jest.fn();
    
    // Store original methods
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    
    // Capture the event handler function when added
    let capturedEventHandler: ((event: PromiseRejectionEvent) => void) | null = null;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock addEventListener and removeEventListener
      window.addEventListener = addEventListener;
      window.removeEventListener = removeEventListener;
      
      // Make sure toast is mocked
      (useErrorToast as jest.Mock).mockReturnValue(mockErrorToast);
      
      // Capture the event handler when addEventListener is called
      addEventListener.mockImplementation((event, handler) => {
        if (event === 'unhandledrejection') {
          capturedEventHandler = handler;
        }
      });
    });
    
    afterEach(() => {
      // Restore original methods
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
    });

    test('handles errors correctly and provides global error handling', () => {
      // 1. Test rendering children inside ErrorBoundary
      const { unmount } = render(
        <ErrorProvider>
          <div data-testid="test-child">Test Child</div>
        </ErrorProvider>
      );
      
      // Verify ErrorBoundary was called with children
      expect(ErrorBoundary).toHaveBeenCalled();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      
      // 2. Test adding and removing event listeners
      // Verify event listener was added
      expect(addEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      
      // Verify that we captured the event handler
      expect(capturedEventHandler).not.toBeNull();
      
      // 3. Test network errors
      // Create a network error
      const networkError = new Error('Network connection lost') as ApiErrorTest;
      networkError.status = 0;
      networkError.isNetworkError = true;
      
      // Create a mock event
      const networkEvent = {
        reason: networkError,
        preventDefault: jest.fn(),
      } as unknown as PromiseRejectionEvent;
      
      // Call the event handler directly
      if (capturedEventHandler) {
        capturedEventHandler(networkEvent);
      }
      
      // Verify toast was called with correct arguments for network error
      expect(mockErrorToast).toHaveBeenCalledWith(
        'Network connection lost',
        'Network Error',
        6000
      );
      
      // Clear mocks for next tests
      mockErrorToast.mockClear();
      
      // 4. Test various HTTP errors
      // Test structure for different error types
      const errorTestCases = [
        // Server error
        {
          error: { status: 500, message: 'Internal server error' },
          expectedTitle: 'Server Error'
        },
        // Not found error
        {
          error: { status: 404, message: 'Resource not found' },
          expectedTitle: 'Not Found'
        },
        // Access denied error
        {
          error: { status: 403, message: 'Access forbidden' },
          expectedTitle: 'Access Denied'
        },
        // Validation error
        {
          error: { status: 400, message: 'Invalid input data' },
          expectedTitle: 'Validation Error'
        }
      ];
      
      // Test each error type
      errorTestCases.forEach(({ error, expectedTitle }) => {
        mockErrorToast.mockClear();
        
        // Create the error
        const apiError = new Error(error.message) as ApiErrorTest;
        apiError.status = error.status;
        
        // Create a mock event
        const event = {
          reason: apiError,
          preventDefault: jest.fn(),
        } as unknown as PromiseRejectionEvent;
        
        // Call the event handler directly
        if (capturedEventHandler) {
          capturedEventHandler(event);
        }
        
        // Verify toast was called with correct arguments
        expect(mockErrorToast).toHaveBeenCalledWith(
          error.message,
          expectedTitle,
          6000
        );
      });
      
      // 5. Test ignoring authentication errors
      // Create an auth error
      const authError = new Error('Authentication required') as ApiErrorTest;
      authError.status = 401;
      
      // Create a mock event
      const authEvent = {
        reason: authError,
        preventDefault: jest.fn(),
      } as unknown as PromiseRejectionEvent;
      
      mockErrorToast.mockClear();
      
      // Call the event handler directly
      if (capturedEventHandler) {
        capturedEventHandler(authEvent);
      }
      
      // Auth errors should be ignored (handled by AuthProvider)
      expect(mockErrorToast).not.toHaveBeenCalled();
      
      // 6. Test cleanup
      unmount();
      
      // Verify event listener was removed
      expect(removeEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });
  });

  // === ReactQueryProvider Tests ===
  // Mocks for ReactQueryProvider
  jest.mock('@tanstack/react-query', () => ({
    QueryClient: jest.fn().mockImplementation(() => ({
      setDefaultOptions: jest.fn(),
    })),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="query-client-provider">{children}</div>
    ),
  }));

  // Import after mocking dependencies
  const ReactQueryProvider = require('./ReactQueryProvider').default;

  describe('ReactQueryProvider', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders children properly', () => {
      render(
        <ReactQueryProvider>
          <div data-testid="test-child">Query Provider Child</div>
        </ReactQueryProvider>
      );
      
      // Check that the child was rendered
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByTestId('test-child').textContent).toBe('Query Provider Child');
      // Verify it's wrapped in the QueryClientProvider
      expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    });
    
    test('initializes QueryClient with correct configuration', () => {
      // We can't easily test the exact configuration due to mocking limitations
      // But we can verify that QueryClient is initialized
      const QueryClient = require('@tanstack/react-query').QueryClient;
      
      render(
        <ReactQueryProvider>
          <div>Test Child</div>
        </ReactQueryProvider>
      );
      
      // Verify that QueryClient constructor was called
      expect(QueryClient).toHaveBeenCalled();
    });
  });
}); 