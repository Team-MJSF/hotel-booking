'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useErrorToast } from '@/context/ToastContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// This component needs to be a class component because React hooks don't support componentDidCatch yet
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI or default error UI
      return this.props.fallback || (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
          <div className="text-center max-w-md">
            <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error rendering this part of the application.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to access hooks
export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const errorToast = useErrorToast();
  
  // Handle errors with toast notifications
  const handleError = (error: Error) => {
    errorToast(
      `An error occurred: ${error.message}`,
      'Application Error',
      8000
    );
  };
  
  // We need to use a function component wrapper to use hooks
  return (
    <ErrorBoundaryClass 
      fallback={fallback}
      onError={(error) => handleError(error)}
    >
      {children}
    </ErrorBoundaryClass>
  );
} 