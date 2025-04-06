/**
 * Format a number as currency (USD by default)
 */
export const formatCurrency = (
  amount: number, 
  currency = 'USD', 
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date as a string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    year: 'numeric',
  };
  
  if (format === 'long') {
    options.weekday = 'long';
  }
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date range as a string
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  locale = 'en-US'
): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  
  const formatter = new Intl.DateTimeFormat(locale, options);
  
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

/**
 * Calculate the number of nights between two dates
 */
export const calculateNights = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Reset hours to ensure we get whole days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}; 