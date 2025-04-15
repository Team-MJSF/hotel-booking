import axios from 'axios';
import { ApiResponse, Booking, Room, RoomSearchParams, RoomType, User } from '@/types';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Important for CORS
  timeout: 10000, // 10 seconds timeout
});

console.log('API configured with baseURL:', api.defaults.baseURL);

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    try {
      // If token exists, add it to the request headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Adding auth token to request: ${config.url || 'unknown'} (Token: ${token.substring(0, 15)}...)`);
      } else {
        console.log(`No auth token found for request: ${config.url || 'unknown'}`);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to help debug issues
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url || 'unknown'} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error('API error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // If 401 Unauthorized, clear token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        console.log('Cleared token due to 401 unauthorized response');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Test API Connection
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Testing API connection to:', api.defaults.baseURL);
      const response = await api.get('/health');
      console.log('API connection test response:', response.data);
      return { 
        success: true, 
        message: `Successfully connected to the API. Server time: ${response.data.timestamp}` 
      };
    } catch (error) {
      console.error('API connection test failed:', error);
      return { 
        success: false, 
        message: axios.isAxiosError(error) 
          ? `Connection failed: ${error.message}` 
          : 'Connection failed: Unknown error' 
      };
    }
  },
  
  // Login user
  login: async (email: string, password: string): Promise<ApiResponse<{user: User, token: string}>> => {
    try {
      console.log('Attempting login with credentials:', { email });
      
      // Log the request that we're about to make
      console.log('Making login request to:', `${api.defaults.baseURL}/auth/login`);
      
      const response = await api.post('/auth/login', { email, password });
      
      // Log the raw response for debugging
      console.log('Raw login response status:', response.status);
      console.log('Raw login response headers:', response.headers);
      console.log('Raw login response data:', JSON.stringify(response.data));
      
      // Get access token from response, supporting multiple response formats
      let accessToken = null;
      
      // Check for direct token in response
      if (response.data && response.data.access_token) {
        accessToken = response.data.access_token;
      } 
      // Check for token wrapped in data property
      else if (response.data && response.data.data && response.data.data.access_token) {
        accessToken = response.data.data.access_token;
      }
      // Try to access the token even if it's deeply nested
      else if (response.data && typeof response.data === 'object') {
        // Recursively search for access_token in the object
        const findToken = (obj: any): string | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          if (obj.access_token) return obj.access_token;
          
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
              const found = findToken(obj[key]);
              if (found) return found;
            }
          }
          
          return null;
        };
        
        accessToken = findToken(response.data);
      }
      
      if (accessToken) {
        // Store the access token in localStorage
        localStorage.setItem('token', accessToken);
        console.log('Stored token in localStorage:', accessToken.substring(0, 15) + '...');
        
        // Fetch the user profile with the new token
        try {
          console.log('Fetching user profile after login...');
          const userResponse = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          console.log('User profile response:', userResponse.data);
          
          // Support both response formats
          const userData = userResponse.data && userResponse.data.data 
            ? userResponse.data.data 
            : userResponse.data;
            
          if (userData) {
            return {
              success: true,
              data: {
                user: userData,
                token: accessToken
              }
            };
          } else {
            console.error('User profile response has no data');
          }
        } catch (profileError) {
          console.error('Error fetching user profile after login:', profileError);
          // Return success with partial data if profile fetch fails
          return {
            success: true,
            data: {
              // Create minimal user object from login info
              user: {
                id: '', // Will be populated later
                email: email,
                firstName: '',
                lastName: '',
                role: 'user', // Matches backend enum
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: accessToken
            }
          };
        }
      } else {
        // Log the detailed response structure for debugging
        console.error('Login response missing expected structure. access_token not found in:', response.data);
        console.error('Complete response object:', response);
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            headers: error.config?.headers,
          }
        });
        
        if (error.response) {
          // Extract the error message properly
          const errorData = error.response.data;
          // Handle the case where errorData might be an object with message property
          const errorMessage = typeof errorData === 'object' && errorData !== null 
            ? errorData.message || errorData.error || 'Authentication failed'
            : 'Authentication failed';
            
          return { 
            success: false, 
            error: errorMessage
          };
        }
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Register user
  register: async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<User>> => {
    try {
      console.log('Sending registration data to API:', userData);
      const response = await api.post<ApiResponse<User>>('/auth/register', userData);
      console.log('Registration API response:', response.data);
      
      if (response.data.success) {
        return response.data;
      } else {
        // Handle any non-success responses that don't throw errors
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        
        if (error.response) {
          // Check for 409 conflict (email already exists)
          if (error.response.status === 409) {
            return { 
              success: false, 
              error: 'Email already exists. Please use a different email or try logging in.' 
            };
          }
          
          // Return the error response from the API
          if (error.response.data) {
            return error.response.data as ApiResponse<User>;
          }
        }
      }
      // Default error response
      return { success: false, error: 'Network error or server unavailable' };
    }
  },
  
  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available in getCurrentUser');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('Fetching current user profile with token');
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Profile API response:', response.data);
      
      if (response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return { success: false, error: 'Failed to get user profile' };
    } catch (error) {
      console.error('Error fetching current user:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Token might be invalid, clear it
          localStorage.removeItem('token');
          console.log('Removed invalid token from localStorage');
        }
        
        const errorData = error.response.data;
        const errorMessage = typeof errorData === 'object' && errorData !== null 
          ? errorData.message || errorData.error || 'Authentication failed'
          : 'Authentication failed';
          
        return { 
          success: false, 
          error: errorMessage
        };
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
  },

  // Alternative login using fetch API directly
  loginWithFetch: async (email: string, password: string): Promise<ApiResponse<{user: User, token: string}>> => {
    try {
      console.log('Attempting login with fetch API');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const loginUrl = `${apiUrl}/auth/login`;
      
      console.log('Making fetch request to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors', // explicitly set CORS mode
        credentials: 'include', // include cookies if any
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        cors: response.headers.get('access-control-allow-origin'),
        allowHeaders: response.headers.get('access-control-allow-headers'),
        exposeHeaders: response.headers.get('access-control-expose-headers')
      });
      
      // Try to parse the response as JSON
      let responseText;
      let data;
      try {
        responseText = await response.text();
        console.log('Raw response text:', responseText);
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Response text was:', responseText);
        return { success: false, error: 'Invalid JSON response from server' };
      }
      
      console.log('Parsed login response data:', data);
      
      // Get access token from response, supporting multiple response formats
      let accessToken = null;
      
      // Check for direct token in response
      if (data && data.access_token) {
        accessToken = data.access_token;
      } 
      // Check for token wrapped in data property
      else if (data && data.data && data.data.access_token) {
        accessToken = data.data.access_token;
      }
      // Try to access the token even if it's deeply nested
      else if (data && typeof data === 'object') {
        // Recursively search for access_token in the object
        const findToken = (obj: any): string | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          if (obj.access_token) return obj.access_token;
          
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
              const found = findToken(obj[key]);
              if (found) return found;
            }
          }
          
          return null;
        };
        
        accessToken = findToken(data);
      }
      
      if (accessToken) {
        // Store the access token in localStorage
        localStorage.setItem('token', accessToken);
        console.log('Stored token in localStorage:', accessToken.substring(0, 15) + '...');
        
        // Fetch the user profile with the new token
        try {
          console.log('Fetching user profile after login...');
          const profileUrl = `${apiUrl}/auth/profile`;
          const userResponse = await fetch(profileUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors',
          });
          
          if (userResponse.ok) {
            const userDataText = await userResponse.text();
            let userData;
            
            try {
              userData = JSON.parse(userDataText);
              console.log('User profile raw response:', userDataText);
              console.log('User profile parsed response:', userData);
              
              // Support both response formats
              const userObj = userData && userData.data ? userData.data : userData;
              
              return {
                success: true,
                data: {
                  user: userObj,
                  token: accessToken
                }
              };
            } catch (parseError) {
              console.error('Error parsing user profile JSON:', parseError);
              console.error('User profile response text was:', userDataText);
            }
          } else {
            console.error('Failed to fetch user profile:', userResponse.status);
            // Fall back to minimal user data
            return {
              success: true,
              data: {
                user: {
                  id: '', 
                  email: email,
                  firstName: '',
                  lastName: '',
                  role: 'user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                token: accessToken
              }
            };
          }
        } catch (profileError) {
          console.error('Error fetching user profile after login:', profileError);
          // Return success with partial data if profile fetch fails
          return {
            success: true,
            data: {
              user: {
                id: '',
                email: email,
                firstName: '',
                lastName: '',
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: accessToken
            }
          };
        }
      } else {
        console.error('Login response missing expected structure. access_token not found in:', data);
      }
      
      // If we've reached this point, something went wrong
      return { 
        success: false, 
        error: response.ok ? 'Invalid response format from server' : `Server error: ${response.status}` 
      };
    } catch (error) {
      console.error('Login with fetch failed:', error);
      return { success: false, error: 'Network error or server unavailable' };
    }
  },
};

