import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError, getErrorMessage } from './errorHandler';

// Define the base API instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized error (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            // Try to get a new token
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              { refreshToken }
            );
            
            const { access_token } = response.data;
            
            // Save the new token
            localStorage.setItem(
              process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token', 
              access_token
            );
            
            // Update the failed request with the new token and retry
            if (originalRequest && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh token is invalid, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_NAME || 'hotel_booking_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
      }
    }
    
    // Process the error through our standardized error handler
    const apiError = handleApiError(error);
    
    // Log error to console for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', apiError.status, apiError.message, apiError);
    }
    
    // For network errors, show a notification if in browser environment
    if (apiError.isNetworkError && typeof window !== 'undefined') {
      // This could be a good place to trigger a global notification
      console.error('Network Error:', getErrorMessage(apiError));
    }
    
    // Return a rejected promise with our standardized error
    return Promise.reject(apiError);
  }
);

// Common HTTP method wrappers
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.get<T>(url, config),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.post<T>(url, data, config),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.put<T>(url, data, config),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.patch<T>(url, data, config),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.delete<T>(url, config),
};

export default apiClient; 