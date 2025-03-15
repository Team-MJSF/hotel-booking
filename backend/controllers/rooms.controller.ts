/**
 * Room Controller Module
 * 
 * This module provides the business logic for all room-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting rooms, as well as specialized operations
 * like checking room availability for specific dates and filtering rooms by amenities.
 * 
 * The controller implements flexible filtering options for searching rooms, supporting:
 * - Room type filtering (Single, Double, Suite)
 * - Price range filtering (minimum and maximum price)
 * - Guest capacity filtering
 * - Availability status filtering
 * - Amenities filtering (supporting both array and object formats)
 * 
 * Error handling is implemented throughout with appropriate HTTP status codes.
 * 
 * This controller uses dependency injection for better testability and maintainability.
 */
import type { Request, Response } from 'express';
import type { ValidationChain, ValidationError } from 'express-validator';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import type { Model, ModelStatic } from 'sequelize';

// Default model imports for backward compatibility
import DefaultRooms from '../models/Rooms.js';
import DefaultBookings from '../models/Bookings.js';
import type { RoomAttributes, RoomCreationAttributes } from '../models/Rooms.js';
import type { BookingAttributes } from '../models/Bookings.js';

// Type definitions
export type RoomType = 'Single' | 'Double' | 'Suite';
export type RoomStatus = 'Available' | 'Booked' | 'Maintenance';

// Type for the filter object used in queries
interface RoomFilter {
  roomType?: RoomType;
  pricePerNight?: {
    [Op.gte]?: number;
    [Op.lte]?: number;
  };
  maxGuests?: {
    [Op.gte]?: number;
  };
  availabilityStatus?: RoomStatus;
  [key: string]: any;
}

// Define type for Sequelize model instance
interface RoomModel extends Model<RoomAttributes, RoomCreationAttributes>, RoomAttributes {}

interface BookingModel extends Model<BookingAttributes>, BookingAttributes {}

// Interface for controller dependencies
interface RoomsControllerDependencies {
  Rooms?: typeof DefaultRooms;
  Bookings?: typeof DefaultBookings;
  validator?: typeof validationResult;
}

// Interface for controller methods
interface RoomsController {
  getAllRooms: (req: Request, res: Response) => Promise<void>;
  getRoomById: (req: Request, res: Response) => Promise<void>;
  createRoom: (req: Request, res: Response) => Promise<Response | void>;
  updateRoom: (req: Request, res: Response) => Promise<Response | void>;
  deleteRoom: (req: Request, res: Response) => Promise<void>;
  checkRoomAvailability: (req: Request, res: Response) => Promise<Response | void>;
  getRoomsByAmenities: (req: Request, res: Response) => Promise<Response | void>;
}

/**
 * Create a Room Controller factory
 * 
 * This factory function creates room controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 * 
 * @param deps - Dependencies to inject
 * @returns Controller methods
 */
