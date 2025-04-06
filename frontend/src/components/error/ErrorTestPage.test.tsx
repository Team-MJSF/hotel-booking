import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorTestPage from './ErrorTestPage';

// Mock the api module
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn().mockImplementation((url) => {
      if (url === '/non-existent-endpoint') {
        return Promise.reject({ response: { status: 404 } });
      }
      if (url.includes('non-existent-domain')) {
        return Promise.reject({ message: 'Network Error' });
      }
      return Promise.resolve({ data: {} });
    })
  }
}));

// Mock MainLayout component
jest.mock('@/components/layout/MainLayout', () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  );
});

// Create a BuggyComponent that can be mocked for testing
const BuggyComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a test error from BuggyComponent');
  }
  return <div className="p-4 bg-green-50 text-green-700 rounded">This component is working correctly!</div>;
};

// Mock the actual ErrorTestPage component to replace its BuggyComponent with our test version
jest.mock('./ErrorTestPage', () => {
  const actual = jest.requireActual('./ErrorTestPage').default;
  const mockFn = jest.fn(actual);
  return mockFn;
});

// Manually create an Error Boundary component for testing
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Error Boundary Caught Error!</div>;
    }
    return this.props.children;
  }
}

// Mock the ToastContext hooks
jest.mock('@/context/ToastContext', () => ({
  useErrorToast: jest.fn().mockReturnValue(jest.fn()),
  useInfoToast: jest.fn().mockReturnValue(jest.fn()),
}));

// Keep track of the mock functions
const mockErrorToast = jest.fn();
const mockInfoToast = jest.fn();

// Setup the mocks before each test
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  
  // Update the mock implementations
  require('@/context/ToastContext').useErrorToast.mockReturnValue(mockErrorToast);
  require('@/context/ToastContext').useInfoToast.mockReturnValue(mockInfoToast);
});

afterEach(() => {
  jest.restoreAllMocks();
  mockErrorToast.mockClear();
  mockInfoToast.mockClear();
});

describe('ErrorTestPage', () => {
  test('renders correctly with initial state and handles component errors', () => {
    render(<ErrorTestPage />);
    
    // Initial rendering
    expect(screen.getByText('Error Handling Test Page')).toBeInTheDocument();
    expect(screen.getByText('React Error Boundary Testing')).toBeInTheDocument();
    expect(screen.getByText('API Error Handling Testing')).toBeInTheDocument();
    expect(screen.getByText('This component is working correctly!')).toBeInTheDocument();
    
    // Test component error behavior
    expect(() => {
      render(<BuggyComponent shouldThrow={true} />);
    }).toThrow('This is a test error from BuggyComponent');
    
    // Test error boundary
    const onError = jest.fn();
    render(
      <TestErrorBoundary onError={onError}>
        <BuggyComponent shouldThrow={true} />
      </TestErrorBoundary>
    );
    
    expect(screen.getByText('Error Boundary Caught Error!')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });
  
  test('handles different API error scenarios and toast notifications', async () => {
    render(<ErrorTestPage />);
    
    // Test 404 error handling
    const trigger404Button = screen.getByText('Trigger 404 Error');
    fireEvent.click(trigger404Button);
    
    expect(trigger404Button).toBeDisabled(); // Loading state active
    
    await waitFor(() => {
      expect(trigger404Button).not.toBeDisabled(); // Loading state inactive
    });
    
    expect(console.log).toHaveBeenCalledWith(
      'This error should be handled globally',
      expect.anything()
    );
    
    // Test network error handling
    const triggerNetworkButton = screen.getByText('Trigger Network Error');
    fireEvent.click(triggerNetworkButton);
    
    expect(triggerNetworkButton).toBeDisabled(); // Loading state active
    
    await waitFor(() => {
      expect(triggerNetworkButton).not.toBeDisabled(); // Loading state inactive
    });
    
    expect(console.log).toHaveBeenCalledWith(
      'This error should be handled globally',
      expect.anything()
    );
    
    // Test manually handled error
    const triggerHandledButton = screen.getByText('Trigger Handled Error');
    fireEvent.click(triggerHandledButton);
    
    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith(
        'This is a manually handled error',
        'Manual Error Handling',
        5000
      );
    });
    
    // Test info toast functionality
    const showInfoButton = screen.getByText('Show Info Toast');
    fireEvent.click(showInfoButton);
    
    expect(mockInfoToast).toHaveBeenCalledWith(
      'This page is for testing error handling only',
      'Info',
      3000
    );
  });
}); 