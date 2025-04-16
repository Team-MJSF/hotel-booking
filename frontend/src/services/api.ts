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
      const errorDetails = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      };
      
      console.error('API error:', errorDetails);
      
      // If 401 Unauthorized, clear token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        console.log('Cleared token due to 401 unauthorized response');
      }
    } else {
      console.error('Non-Axios error:', error);
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
      console.log('Starting user registration process');
      console.log('Sending registration data to API:', { ...userData, password: '*****', confirmPassword: '*****' });
      
      const apiUrl = api.defaults.baseURL;
      console.log(`Making registration request to ${apiUrl}/auth/register`);
      
      const response = await api.post<ApiResponse<User>>('/auth/register', userData);
      console.log('Registration API response status:', response.status);
      console.log('Registration API response data:', response.data);
      
      if (response.data.success) {
        console.log('Registration successful:', response.data);
        return response.data;
      } else {
        // Handle any non-success responses that don't throw errors
        console.error('Registration returned success:false:', response.data);
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details for registration:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
          method: error.config?.method,
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

  // Alternative registration using fetch API directly
  registerWithFetch: async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<User>> => {
    try {
      console.log('Attempting registration with fetch API');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const registerUrl = `${apiUrl}/auth/register`;
      
      console.log('Making fetch request to:', registerUrl);
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        mode: 'cors', // explicitly set CORS mode
        credentials: 'include', // include cookies if any
      });
      
      console.log('Fetch registration response status:', response.status);
      console.log('Fetch registration response headers:', {
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
        console.log('Raw registration response text:', responseText);
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing JSON response from registration:', parseError);
        console.error('Response text was:', responseText);
        return { success: false, error: 'Invalid JSON response from server' };
      }
      
      console.log('Parsed registration response data:', data);
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration with fetch failed:', error);
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
  getRoomTypeById: async (id: string | number): Promise<ApiResponse<RoomType>> => {
    try {
      const idString = typeof id === 'number' ? id.toString() : id;
      const response = await api.get<ApiResponse<RoomType>>(`/room-types/${idString}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get room type by code
  getRoomTypeByCode: async (code: string): Promise<ApiResponse<RoomType>> => {
    try {
      // Directly call the API with code as a query parameter
      const response = await api.get<ApiResponse<RoomType>>(`/room-types/code/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRoomTypeByCode:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RoomType>;
      }
      
      // Fallback: If the specific endpoint fails, try getting all and filtering
      try {
        const fallbackResponse = await roomService.getRoomTypes();
        
        if (fallbackResponse.success && fallbackResponse.data) {
          const roomType = fallbackResponse.data.find(rt => rt.code === code);
          
          if (roomType) {
            return { success: true, data: roomType };
          }
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
      }
      
      return { success: false, error: 'Room type not found' };
    }
  },
  
  // Search available rooms
  searchRooms: async (params: RoomSearchParams): Promise<ApiResponse<Room[]>> => {
    try {
      const response = await api.get<ApiResponse<Room[]>>('/rooms/search', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Room[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Check specific room availability for given dates
  checkRoomAvailability: async (
    roomTypeId: string | number,
    checkInDate: string,
    checkOutDate: string,
    retryCount = 0
  ): Promise<ApiResponse<{
    availableRooms: Room[];
    totalRooms: number;
    availableCount: number;
  }>> => {
    // Define params outside try/catch to make it available in the catch block
    const params = {
      checkInDate,
      checkOutDate,
      roomTypeId: typeof roomTypeId === 'number' ? roomTypeId.toString() : roomTypeId
    };
    
    try {
      console.log(`Checking availability for room type ${params.roomTypeId} from ${checkInDate} to ${checkOutDate}`);
      
      // Reset availability data to ensure fresh results
      try {
        // Create a new availability object if needed
        let roomAvailability: Record<string, string[]> = {};
        const availabilityJson = localStorage.getItem('roomAvailability');
        if (availabilityJson) {
          roomAvailability = JSON.parse(availabilityJson);
        }
        
        // Clear any existing unavailability data for this room type
        // This ensures we start fresh and only consider current booking conflicts
        roomAvailability[params.roomTypeId] = [];
        localStorage.setItem('roomAvailability', JSON.stringify(roomAvailability));
      } catch (resetError) {
        console.error('Error resetting room availability:', resetError);
      }
      
      // Check if there are any unavailable rooms in localStorage first
      let unavailableRooms: string[] = [];
      
      // Check bookings to see if there are any conflicting bookings
      try {
        const bookingsJson = localStorage.getItem('mockBookings');
        if (bookingsJson) {
          const allBookings: Booking[] = JSON.parse(bookingsJson);
          
          // Parse and normalize the requested dates
          const requestedCheckIn = new Date(checkInDate);
          const requestedCheckOut = new Date(checkOutDate);
          
          // Normalize time portions to ensure accurate date comparison
          requestedCheckIn.setHours(0, 0, 0, 0);
          requestedCheckOut.setHours(0, 0, 0, 0);
          
          console.log(`Normalized dates - Check-in: ${requestedCheckIn.toISOString()}, Check-out: ${requestedCheckOut.toISOString()}`);
          
          const conflictingBookings = allBookings.filter(booking => {
            // Only consider active bookings (confirmed or pending)
            if (booking.status === 'CANCELLED') return false;
            
            // Check if this booking is for the same room type
            if (booking.roomTypeId !== params.roomTypeId.toString()) return false;
            
            // Parse booking dates
            const bookingCheckIn = new Date(booking.checkInDate);
            const bookingCheckOut = new Date(booking.checkOutDate);
            
            // Normalize time portions for accurate comparison
            bookingCheckIn.setHours(0, 0, 0, 0);
            bookingCheckOut.setHours(0, 0, 0, 0);
            
            // A conflict exists if either:
            // 1. The requested check-in is between the booking's check-in and check-out
            // 2. The requested check-out is between the booking's check-in and check-out
            // 3. The booking's stay is completely within the requested stay
            // 4. The requested stay is completely within the booking's stay
            const conflict = 
              // Case 1 & 2: Requested dates overlap with booking dates
              (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn) ||
              // Case 3 & 4: One stay is completely within the other
              (requestedCheckIn <= bookingCheckIn && requestedCheckOut >= bookingCheckOut) ||
              (bookingCheckIn <= requestedCheckIn && bookingCheckOut >= requestedCheckOut);
            
            if (conflict) {
              console.log(`Conflict found with booking ID ${booking.id} for room ${booking.roomNumber}`);
              console.log(`- Booking dates: ${bookingCheckIn.toISOString()} to ${bookingCheckOut.toISOString()}`);
            }
            
            return conflict;
          });
          
          console.log(`Found ${conflictingBookings.length} conflicting bookings`);
          
          // Add booked rooms to unavailable list
          conflictingBookings.forEach(booking => {
            if (!unavailableRooms.includes(booking.roomNumber)) {
              unavailableRooms.push(booking.roomNumber);
            }
          });
          
          // Update the availability data in localStorage
          try {
            const availabilityJson = localStorage.getItem('roomAvailability');
            let roomAvailability: Record<string, string[]> = {};
            
            if (availabilityJson) {
              roomAvailability = JSON.parse(availabilityJson);
            }
            
            roomAvailability[params.roomTypeId] = unavailableRooms;
            localStorage.setItem('roomAvailability', JSON.stringify(roomAvailability));
          } catch (updateError) {
            console.error('Error updating room availability:', updateError);
          }
          
          console.log('Final unavailable rooms:', unavailableRooms);
        }
      } catch (bookingsError) {
        console.error('Error checking bookings for availability:', bookingsError);
      }
      
      // Try the real API with timeout to prevent long requests
      try {
        const response = await api.get<ApiResponse<Room[]>>('/rooms/available', { 
          params,
          timeout: 3000 // 3 second timeout to prevent long requests
        });
        
        if (response.data.success && response.data.data) {
          const availableRoomsFromApi = response.data.data;
          console.log(`API returned ${availableRoomsFromApi.length} available rooms`);
          
          // Filter out rooms that are marked as unavailable in localStorage
          const filteredRooms = availableRoomsFromApi.filter(room => 
            !unavailableRooms.includes(room.roomNumber)
          );
          
          console.log(`After filtering unavailable rooms, ${filteredRooms.length} rooms are available`);
          
          // Map to standard format
          const mappedRooms = filteredRooms.map(room => ({
            ...room,
            roomTypeId: params.roomTypeId
          }));
          
          // For this school project, we're assuming 10 total rooms per type
          const totalRoomsPerType = 10;
          
          return {
            success: true,
            data: {
              availableRooms: mappedRooms,
              totalRooms: totalRoomsPerType,
              availableCount: mappedRooms.length
            }
          };
        }
        
        // If no data or success is false, throw an error to use the fallback
        throw new Error(response.data.error || 'Failed to check room availability');
      } catch (apiError) {
        // Check if this was a rate limit error (429) and we should retry
        if (axios.isAxiosError(apiError) && apiError.response?.status === 429) {
          // Maximum 3 retries with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
            console.log(`Rate limit hit, retrying after ${delay}ms (retry ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return roomService.checkRoomAvailability(roomTypeId, checkInDate, checkOutDate, retryCount + 1);
          } else {
            console.log('Maximum retries reached, using fallback data');
            // Continue to fallback
          }
        }
        
        // For any API error, use the fallback simulation
        // This is important for a school project to ensure the UI works
        console.log('Using simulated availability data after API error:', apiError);
      }
      
      // Fallback: Generate mock data based on actual bookings
      // Get unavailable rooms from localStorage
      let unavailableRoomsCount = unavailableRooms.length;
      
      // Generate simulated available rooms
      const floorNumber = parseInt(params.roomTypeId.toString(), 10);
      const availableRooms: Room[] = [];
      
      // Generate available rooms for this floor
      const totalRooms = 10; // Assuming 10 rooms per floor/type
      for (let i = 1; i <= totalRooms; i++) {
        const roomNumber: string = `${floorNumber}${i.toString().padStart(2, '0')}`;
        
        // Skip this room if it's marked as unavailable
        if (unavailableRooms.includes(roomNumber)) {
          continue;
        }
        
        availableRooms.push({
          id: `room-${roomNumber}`,
          roomNumber: roomNumber,
          roomTypeId: params.roomTypeId,
          type: floorNumber === 1 ? 'standard' : 
                floorNumber === 2 ? 'executive' : 
                floorNumber === 3 ? 'family' :
                floorNumber === 4 ? 'deluxe' : 'premium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log(`Generated ${availableRooms.length} available rooms after filtering`);
      
      return {
        success: true,
        data: {
          availableRooms,
          totalRooms: 10,
          availableCount: availableRooms.length
        }
      };
    } catch (error) {
      console.error('Error checking room availability:', error);
      
      // For school project purposes: Always provide fallback simulation 
      // for any errors to ensure the UI works
      console.log('Using simulated availability data due to error');
      
      // Generate simulated data
      const floorNumber = parseInt(params.roomTypeId.toString(), 10);
      const availableRooms: Room[] = [];
      
      // Generate some random number of available rooms between 1 and 8
      const availableCount = Math.floor(Math.random() * 8) + 1;
      
      // Generate that many available rooms
      for (let i = 1; i <= availableCount; i++) {
        // Use random room numbers that haven't already been booked
        let roomNumber: string;
        do {
          const roomIndex = Math.floor(Math.random() * 10) + 1;
          roomNumber = `${floorNumber}${roomIndex.toString().padStart(2, '0')}`;
        } while (availableRooms.some(room => room.roomNumber === roomNumber));
        
        availableRooms.push({
          id: `room-${roomNumber}`,
          roomNumber: roomNumber,
          roomTypeId: params.roomTypeId,
          type: floorNumber === 1 ? 'standard' : 
                floorNumber === 2 ? 'executive' : 
                floorNumber === 3 ? 'family' :
                floorNumber === 4 ? 'deluxe' : 'premium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return {
        success: true,
        data: {
          availableRooms,
          totalRooms: 10,
          availableCount: availableRooms.length
        }
      };
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
    roomTypeId: string | number;
    roomTypeName: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    specialRequests?: string;
  }): Promise<ApiResponse<Booking>> => {
    try {
      // For school project, we'll store bookings in localStorage
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        return { success: false, error: 'User must be logged in to create a booking' };
      }
      
      // Create a new booking object
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        userId: currentUserId,
        roomId: bookingData.roomId,
        roomTypeId: bookingData.roomTypeId.toString(),
        roomTypeName: bookingData.roomTypeName,
        roomNumber: bookingData.roomId, // For the school project, we're using roomId as the room number
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guestCount: bookingData.guestCount,
        status: 'PENDING',
        totalPrice: 0, // Will be calculated and set by payment service
        specialRequests: bookingData.specialRequests || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Calculate the number of nights
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get the room type details to calculate the price
      try {
        const roomTypeResponse = await roomService.getRoomTypeById(bookingData.roomTypeId);
        if (roomTypeResponse.success && roomTypeResponse.data) {
          // Calculate total price
          newBooking.totalPrice = roomTypeResponse.data.pricePerNight * nights;
        }
      } catch (priceError) {
        console.error('Error calculating price:', priceError);
        // Default price calculation
        newBooking.totalPrice = 100 * nights; // Fallback price for the school project
      }
      
      // Save the booking to localStorage
      try {
        let existingBookings: Booking[] = [];
        const bookingsJson = localStorage.getItem('mockBookings');
        
        if (bookingsJson) {
          existingBookings = JSON.parse(bookingsJson);
        }
        
        // Add the new booking
        existingBookings.push(newBooking);
        
        // Save back to localStorage
        localStorage.setItem('mockBookings', JSON.stringify(existingBookings));
        
        // Update room availability to prevent double bookings
        await updateRoomAvailability(bookingData.roomTypeId.toString(), bookingData.roomId, false);
        
        return { success: true, data: newBooking };
      } catch (storageError) {
        console.error('Error saving booking to localStorage:', storageError);
        return { success: false, error: 'Failed to save booking information' };
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Try the real API if localStorage approach fails
      try {
        // Format data for API
        const apiBookingData = {
          roomId: bookingData.roomId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          specialRequests: bookingData.specialRequests
        };
        const response = await api.post<ApiResponse<Booking>>('/bookings', apiBookingData);
        return response.data;
      } catch (apiError) {
        console.error('API fallback also failed:', apiError);
        
        if (axios.isAxiosError(apiError) && apiError.response) {
          return apiError.response.data as ApiResponse<Booking>;
        }
        return { success: false, error: 'Network error' };
      }
    }
  },
  
  // Update booking status
  updateBookingStatus: async (bookingId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<ApiResponse<Booking>> => {
    try {
      // For the school project, update the booking in localStorage
      let existingBookings: Booking[] = [];
      const bookingsJson = localStorage.getItem('mockBookings');
      
      if (bookingsJson) {
        existingBookings = JSON.parse(bookingsJson);
        
        // Find the booking
        const bookingIndex = existingBookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
          // Update the status
          existingBookings[bookingIndex].status = status;
          existingBookings[bookingIndex].updatedAt = new Date().toISOString();
          
          // Save back to localStorage
          localStorage.setItem('mockBookings', JSON.stringify(existingBookings));
          
          return { success: true, data: existingBookings[bookingIndex] };
        } else {
          return { success: false, error: 'Booking not found' };
        }
      } else {
        return { success: false, error: 'No bookings found' };
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      
      // Try the real API if localStorage approach fails
      try {
        const response = await api.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/status`, { status });
        return response.data;
      } catch (apiError) {
        console.error('API fallback also failed:', apiError);
        
        if (axios.isAxiosError(apiError) && apiError.response) {
          return apiError.response.data as ApiResponse<Booking>;
        }
        return { success: false, error: 'Network error' };
      }
    }
  },

  // Get user's bookings
  getUserBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      // Get current user ID from token if available
      const currentUserId = getCurrentUserId();
      
      // For school project, check if we have mock bookings in localStorage
      try {
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const allMockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          
          // Filter bookings to only show those belonging to the current user
          const userBookings = currentUserId 
            ? allMockBookings.filter(booking => booking.userId === currentUserId)
            : [];
            
          console.log(`Retrieved ${userBookings.length} mock bookings for user ${currentUserId || 'unknown'}`);
          return { success: true, data: userBookings };
        }
      } catch (storageError) {
        console.error('Error reading mock bookings from localStorage:', storageError);
      }
      
      // Attempt to use the real API
      const response = await api.get<ApiResponse<Booking[]>>('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings, falling back to mock data:', error);
      
      // For school project, if API fails but we have mock bookings, return those
      try {
        const currentUserId = getCurrentUserId();
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const allMockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          
          // Filter bookings to only show those belonging to the current user
          const userBookings = currentUserId 
            ? allMockBookings.filter(booking => booking.userId === currentUserId)
            : [];
            
          return { success: true, data: userBookings };
        }
      } catch (storageError) {
        console.error('Error reading mock bookings from localStorage:', storageError);
      }
      
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Booking[]>;
      }
      return { success: false, error: 'Network error' };
    }
  },
  
  // Get booking by ID
  getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      // Get current user ID from token
      const currentUserId = getCurrentUserId();
      
      // First check if we have mock bookings in localStorage for the school project
      try {
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const mockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          const booking = mockBookings.find(b => b.id === id);
          
          // Make sure the booking belongs to the current user
          if (booking && (!currentUserId || booking.userId === currentUserId)) {
            console.log('Found mock booking in localStorage:', booking);
            return { success: true, data: booking };
          } else if (booking) {
            console.log('Found booking but it belongs to another user');
            return { success: false, error: 'Booking not found or access denied' };
          }
        }
      } catch (storageError) {
        console.error('Error reading mock bookings from localStorage:', storageError);
      }
      
      // If no mock booking found, try the real API
      console.log(`Fetching booking with ID: ${id}`);
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      console.log('API response for booking:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getBookingById:', error);
      
      // Try localStorage again as fallback if API call fails
      try {
        const currentUserId = getCurrentUserId();
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const mockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          const booking = mockBookings.find(b => b.id === id);
          
          // Make sure the booking belongs to the current user
          if (booking && (!currentUserId || booking.userId === currentUserId)) {
            console.log('Found mock booking in localStorage (fallback):', booking);
            return { success: true, data: booking };
          } else if (booking) {
            console.log('Found booking but it belongs to another user (fallback)');
            return { success: false, error: 'Booking not found or access denied' };
          }
        }
      } catch (storageError) {
        console.error('Error reading mock bookings from localStorage (fallback):', storageError);
      }
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return error.response.data as ApiResponse<Booking>;
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          return { success: false, error: 'No response from server' };
        }
      }
      // Generic error handler
      return { success: false, error: 'Network error or server unavailable' };
    }
  },
  
  // Cancel booking
  cancelBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    try {
      // Get current user ID from token
      const currentUserId = getCurrentUserId();
      
      // For school project: First check for mock bookings in localStorage
      try {
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const mockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          const bookingIndex = mockBookings.findIndex(b => b.id === id);
          
          // Verify that the booking exists and belongs to the current user
          if (bookingIndex !== -1) {
            const booking = mockBookings[bookingIndex];
            
            // Check if user has permission to cancel this booking
            if (!currentUserId || booking.userId === currentUserId) {
              // Update the booking status to cancelled
              mockBookings[bookingIndex].status = 'CANCELLED';
              mockBookings[bookingIndex].updatedAt = new Date().toISOString();
              
              // Save the updated bookings back to localStorage
              localStorage.setItem('mockBookings', JSON.stringify(mockBookings));
              console.log('Updated mock booking status to CANCELLED:', mockBookings[bookingIndex]);
              
              // Return the updated booking
              return { 
                success: true, 
                data: mockBookings[bookingIndex] 
              };
            } else {
              return {
                success: false,
                error: 'You do not have permission to cancel this booking'
              };
            }
          }
        }
      } catch (storageError) {
        console.error('Error updating mock bookings in localStorage:', storageError);
      }
      
      // If no mock booking was found or updated, try the real API
      console.log(`Sending cancel request for booking ID: ${id}`);
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
      console.log('API cancel response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      
      // Try localStorage again as fallback if API call fails
      try {
        const currentUserId = getCurrentUserId();
        const mockBookingsJSON = localStorage.getItem('mockBookings');
        if (mockBookingsJSON) {
          const mockBookings: Booking[] = JSON.parse(mockBookingsJSON);
          const bookingIndex = mockBookings.findIndex(b => b.id === id);
          
          if (bookingIndex !== -1) {
            const booking = mockBookings[bookingIndex];
            
            // Check if user has permission to cancel this booking
            if (!currentUserId || booking.userId === currentUserId) {
              // Update the booking status to cancelled
              mockBookings[bookingIndex].status = 'CANCELLED';
              mockBookings[bookingIndex].updatedAt = new Date().toISOString();
              
              // Save the updated bookings back to localStorage
              localStorage.setItem('mockBookings', JSON.stringify(mockBookings));
              console.log('Updated mock booking status to CANCELLED (fallback):', mockBookings[bookingIndex]);
              
              // Return the updated booking
              return { 
                success: true, 
                data: mockBookings[bookingIndex] 
              };
            } else {
              return {
                success: false,
                error: 'You do not have permission to cancel this booking'
              };
            }
          }
        }
      } catch (storageError) {
        console.error('Error updating mock bookings in localStorage (fallback):', storageError);
      }
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return error.response.data as ApiResponse<Booking>;
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received from cancel request:', error.request);
          return { success: false, error: 'No response from server' };
        }
      }
      // Generic error handler
      return { success: false, error: 'Network error or server unavailable' };
    }
  },
};

