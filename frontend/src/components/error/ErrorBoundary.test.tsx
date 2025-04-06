import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from './ErrorBoundary';

// Mock the ToastContext
jest.mock('@/context/ToastContext', () => ({
  useErrorToast: jest.fn().mockReturnValue(jest.fn()),
}));

// Component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error thrown by component');
  }
  return <div>Normal component rendering</div>;
};

// A simple fallback component for testing
const TestFallback = () => <div>Custom fallback UI</div>;

describe('ErrorBoundary', () => {
  // Prevent console.error pollution in tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when no error occurs and handles errors with proper recovery', () => {
    // Test normal rendering first
    const { rerender } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();

    // Test with component that doesn't throw initially
    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal component rendering')).toBeInTheDocument();

    // Make the component throw an error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify the error UI is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error thrown by component/)).toBeInTheDocument();
    
    // Test recovery functionality
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error for reset');
      }
      return <div>Component recovered</div>;
    };

    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Simulate fixing the error
    shouldThrow = false;

    // Click the Try again button
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    // Force a rerender with the updated state
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Verify the component recovers
    expect(screen.getByText('Component recovered')).toBeInTheDocument();
  });

  test('renders custom fallback UI and calls errorToast when an error occurs', () => {
    // Setup mock for error toast
    const mockErrorToast = jest.fn();
    require('@/context/ToastContext').useErrorToast.mockReturnValue(mockErrorToast);
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Test with custom fallback
    render(
      <ErrorBoundary fallback={<TestFallback />}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify the custom fallback UI is shown
    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument();
    
    // Verify that the error toast was called
    expect(mockErrorToast).toHaveBeenCalledWith(
      'An error occurred: Test error thrown by component',
      'Application Error',
      8000
    );
  });
}); 