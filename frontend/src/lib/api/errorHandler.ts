import { AxiosError } from 'axios';

// Define custom error types for better error handling
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  isNetworkError?: boolean;
}

// Error codes for different types of network errors
export enum NetworkErrorCode {
  TIMEOUT = 'ERR_TIMEOUT',
  NETWORK = 'ERR_NETWORK',
  CANCELLED = 'ERR_CANCELLED',
  UNKNOWN = 'ERR_UNKNOWN',
}

/**
 * Standardizes API error handling across the application
 * @param error The error from an API request
 * @returns A standardized ApiError object
 */
export function handleApiError(error: unknown): ApiError {
  // Check if it's an Axios error
  if (error instanceof AxiosError) {
    // Handle network errors (no response)
    if (!error.response) {
      const networkError: ApiError = {
        status: 0,
        message: 'Network error: Unable to connect to the server',
        isNetworkError: true,
        code: NetworkErrorCode.NETWORK,
      };

      // Check for timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        networkError.message = 'Request timed out. Please try again.';
        networkError.code = NetworkErrorCode.TIMEOUT;
      }

      return networkError;
    }

    // Handle server errors (with response)
    const { status, data } = error.response;
    const serverMessage = 
      data?.message || 
      data?.error || 
      error.message || 
      'An unknown error occurred';

    return {
      status,
      message: typeof serverMessage === 'string' 
        ? serverMessage 
        : 'Server error',
      code: data?.code,
      details: data?.details,
    };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || 'An unknown error occurred',
      code: NetworkErrorCode.UNKNOWN,
    };
  }

  // Handle unknown error types
  return {
    status: 500,
    message: 'An unknown error occurred',
    code: NetworkErrorCode.UNKNOWN,
  };
}

/**
 * Get a user-friendly error message from an API error
 * @param error The API error
 * @returns User-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  // Network errors
  if (error.isNetworkError) {
    return error.message;
  }

  // Auth errors
  if (error.status === 401) {
    return 'Authentication error: Please log in again.';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Validation errors
  if (error.status === 400 || error.status === 422) {
    return error.message || 'Invalid data provided. Please check your inputs.';
  }

  // Not found errors
  if (error.status === 404) {
    return error.message || 'The requested resource was not found.';
  }

  // Server errors
  if (error.status >= 500) {
    return 'Server error: Please try again later.';
  }

  // Default case
  return error.message || 'An error occurred. Please try again.';
} 