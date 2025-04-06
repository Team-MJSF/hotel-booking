'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from '@/components/ui/ToastContainer';
import { ToastType, ToastProps } from '@/components/ui/Toast';

// Define the shape of a toast notification
type Toast = Omit<ToastProps, 'onClose'>;

// Define the toast context shape
interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  clearToasts: () => void;
}

// Create the context with default values
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to add a new toast
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  // Function to remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Function to clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts as ToastProps[]} onCloseToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for showing different types of toasts
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ type: 'success', message, title, duration });
    },
    [showToast]
  );
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ type: 'error', message, title, duration });
    },
    [showToast]
  );
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ type: 'info', message, title, duration });
    },
    [showToast]
  );
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ type: 'warning', message, title, duration });
    },
    [showToast]
  );
}; 