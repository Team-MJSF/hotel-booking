import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

export function DatePicker({
  label,
  error,
  required,
  className,
  labelClassName,
  id,
  ...props
}: DatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className={cn(
            "block text-sm font-medium text-gray-700 mb-1",
            error && "text-red-500",
            labelClassName
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={cn(
        "relative rounded-md border",
        error ? "border-red-300 bg-red-50" : isFocused ? "border-primary ring-2 ring-primary/20" : "border-gray-300",
        props.disabled && "opacity-70 bg-gray-100",
        className
      )}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className={`h-5 w-5 ${error ? "text-red-500" : isFocused ? "text-primary" : "text-gray-400"}`} />
        </div>
        <input
          type="date"
          id={id}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md",
            "border-0 focus:outline-none focus:ring-0",
            "cus-date-input", // Custom class for targeting in CSS
            error ? "text-red-500 placeholder-red-300" : "text-gray-900 placeholder-gray-400",
            props.disabled && "cursor-not-allowed"
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default DatePicker; 