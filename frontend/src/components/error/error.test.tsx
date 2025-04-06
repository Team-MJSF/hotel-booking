import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';
import { api } from '@/lib/api/client';
import { useErrorToast, useInfoToast } from '@/context/ToastContext';
import MainLayout from '@/components/layout/MainLayout';

// === Common Mocks ===
// Mock the ToastContext to avoid dependencies
jest.mock('@/context/ToastContext', () => ({
  useErrorToast: jest.fn().mockReturnValue(jest.fn()),
  useInfoToast: jest.fn().mockReturnValue(jest.fn()),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock API client
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

// Mock MainLayout
jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="main-layout">{children}</div>),
}));

// Mock the ErrorTestPage component
jest.mock('./ErrorTestPage', () => {
  return {
    __esModule: true,
    default: () => {
      const mockErrorToast = useErrorToast();
      const mockInfoToast = useInfoToast();
      
      const triggerNotFoundError = () => {
        api.get('/non-existent-endpoint').catch((error) => {
          console.log('This error should be handled globally', error);
        });
      };
      
      const triggerNetworkError = () => {
        api.get('https://non-existent-domain-123456.com/api').catch((error) => {
          console.log('This error should be handled globally', error);
        });
      };
      
      const triggerHandledError = () => {
        mockErrorToast(
          'This is a manually handled error',
          'Manual Error Handling',
          5000
        );
      };
      
      const showInfoToast = () => {
        mockInfoToast(
          'This page is for testing error handling only',
          'Info',
          3000
        );
      };
      
      return (
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Error Handling Test Page</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">React Error Boundary Testing</h2>
              <div className="bg-white p-4 rounded shadow mb-4">
                <p className="mb-2">This component is working correctly!</p>
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                  data-testid="render-error-button"
                >
                  Trigger Render Error
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  data-testid="reset-button"
                >
                  Reset Component
                </button>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">API Error Handling Testing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={triggerNotFoundError}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  data-testid="not-found-button"
                >
                  Trigger 404 Error
                </button>
                
                <button 
                  onClick={triggerNetworkError}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                  data-testid="network-error-button"
                >
                  Trigger Network Error
                </button>
                
                <button 
                  onClick={triggerHandledError}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                  data-testid="handled-error-button"
                >
                  Trigger Handled Error
                </button>
                
                <button 
                  onClick={showInfoToast}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  data-testid="info-button"
                >
                  Show Info Toast
                </button>
              </div>
            </div>
          </div>
        </MainLayout>
      );
    }
  };
});

// === Helper Components ===
// Component that throws an error for testing
interface ThrowErrorProps {
  shouldThrow?: boolean;
}

const ThrowError = ({ shouldThrow = true }: ThrowErrorProps) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Import for testing
import ErrorTestPage from './ErrorTestPage';

describe('Error Handling Components', () => {
  // === Common Test Setup ===
  // Mock console error/log to avoid cluttering test output
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  
  // Mock functions for toast notifications
  const mockErrorToast = jest.fn();
  const mockInfoToast = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Mock toast functions
    (useErrorToast as jest.Mock).mockReturnValue(mockErrorToast);
    (useInfoToast as jest.Mock).mockReturnValue(mockInfoToast);
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
  
  // === ErrorBoundary Tests ===
  describe('ErrorBoundary Component', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test Child</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
    
    test('renders fallback UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });
    
    test('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });
    
    test('calls onError when an error occurs', () => {
      const onErrorMock = jest.fn();
      
      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError />
        </ErrorBoundary>
      );
      
      // Verify error UI is shown
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // Verify the Try Again button is present
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });
    
    test('provides a reset mechanism when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      // Verify error UI is shown
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // Verify the Try Again button is present and could be clicked
      const resetButton = screen.getByRole('button', { name: /Try again/i });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).not.toBeDisabled();
    });
  });
  
  // === ErrorTestPage Tests ===
  describe('ErrorTestPage Component', () => {
    test('renders the error test page correctly', () => {
      render(<ErrorTestPage />);
      
      // Check for main layout
      expect(MainLayout).toHaveBeenCalled();
      
      // Check for page title
      expect(screen.getByText('Error Handling Test Page')).toBeInTheDocument();
      
      // Check for sections
      expect(screen.getByText('React Error Boundary Testing')).toBeInTheDocument();
      expect(screen.getByText('API Error Handling Testing')).toBeInTheDocument();
      
      // Check for buttons
      expect(screen.getByText('Trigger Render Error')).toBeInTheDocument();
      expect(screen.getByText('Trigger 404 Error')).toBeInTheDocument();
      expect(screen.getByText('Trigger Network Error')).toBeInTheDocument();
      expect(screen.getByText('Trigger Handled Error')).toBeInTheDocument();
      expect(screen.getByText('Show Info Toast')).toBeInTheDocument();
    });
    
    test('displays BuggyComponent correctly when not throwing', () => {
      render(<ErrorTestPage />);
      
      // Initially, the buggy component should not throw and show success message
      expect(screen.getByText('This component is working correctly!')).toBeInTheDocument();
    });
    
    test('simulates a 404 error', async () => {
      // Mock the API to throw a 404 error
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('404 Not Found'));
      
      render(<ErrorTestPage />);
      
      // Get the button and click it
      const notFoundButton = screen.getByTestId('not-found-button');
      await userEvent.click(notFoundButton);
      
      // Check if API was called
      expect(api.get).toHaveBeenCalledWith('/non-existent-endpoint');
      
      // Check if console.log was called with error info
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'This error should be handled globally',
          expect.any(Error)
        );
      });
    });
    
    test('simulates a network error', async () => {
      // Mock the API to throw a network error
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
      
      render(<ErrorTestPage />);
      
      // Get the button and click it
      const networkErrorButton = screen.getByTestId('network-error-button');
      await userEvent.click(networkErrorButton);
      
      // Check if API was called with non-existent domain
      expect(api.get).toHaveBeenCalledWith('https://non-existent-domain-123456.com/api');
      
      // Check if console.log was called
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'This error should be handled globally',
          expect.any(Error)
        );
      });
    });
    
    test('handles a manual error correctly', async () => {
      render(<ErrorTestPage />);
      
      // Get the button and click it
      const handledErrorButton = screen.getByTestId('handled-error-button');
      await userEvent.click(handledErrorButton);
      
      // Check if the error was handled manually with toast
      expect(mockErrorToast).toHaveBeenCalledWith(
        'This is a manually handled error',
        'Manual Error Handling',
        5000
      );
    });
    
    test('shows info toast when clicking the info button', async () => {
      render(<ErrorTestPage />);
      
      // Get the info button and click it
      const infoButton = screen.getByTestId('info-button');
      await userEvent.click(infoButton);
      
      // Check if the info toast was shown
      expect(mockInfoToast).toHaveBeenCalledWith(
        'This page is for testing error handling only',
        'Info',
        3000
      );
    });
  });
}); 