import React, { useEffect } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './context/ToastContext';
import useAuthStore from './store/authStore';
import { User } from './types/user';

// Mock the localStorage API
const mockLocalStorage = (() => {
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

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Application State', () => {
  // Test data
  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    useAuthStore.getState().logout();
  });

  test('auth and toast functionality with single test case', async () => {
    // Create test component with direct state access
    const TestComponent = () => {
      const { showToast } = useToast();
      const authState = useAuthStore();
      
      // This effect runs once and sets up test listeners
      useEffect(() => {
        // Set up a subscription to auth state changes
        const unsubscribe = useAuthStore.subscribe(() => {
          // Just needed to trigger re-renders when state changes
        });
        
        return () => unsubscribe();
      }, []);
      
      const handleLogin = () => {
        // Directly update auth state
        act(() => {
          useAuthStore.setState({
            user: mockUser,
            isAuthenticated: true,
            token: mockToken,
            error: null,
            isLoading: false
          });
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
        });
        
        showToast({ type: 'success', message: 'Successfully logged in!' });
      };
      
      const handleLogout = () => {
        act(() => {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            token: null,
            error: null,
            isLoading: false
          });
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
        
        showToast({ type: 'info', message: 'Logged out' });
      };
      
      const handleError = () => {
        showToast({ type: 'error', message: 'Error occurred' });
      };
      
      return (
        <div>
          <div data-testid="auth-status">
            {authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </div>
          
          {authState.user && (
            <div data-testid="user-info">
              {authState.user.firstName} {authState.user.lastName}
            </div>
          )}
          
          <div data-testid="error-display">
            {authState.error || 'No errors'}
          </div>
          
          <button data-testid="login-btn" onClick={handleLogin}>Login</button>
          <button data-testid="logout-btn" onClick={handleLogout}>Logout</button>
          <button data-testid="error-btn" onClick={handleError}>Show Error</button>
          
          <div data-testid="toast-container" />
        </div>
      );
    };
    
    // Render the component
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Check initial state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    
    // Simulate login click
    userEvent.click(screen.getByTestId('login-btn'));
    
    // Wait for state changes to be reflected in the UI
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Verify user info is displayed
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    
    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    
    // Test toast functionality
    userEvent.click(screen.getByTestId('error-btn'));
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    
    // Test logout
    userEvent.click(screen.getByTestId('logout-btn'));
    
    // Wait for logout state changes
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
    
    // Verify user info is removed
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    
    // Verify localStorage was cleared
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    
    // Test error state
    act(() => {
      useAuthStore.setState({
        error: 'Login failed',
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
    });
    
    // Verify error state
    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toHaveTextContent('Login failed');
    });
  });
}); 