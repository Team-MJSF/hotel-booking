'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { api } from '@/lib/api/client';
import { useErrorToast, useInfoToast } from '@/context/ToastContext';

// Component that will throw an error
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('This is a test error from BuggyComponent');
  }
  return <div className="p-4 bg-green-50 text-green-700 rounded">This component is working correctly!</div>;
};

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();

  // Function to trigger a render error
  const triggerRenderError = () => {
    setShouldThrow(true);
  };

  // Reset the error state
  const resetErrorState = () => {
    setShouldThrow(false);
  };

  // Function to simulate a 404 error
  const trigger404Error = async () => {
    setIsLoading(true);
    try {
      await api.get('/non-existent-endpoint');
    } catch (error) {
      // This error will be caught by the global error handler
      console.log('This error should be handled globally', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate a network error
  const triggerNetworkError = async () => {
    setIsLoading(true);
    try {
      // Using a non-existent domain to force a network error
      await api.get('https://non-existent-domain-123456.com/api');
    } catch (error) {
      // This error will be caught by the global error handler
      console.log('This error should be handled globally', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate a handled error (not using global handler)
  const triggerHandledError = async () => {
    setIsLoading(true);
    try {
      // Simulate a manually handled error
      throw new Error('This is a manually handled error');
    } catch (error) {
      if (error instanceof Error) {
        errorToast(error.message, 'Manual Error Handling', 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Error Handling Test Page</h1>
        
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">React Error Boundary Testing</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This section demonstrates how React Error Boundaries catch and handle rendering errors.
              </p>
              
              <div className="mb-4">
                <button
                  onClick={triggerRenderError}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2"
                  disabled={shouldThrow}
                >
                  Trigger Render Error
                </button>
                
                <button
                  onClick={resetErrorState}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!shouldThrow}
                >
                  Reset Component
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-500 mb-2">Component Output:</p>
                {/* The error boundary is provided by the ErrorProvider */}
                <BuggyComponent shouldThrow={shouldThrow} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Error Handling Testing</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
              This section demonstrates how API errors are caught and handled globally.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <button
                onClick={trigger404Error}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                disabled={isLoading}
              >
                Trigger 404 Error
              </button>
              
              <button
                onClick={triggerNetworkError}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                disabled={isLoading}
              >
                Trigger Network Error
              </button>
              
              <button
                onClick={triggerHandledError}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={isLoading}
              >
                Trigger Handled Error
              </button>
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Processing...</span>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <p className="text-gray-700">
                The 404 and Network Error buttons will trigger errors that are caught by our global error handler.
                You should see toast notifications appear automatically for these errors.
              </p>
              <p className="mt-2 text-gray-700">
                The Handled Error button demonstrates a manually handled error with a custom toast notification.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-4">
          <button
            onClick={() => infoToast('This page is for testing error handling only', 'Info', 3000)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Show Info Toast
          </button>
        </div>
      </div>
    </MainLayout>
  );
} 