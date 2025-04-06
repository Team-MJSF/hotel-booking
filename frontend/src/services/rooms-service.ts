import { api } from '@/lib/api/client';
import { Room } from '@/types/booking';

export interface RoomSearchParams {
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  hasBalcony?: boolean;
  hasSeaView?: boolean;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface RoomSearchResponse {
  rooms: Room[];
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const roomsService = {
  /**
   * Fetch all rooms with optional pagination
   * @param page - Page number (starts at 1)
   * @param limit - Number of results per page
   * @returns Promise with rooms data and pagination info
   */
  getAllRooms: async (page = 1, limit = 10): Promise<RoomSearchResponse> => {
    const response = await api.get<RoomSearchResponse>('/rooms', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Search for rooms based on various criteria
   * @param params - Search parameters
   * @returns Promise with rooms data and pagination info
   */
  searchRooms: async (params: RoomSearchParams): Promise<RoomSearchResponse> => {
    const response = await api.get<RoomSearchResponse>('/rooms/search', {
      params
    });
    return response.data;
  },

  /**
   * Get a room by ID
   * @param id - The room ID
   * @returns Promise with room details
   */
  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  /**
   * Check room availability for specific dates
   * @param roomId - The room ID
   * @param checkInDate - Check-in date (YYYY-MM-DD)
   * @param checkOutDate - Check-out date (YYYY-MM-DD)
   * @returns Promise with availability status
   */
  checkRoomAvailability: async (
    roomId: number,
    checkInDate: string,
    checkOutDate: string
  ): Promise<{available: boolean; message?: string}> => {
    const response = await api.get<{available: boolean; message?: string}>(`/rooms/${roomId}/availability`, {
      params: { checkInDate, checkOutDate }
    });
    return response.data;
  },

  /**
   * Get featured rooms for display on home page
   * @param limit - Number of featured rooms to retrieve
   * @returns Promise with featured rooms
   */
  getFeaturedRooms: async (limit = 3): Promise<Room[]> => {
    const response = await api.get<Room[]>('/rooms/featured', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get room types for filtering
   * @returns Promise with available room types
   */
  getRoomTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/rooms/types');
    return response.data;
  },

  /**
   * Get all available amenities for filtering
   * @returns Promise with available amenities
   */
  getAmenities: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/rooms/amenities');
    return response.data;
  }
}; 