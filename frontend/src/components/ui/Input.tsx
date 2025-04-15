'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  inputSize?: 'sm' | 'default' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, inputSize = 'default', ...props }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      default: 'h-10 px-4',
      lg: 'h-12 px-5 text-lg',
    };

    // Basic input classes + error classes if there's an error
    const inputClasses = cn(
      'flex w-full rounded-md border bg-white text-gray-900 shadow-sm focus:ring-1 focus:ring-inset transition-colors',
      'placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
      error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-primary focus:ring-primary',
      sizeClasses[inputSize],
      className
    );

    return (
      <div className="w-full">
        <input className={inputClasses} ref={ref} {...props} />
        {error && typeof error === 'string' && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 