// Helper function to get user ID from token
const getCurrentUserId = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Basic JWT parsing (not for security, just for user ID extraction)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
    
    // Different JWT implementations might store user ID differently
    return payload.sub || payload.id || payload.userId || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

// Helper function to update room availability
const updateRoomAvailability = async (roomTypeId: string, roomNumber: string, isAvailable: boolean): Promise<boolean> => {
  try {
    // For school project, store availability in localStorage
    let roomAvailability: Record<string, string[]> = {};
    const availabilityJson = localStorage.getItem('roomAvailability');
    
    if (availabilityJson) {
      roomAvailability = JSON.parse(availabilityJson);
    }
    
    // Initialize array for this room type if it doesn't exist
    if (!roomAvailability[roomTypeId]) {
      roomAvailability[roomTypeId] = [];
    }
    
    if (isAvailable) {
      // If making the room available, remove it from unavailable list
      roomAvailability[roomTypeId] = roomAvailability[roomTypeId].filter(room => room !== roomNumber);
    } else {
      // If making the room unavailable, add it to the list if not already there
      if (!roomAvailability[roomTypeId].includes(roomNumber)) {
        roomAvailability[roomTypeId].push(roomNumber);
      }
    }
    
    // Save back to localStorage
    localStorage.setItem('roomAvailability', JSON.stringify(roomAvailability));
    
    // Log for debugging
    console.log(`Room ${roomNumber} of type ${roomTypeId} is now ${isAvailable ? 'available' : 'unavailable'}`);
    console.log('Current unavailable rooms:', roomAvailability);
    
    return true;
  } catch (error) {
    console.error('Error updating room availability:', error);
    return false;
  }
};

