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
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

// Default model imports for backward compatibility
import DefaultRooms from '../models/Rooms.js';
import DefaultBookings from '../models/Bookings.js';

/**
 * Create a Room Controller factory
 * 
 * This factory function creates room controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 * 
 * @param {Object} deps - Dependencies to inject
 * @param {Object} deps.Rooms - Rooms model
 * @param {Object} deps.Bookings - Bookings model
 * @param {Function} deps.validator - Validation function (defaults to express-validator's validationResult)
 * @returns {Object} - Controller methods
 */
export const createRoomsController = (deps = {}) => {
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
   * @param {Object} request - Express request object containing query parameters
   * @param {Object} response - Express response object
   * 
   * @returns {JSON} - JSON array of rooms matching the filter criteria
   * 
   * Query Parameters:
   * - roomType: Filter by room type (Single, Double, Suite)
   * - minPrice: Minimum price per night
   * - maxPrice: Maximum price per night
   * - maxGuests: Minimum capacity for guests
   * - availabilityStatus: Current availability (Available, Booked, Maintenance)
   * - amenities: Comma-separated list of required amenities (e.g., "wifi,minibar")
   */
  const getAllRooms = async (request, response) => {
    try {
      // Extract all query parameters for filtering
      const { roomType, minPrice, maxPrice, maxGuests, availabilityStatus, amenities } = request.query;
      
      // Build filter object for Sequelize query
      const filter = {};
      
      // Add room type filter if provided
      if (roomType) {
        filter.roomType = roomType;
      }
      
      // Add price range filters if provided
      // Uses Sequelize operators for comparison (greater-than-or-equal, less-than-or-equal)
      if (minPrice || maxPrice) {
        filter.pricePerNight = {};
        if (minPrice) {
          filter.pricePerNight[Op.gte] = parseFloat(minPrice);
        }
        if (maxPrice) {
          filter.pricePerNight[Op.lte] = parseFloat(maxPrice);
        }
      }
      
      // Add guest capacity filter if provided
      // Finds rooms that can accommodate at least the specified number of guests
      if (maxGuests) {
        filter.maxGuests = {
          [Op.gte]: parseInt(maxGuests, 10)
        };
      }
      
      // Add availability status filter if provided
      if (availabilityStatus) {
        filter.availabilityStatus = availabilityStatus;
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
      if (amenities) {
        // Parse the comma-separated amenities string into an array
        const amenitiesList = amenities.split(',');
        
        // Filter rooms that contain all the requested amenities
        // Using Array.every() to ensure ALL requested amenities are present
        filteredRooms = rooms.filter(room => {
          // Skip rooms without amenities defined
          if (!room.amenities) return false;
          
          return amenitiesList.every(amenity => {
            // Handle different storage formats for amenities
            if (Array.isArray(room.amenities)) {
              // Array format: ['wifi', 'tv', 'minibar']
              return room.amenities.includes(amenity);
            } else if (typeof room.amenities === 'object') {
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
      response.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
  };

  /**
   * Create a new room
   * 
   * Creates a new room in the database with the provided details.
   * Validates request data before processing.
   * 
   * @param {Object} request - Express request object with room details in body
   * @param {Object} response - Express response object
   * 
   * @returns {JSON} - Created room object or error message
   */
  const createRoom = async (request, response) => {
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
      response.status(500).json({ message: 'Error creating room', error: error.message });
    }
  };

  /**
   * Check room availability for specific dates
   * 
   * Determines which rooms are available for booking in a specified date range.
   * Can optionally filter by room type and guest capacity.
   * 
   * @param {Object} request - Express request object with query parameters
   * @param {Object} response - Express response object
   * 
   * @returns {JSON} - Object containing available rooms and count
   * 
   * Query Parameters:
   * - checkInDate: Required - Start date for the stay (YYYY-MM-DD)
   * - checkOutDate: Required - End date for the stay (YYYY-MM-DD)
   * - roomType: Optional - Type of room required
   * - maxGuests: Optional - Number of guests to accommodate
   */
  const checkRoomAvailability = async (request, response) => {
    try {
      // Extract query parameters
      const { checkInDate, checkOutDate, roomType, maxGuests } = request.query;
      
      // Validate that both date parameters are provided
      if (!checkInDate || !checkOutDate) {
        return response.status(400).json({ 
          message: 'Both checkInDate and checkOutDate are required' 
        });
      }
      
      // Parse dates from string to Date objects
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      // Validate that the date range is valid (checkout after checkin)
      if (startDate >= endDate) {
        return response.status(400).json({ 
          message: 'checkOutDate must be after checkInDate' 
        });
      }
      
      // Build filter object for room query
      const roomFilter = {};
      
      // Add optional room type filter
      if (roomType) {
        roomFilter.roomType = roomType;
      }
      
      // Add optional guest capacity filter
      if (maxGuests) {
        roomFilter.maxGuests = {
          [Op.gte]: parseInt(maxGuests, 10)
        };
      }
      
      // Step 1: Get all rooms matching the filter criteria, excluding those under maintenance
      const allRooms = await Rooms.findAll({
        where: {
          ...roomFilter,
          // Only include rooms that are not under maintenance
          availabilityStatus: {
            [Op.ne]: 'Maintenance'
          }
        }
      });
      
      // Step 2: Find bookings that overlap with the requested date range
      const overlappingBookings = await Bookings.findAll({
        where: {
          // Find bookings where:
          // (checkInDate <= requested checkOutDate) AND (checkOutDate >= requested checkInDate)
          // This identifies all date ranges that overlap with the requested period
          [Op.and]: [
            { checkOutDate: { [Op.gt]: startDate } }, // Booking checkout date is after requested check-in
            { checkInDate: { [Op.lt]: endDate } }     // Booking checkin date is before requested check-out
          ],
          // Only consider confirmed bookings
          status: 'Confirmed'
        },
        attributes: ['roomId'] // Only fetch the room IDs, we don't need other booking details
      });
      
      // Extract room IDs that are already booked for the requested period
      const bookedRoomIds = overlappingBookings.map(booking => booking.roomId);
      
      // Step 3: Filter out rooms that are already booked
      const availableRooms = allRooms.filter(room => {
        // Room is available if:
        // 1. It's not in the list of booked rooms for this period
        // 2. Its status is explicitly 'Available'
        return !bookedRoomIds.includes(room.roomId) && room.availabilityStatus === 'Available';
      });
      
      // Return the available rooms with a count
      response.json({
        availableRooms,
        totalAvailable: availableRooms.length
      });
      
    } catch (error) {
      // Handle any errors
      response.status(500).json({ 
        message: 'Error checking room availability', 
        error: error.message 
      });
    }
  };

  /**
   * Get rooms by specific amenities
   * 
   * Filters rooms based on specific amenities they offer, with support for
   * additional room type filtering. Handles different storage formats for amenities
   * (both array and object formats) and provides detailed response with metadata.
   * 
   * @param {Object} request - Express request object with query parameters
   * @param {Object} response - Express response object
   * 
   * @returns {JSON} - Object containing filtered rooms, count, and requested amenities
   * 
   * Query Parameters:
   * - amenities: Required - Comma-separated list of amenities (e.g., "wifi,minibar")
   * - roomType: Optional - Type of room to filter by
   */
  const getRoomsByAmenities = async (request, response) => {
    try {
      // Extract query parameters
      const { amenities, roomType } = request.query;
      
      // Validate that amenities parameter is provided (required)
      if (!amenities) {
        return response.status(400).json({ 
          message: 'Amenities parameter is required' 
        });
      }
      
      // Process amenities for filtering - split comma-separated string into array
      // This allows searching for multiple amenities
      let amenitiesForFiltering;
      if (Array.isArray(amenities)) {
        // If amenities is already an array, use as is
        amenitiesForFiltering = amenities;
      } else {
        // Split string by comma and trim whitespace from each item
        amenitiesForFiltering = amenities.split(',').map(item => item.trim());
      }
      
      // Keep original amenities format for response
      // This preserves the expected response format for API consumers
      const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
      
      // Build filter object for Sequelize query
      const filter = {};
      
      // Add roomType filter if provided
      if (roomType) {
        filter.roomType = roomType;
      }
      
      // Get all rooms that match the filter criteria from database
      const rooms = await Rooms.findAll({
        where: filter
      });
      
      // Filter rooms that contain all the requested amenities
      // And ensure they match any roomType filter that was provided
      const filteredRooms = rooms.filter(room => {
        // Skip rooms without amenities defined
        if (!room.amenities) return false;
        
        // Ensure room matches the roomType filter if it was provided
        // This is a safeguard for tests where the mock might not properly filter
        if (roomType && room.roomType !== roomType) return false;
        
        // Check if all requested amenities are included in the room's amenities
        // Using Array.every() to ensure ALL requested amenities are present
        return amenitiesForFiltering.every(amenity => {
          // Handle different storage formats for amenities
          if (Array.isArray(room.amenities)) {
            // Array format: ['wifi', 'tv', 'minibar']
            return room.amenities.includes(amenity);
          } else if (typeof room.amenities === 'object') {
            // Object format: {wifi: true, tv: true, minibar: false}
            // Only match if the amenity is explicitly set to true
            return room.amenities[amenity] === true;
          }
          return false;
        });
      });
      
      // Return response with rooms, count, and the requested amenities
      response.json({
        rooms: filteredRooms,
        totalRooms: filteredRooms.length,
        requestedAmenities: amenitiesList
      });
      
    } catch (error) {
      // Handle any errors
      response.status(500).json({ 
        message: 'Error fetching rooms by amenities', 
        error: error.message 
      });
    }
  };

  /**
   * Delete a room by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with status message
   */
  const deleteRoom = async (req, res) => {
    try {
      // Find the room by ID
      const room = await Rooms.findByPk(req.params.id);
      
      // If room doesn't exist, return 404
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Delete the room
      await room.destroy();
      
      // Return success message
      return res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      // Handle any errors
      return res.status(500).json({
        message: 'Error deleting room',
        error: error.message
      });
    }
  };

  /**
   * Get a room by ID
   * @param {Object} req - Express request object with room ID parameter
   * @param {Object} res - Express response object
   * @returns {Object} Room data or error message
   */
  const getRoomById = async (req, res) => {
    try {
      // Find the room by ID
      const room = await Rooms.findByPk(req.params.id);
      
      // If room doesn't exist, return 404
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Return the room data
      return res.json(room);
    } catch (error) {
      // Handle any errors
      return res.status(500).json({
        message: 'Error retrieving room',
        error: error.message
      });
    }
  };

  /**
   * Update a room by ID
   * @param {Object} req - Express request object with room ID parameter and updated data
   * @param {Object} res - Express response object
   * @returns {Object} Updated room data or error message
   */
  const updateRoom = async (req, res) => {
    try {
      // Validate input if needed
      if (validator && !validator(req)) {
        return res.status(400).json({ message: 'Invalid room data provided' });
      }
      
      // Find the room by ID
      const room = await Rooms.findByPk(req.params.id);
      
      // If room doesn't exist, return 404
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Update the room with new data
      await room.update(req.body);
      
      // Return the updated room
      return res.json({
        message: 'Room updated successfully',
        room
      });
    } catch (error) {
      // Handle any errors
      return res.status(500).json({
        message: 'Error updating room',
        error: error.message
      });
    }
  };

  // Return all controller methods
  return {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    checkRoomAvailability,
    getRoomsByAmenities,
    deleteRoom
  };
};

// For backward compatibility, export pre-initialized controller methods
const defaultController = createRoomsController();
export const { 
  getAllRooms,
  getRoomById,
  createRoom, 
  updateRoom,
  checkRoomAvailability,
  getRoomsByAmenities,
  deleteRoom
} = defaultController;
