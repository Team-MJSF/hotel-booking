import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and resolves Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in cents to a currency string
 */
export function formatPrice(price: number, opts: { currency?: string; notation?: Intl.NumberFormatOptions['notation'] } = {}) {
  const { currency = 'USD', notation = 'standard' } = opts;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
  }).format(price / 100);
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, format: string = 'PPP') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
} 