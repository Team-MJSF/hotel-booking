import { api } from './client';

export interface Room {
  id: number;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  capacity: number;
  amenities: string[];
  status: 'available' | 'booked' | 'maintenance';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomSearchParams {
  checkIn?: string;
  checkOut?: string;
  capacity?: number;
  priceMin?: number;
  priceMax?: number;
  roomType?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const roomsService = {
  getAllRooms: async (params?: RoomSearchParams): Promise<PaginatedResponse<Room>> => {
    const response = await api.get<PaginatedResponse<Room>>('/rooms', { params });
    return response.data;
  },
  
  searchRooms: async (params: RoomSearchParams): Promise<PaginatedResponse<Room>> => {
    const response = await api.get<PaginatedResponse<Room>>('/rooms/search', { params });
    return response.data;
  },
  
  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },
  
  // Admin functions
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    const response = await api.post<Room>('/rooms', roomData);
    return response.data;
  },
  
  updateRoom: async (id: number, roomData: Partial<Room>): Promise<Room> => {
    const response = await api.put<Room>(`/rooms/${id}`, roomData);
    return response.data;
  },
  
  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  }
};

export default roomsService; 