// Payment services (mocked for school project)
export const paymentService = {
  // Process a mock payment
  processPayment: async (
    bookingId: string, 
    paymentData: {
      paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
      cardNumber?: string;
      cardHolder?: string;
      expiryDate?: string;
      cvv?: string;
      amount: number;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    transactionId: string;
    message: string;
  }>> => {
    try {
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful payment (this would call a real payment provider in production)
      const transactionId = `txn-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const amount = paymentData.amount || 0;
      
      // Store the payment in localStorage
      try {
        let payments: {
          id: string;
          bookingId: string;
          amount: number;
          paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
          status: 'COMPLETED';
          transactionId: string;
          createdAt: string;
        }[] = [];
        
        const paymentsJson = localStorage.getItem('mockPayments');
        if (paymentsJson) {
          payments = JSON.parse(paymentsJson);
        }
        
        payments.push({
          id: `payment-${Date.now()}`,
          bookingId,
          amount,
          paymentMethod: paymentData.paymentMethod,
          status: 'COMPLETED',
          transactionId,
          createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('mockPayments', JSON.stringify(payments));
      } catch (storageError) {
        console.error('Error storing payment in localStorage:', storageError);
      }
      
      // Update booking payment status
      try {
        const bookingsJson = localStorage.getItem('mockBookings');
        if (bookingsJson) {
          const bookings = JSON.parse(bookingsJson);
          const bookingIndex = bookings.findIndex((b: { id: string; }) => b.id === bookingId);
          
          if (bookingIndex !== -1) {
            bookings[bookingIndex].paymentStatus = 'PAID';
            bookings[bookingIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('mockBookings', JSON.stringify(bookings));
          }
        }
      } catch (bookingError) {
        console.error('Error updating booking payment status:', bookingError);
      }
      
      console.log(`Payment for booking ${bookingId} processed successfully, Transaction ID: ${transactionId}, Amount: ${amount}`);
      
      return {
        success: true,
        data: {
          success: true,
          transactionId,
          message: 'Payment processed successfully'
        }
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Failed to process payment. Please try again.'
      };
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