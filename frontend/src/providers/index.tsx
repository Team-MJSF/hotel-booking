'use client';

import React from 'react';
import ReactQueryProvider from './ReactQueryProvider';
import AuthProvider from './AuthProvider';
import ErrorProvider from './ErrorProvider';
import { ToastProvider } from '@/context/ToastContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <ErrorProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorProvider>
      </ToastProvider>
    </ReactQueryProvider>
  );
} 