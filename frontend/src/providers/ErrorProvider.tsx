'use client';

import React, { useEffect } from 'react';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useErrorToast } from '@/context/ToastContext';
import { ApiError, getErrorMessage } from '@/lib/api/errorHandler';

interface ErrorProviderProps {
  children: React.ReactNode;
}

export default function ErrorProvider({ children }: ErrorProviderProps) {
  const errorToast = useErrorToast();

  // Set up global unhandled rejection handler for API errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if the error is one of our ApiErrors
      if (event.reason && 
          typeof event.reason === 'object' && 
          'status' in event.reason && 
          'message' in event.reason) {
        
        const apiError = event.reason as ApiError;
        
        // Skip auth errors as they are usually handled by the auth provider
        if (apiError.status === 401) return;
        
        // Get user-friendly error message
        const message = getErrorMessage(apiError);
        
        // Show toast notification with appropriate title based on error
        let title = 'Error';
        
        if (apiError.isNetworkError) {
          title = 'Network Error';
        } else if (apiError.status >= 500) {
          title = 'Server Error';
        } else if (apiError.status === 404) {
          title = 'Not Found';
        } else if (apiError.status === 403) {
          title = 'Access Denied';
        } else if (apiError.status === 400 || apiError.status === 422) {
          title = 'Validation Error';
        }
        
        // Show toast notification
        errorToast(message, title, 6000);
      }
    };

    // Add the event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clean up the event listener
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [errorToast]);

  return <ErrorBoundary>{children}</ErrorBoundary>;
} 