// Room services
export const roomService = {
  // Get all room types
  getRoomTypes: async (): Promise<ApiResponse<RoomType[]>> => {
    try {
      const response = await api.get<ApiResponse<RoomType[]>>('/room-types');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get room type by ID
  getRoomTypeById: async (id: string): Promise<ApiResponse<RoomType>> => {
    try {
      const response = await api.get<ApiResponse<RoomType>>(`/room-types/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Search available rooms
  searchRooms: async (params: RoomSearchParams): Promise<ApiResponse<Room[]>> => {
    try {
      const response = await api.get<ApiResponse<Room[]>>('/rooms/available', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Room[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get room by ID
  getRoomById: async (id: string): Promise<ApiResponse<Room>> => {
    try {
      const response = await api.get<ApiResponse<Room>>(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Room>;
      }
      return { success: false, error: 'Network error' };
    }
  },
};

// Booking services
export const bookingService = {
  // Create new booking
  createBooking: async (bookingData: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    specialRequests?: string;
  }): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get user's bookings
  getUserBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get booking by ID
  getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Cancel booking
  cancelBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking>;
      }
      return { success: false, error: 'Network error' };
    }
  },
};

// Payment services (mocked for school project)
export const paymentService = {
  // Process payment
  processPayment: async (bookingId: string, paymentDetails: {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
  }): Promise<ApiResponse<{success: boolean; transactionId: string}>> => {
    try {
      // This is a mock implementation for the school project
      // In a real-world scenario, this would connect to a payment gateway
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Always return success for mock implementation
      return {
        success: true,
        data: {
          success: true,
          transactionId: `mock-tx-${Date.now()}`
        }
      };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  },
};

// Debug helper functions (can be called from browser console)
export const debugApi = {
  checkAuthToken: () => {
    const token = localStorage.getItem('token');
    console.log('Current auth token exists:', !!token);
    if (token) {
      console.log('Token prefix:', token.substring(0, 20) + '...');
      try {
        // Try to decode the JWT payload (just for debugging, not for security)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        console.log('Decoded token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Current time:', new Date().toLocaleString());
        console.log('Is token expired:', payload.exp * 1000 < Date.now());
        
        return { 
          hasToken: true, 
          isValid: payload.exp * 1000 > Date.now(),
          payload
        };
      } catch (error) {
        console.error('Failed to decode token:', error);
        return { hasToken: true, isValid: false, error: 'Invalid token format' };
      }
    }
    return { hasToken: false };
  },
  
  testApiConnection: async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/health');
      console.log('API connection test status:', response.status);
      const data = await response.json();
      console.log('API health check response:', data);
      return { success: true, data };
    } catch (error) {
      console.error('API connection test failed:', error);
      return { success: false, error };
    }
  }
}; 