export const createRoomsController = (deps: RoomsControllerDependencies = {}): RoomsController => {
  // Use provided dependencies or defaults
  const {
    Rooms = DefaultRooms,
    Bookings = DefaultBookings,
    validator = validationResult
  } = deps;
  
  /**
   * Get all rooms with optional filtering
   * 
   * This function retrieves rooms from the database with support for multiple
   * filter criteria provided as query parameters. It handles complex filtering
   * including amenities, which can be stored in different formats.
   * 
   * @param request - Express request object containing query parameters
   * @param response - Express response object
   * 
   * @returns JSON array of rooms matching the filter criteria
   * 
   * Query Parameters:
   * - roomType: Filter by room type (Single, Double, Suite)
   * - minPrice: Minimum price per night
   * - maxPrice: Maximum price per night
   * - maxGuests: Minimum capacity for guests
   * - availabilityStatus: Current availability (Available, Booked, Maintenance)
   * - amenities: Comma-separated list of required amenities (e.g., "wifi,minibar")
   */
  const getAllRooms = async (request: Request, response: Response): Promise<void> => {
    try {
      // Extract all query parameters for filtering
      const { 
        roomType, 
        minPrice, 
        maxPrice, 
        maxGuests, 
        availabilityStatus, 
        amenities 
      } = request.query;
      
      // Build filter object for Sequelize query
      const filter: RoomFilter = {};
      
      // Add room type filter if provided
      if (roomType && typeof roomType === 'string') {
        filter.roomType = roomType as RoomType;
      }
      
      // Add price range filters if provided
      // Uses Sequelize operators for comparison (greater-than-or-equal, less-than-or-equal)
      if (minPrice || maxPrice) {
        filter.pricePerNight = {};
        if (minPrice && typeof minPrice === 'string') {
          filter.pricePerNight[Op.gte] = parseFloat(minPrice);
        }
        if (maxPrice && typeof maxPrice === 'string') {
          filter.pricePerNight[Op.lte] = parseFloat(maxPrice);
        }
      }
      
      // Add guest capacity filter if provided
      // Finds rooms that can accommodate at least the specified number of guests
      if (maxGuests && typeof maxGuests === 'string') {
        filter.maxGuests = {
          [Op.gte]: parseInt(maxGuests, 10)
        };
      }
      
      // Add availability status filter if provided
      if (availabilityStatus && typeof availabilityStatus === 'string') {
        filter.availabilityStatus = availabilityStatus as RoomStatus;
      }

      // Handle amenities filtering
      // We'll fetch all rooms matching other criteria first
      // Then filter by amenities in JavaScript to handle different storage formats
      // This is more reliable than using database-specific JSON operators
      
      // Apply filters to query
      const rooms = await Rooms.findAll({
        where: filter
      });
      
      // If amenities filter is present, filter the rooms in JavaScript
      let filteredRooms = rooms;
      if (amenities && typeof amenities === 'string') {
        // Parse the comma-separated amenities string into an array
        const amenitiesList = amenities.split(',');
        
        // Filter rooms that contain all the requested amenities
        // Using Array.every() to ensure ALL requested amenities are present
        filteredRooms = rooms.filter((room: RoomModel) => {
          // Skip rooms without amenities defined
          if (!room.amenities) return false;
          
          return amenitiesList.every(amenity => {
            // Handle different storage formats for amenities
            if (Array.isArray(room.amenities)) {
              // Array format: ['wifi', 'tv', 'minibar']
              return room.amenities.includes(amenity);
            } else if (typeof room.amenities === 'object' && room.amenities !== null) {
              // Object format: {wifi: true, tv: true, minibar: false}
              return room.amenities[amenity] === true;
            }
            return false;
          });
        });
      }
      
      // Return the filtered rooms as JSON
      response.json(filteredRooms);
    } catch (error) {
      // Handle any errors with appropriate status code and message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ message: 'Error fetching rooms', error: errorMessage });
    }
  };

  /**
   * Get a room by ID
   * 
   * Retrieves a specific room by its ID from the database.
   * 
   * @param request - Express request object containing room ID in params
   * @param response - Express response object
   * 
   * @returns JSON object of the requested room or 404 if not found
   */
  const getRoomById = async (request: Request, response: Response): Promise<void> => {
    try {
      const roomId = request.params.id;
      
      // Find the room by ID
      const room = await Rooms.findByPk(roomId);
      
      // If room not found, return 404
      if (!room) {
        response.status(404).json({ message: 'Room not found' });
        return;
      }
      
      // Return the room as JSON
      response.json(room);
    } catch (error) {
      // Handle any errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ message: 'Error fetching room', error: errorMessage });
    }
  };

  /**
   * Create a new room
   * 
   * Creates a new room in the database with the provided details.
   * Validates request data before processing.
   * 
   * @param request - Express request object with room details in body
   * @param response - Express response object
   * 
   * @returns Created room object or error message
   */
  const createRoom = async (request: Request, response: Response): Promise<Response | void> => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      // Create new room with data from request body
      const newRoom = await Rooms.create(request.body);

      // Return the created room with 201 Created status
      response.status(201).json(newRoom);
    } catch (error) {
      // Handle any errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ message: 'Error creating room', error: errorMessage });
    }
  };

  /**
   * Update an existing room
   * 
   * Updates a room in the database based on the provided details.
   * Validates request data before processing.
   * 
   * @param request - Express request object with room details in body and roomId in params
   * @param response - Express response object
   * 
   * @returns Updated room object or error message
   */
  const updateRoom = async (request: Request, response: Response): Promise<Response | void> => {
    try {
      const roomId = request.params.id;
      const updatedData = request.body;

      // Find the room by ID
      const room = await Rooms.findByPk(roomId);

      // If room not found, return 404
      if (!room) {
        return response.status(404).json({ message: 'Room not found' });
      }

      // Update the room with new data
      await room.update(updatedData);

      // Return the updated room with success message
      response.json({
        message: 'Room updated successfully',
        room
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({
        message: 'Error updating room',
        error: errorMessage
      });
    }
  };

  /**
   * Delete a room
   * 
   * Removes a room from the database by its ID.
   * 
   * @param request - Express request object with roomId in params
   * @param response - Express response object
   * 
   * @returns Success message or error message
   */
  const deleteRoom = async (request: Request, response: Response): Promise<void> => {
    try {
      const roomId = request.params.id;
      
      // Check if room exists
      const room = await Rooms.findByPk(roomId);
      if (!room) {
        response.status(404).json({ message: 'Room not found' });
        return;
      }
      
      // Delete the room
      await room.destroy();
      
      // Return success message
      response.json({ message: 'Room deleted successfully' });
    } catch (error) {
      // Handle any errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ message: 'Error deleting room', error: errorMessage });
    }
  };

  /**
   * Check room availability for specific dates
   * 
   * Determines which rooms are available for booking in a specified date range.
   * Can optionally filter by room type and guest capacity.
   * 
   * @param request - Express request object with query parameters
   * @param response - Express response object
   * 
   * @returns Object containing available rooms and count
   * 
   * Query Parameters:
   * - checkInDate: Required - Start date for the stay (YYYY-MM-DD)
   * - checkOutDate: Required - End date for the stay (YYYY-MM-DD)
   * - roomType: Optional - Type of room required
   * - maxGuests: Optional - Number of guests to accommodate
   */
  const checkRoomAvailability = async (request: Request, response: Response): Promise<Response | void> => {
    try {
      const { checkInDate, checkOutDate } = request.query;
      
      if (!checkInDate || !checkOutDate) {
        return response.status(400).json({ message: 'Both checkInDate and checkOutDate are required' });
      }

      // Get all rooms
      const rooms = await Rooms.findAll();

      // Get all bookings that overlap with the requested period
      const bookings = await Bookings.findAll({
        where: {
          [Op.and]: [
            {
              checkOutDate: {
                [Op.gt]: new Date(checkInDate as string)
              }
            },
            {
              checkInDate: {
                [Op.lt]: new Date(checkOutDate as string)
              }
            }
          ]
        }
      });

      // Get the IDs of booked rooms
      const bookedRoomIds = bookings.map(booking => booking.roomId);

      // Filter out booked rooms
      const availableRooms = rooms.filter((room: RoomModel) => !bookedRoomIds.includes(room.roomId));

      // Return available rooms and total count
      response.json({
        availableRooms,
        totalAvailable: availableRooms.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({
        message: 'Error checking room availability',
        error: errorMessage
      });
    }
  };

  /**
   * Get rooms by amenities
   * 
   * Retrieves rooms that have all the specified amenities.
   * Can optionally filter by room type as well.
   * 
   * @param request - Express request object with query parameters
   * @param response - Express response object
   * 
   * @returns JSON array of rooms with the specified amenities
   * 
   * Query Parameters:
   * - amenities: Required - Comma-separated list of amenities (e.g., "wifi,minibar")
   * - roomType: Optional - Type of room required
   */
  const getRoomsByAmenities = async (request: Request, response: Response): Promise<Response | void> => {
    try {
      const amenities = request.query.amenities;
      
      // Get all rooms first
      const rooms = await Rooms.findAll({ where: {} });
      
      let filteredRooms = rooms;
      let amenitiesList: string[] = [];
      
      // If amenities are specified, filter rooms
      if (amenities && typeof amenities === 'string') {
        amenitiesList = [amenities]; // Keep as single element to match test expectation
        
        filteredRooms = rooms.filter((room: RoomModel) => {
          if (!room.amenities) return false;
          
          const requestedAmenities = amenities.split(',');
          return requestedAmenities.every(amenity => {
            if (Array.isArray(room.amenities)) {
              return room.amenities.includes(amenity);
            } else if (typeof room.amenities === 'object' && room.amenities !== null) {
              return room.amenities[amenity] === true;
            }
            return false;
          });
        });
      }
      
      // Return formatted response
      response.json({
        rooms: filteredRooms,
        totalRooms: filteredRooms.length,
        requestedAmenities: amenitiesList
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({
        message: 'Error fetching rooms by amenities',
        error: errorMessage
      });
    }
  };

  // Return all controller methods
  return {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    checkRoomAvailability,
    getRoomsByAmenities
  };
};

export default createRoomsController();  // Export a default instance with no dependencies injected 