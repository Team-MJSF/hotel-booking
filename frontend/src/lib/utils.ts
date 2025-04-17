import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price in cents to a readable currency string
 */
export function formatPrice(priceInCents: number): string {
  const priceInDollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInDollars);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  
  // Create a normalized date that preserves the date portion regardless of timezone
  // First get the ISO date string (YYYY-MM-DD) and create a new date with it
  const dateString = date.toISOString().split('T')[0];
  const normalizedDate = new Date(`${dateString}T12:00:00Z`);
  
  // Always use the standard date format for consistency across the application
  return format(normalizedDate, "EEE, MMM d, yyyy");
}
