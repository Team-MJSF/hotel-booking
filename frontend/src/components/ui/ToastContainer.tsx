'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onCloseToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onCloseToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onCloseToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer; 