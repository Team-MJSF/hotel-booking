/**
 * Booking Controller Module
 * 
 * This module provides the business logic for all booking-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting bookings, as well as managing booking statuses
 * and associated user and room information.
 * 
 * The controller implements booking management operations:
 * - Get all bookings (with associated user and room details)
 * - Get booking by ID
 * - Create new booking (with validation)
 * - Update existing booking
 * - Delete booking
 * 
 * Error handling is implemented throughout with appropriate HTTP status codes.
 * 
 * This controller uses dependency injection for better testability and maintainability.
 */
import { validationResult } from 'express-validator';

// Default model imports for backward compatibility
import DefaultBookings from '../models/Bookings.js';
import DefaultUsers from '../models/Users.js';
import DefaultRooms from '../models/Rooms.js';

/**
 * Create a Booking Controller factory
 * 
 * This factory function creates booking controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 * 
 * @param {Object} deps - Dependencies to inject
 * @param {Object} deps.Bookings - Bookings model
 * @param {Object} deps.Users - Users model
 * @param {Object} deps.Rooms - Rooms model
 * @param {Function} deps.validator - Validation function (defaults to express-validator's validationResult)
 * @returns {Object} - Controller methods
 */
export const createBookingsController = (deps = {}) => {
  // Use provided dependencies or defaults
  const {
    Bookings = DefaultBookings,
    Users = DefaultUsers,
    Rooms = DefaultRooms,
    validator = validationResult
  } = deps;

  /**
   * Get all bookings
   * 
   * Retrieves all bookings from the database, including associated user and room details.
   * 
   * @param {Object} request - Express request object
   * @param {Object} response - Express response object
   * @returns {JSON} - JSON array of bookings with user and room details
   */
  const getAllBookings = async (request, response) => {
    try {
      const bookings = await Bookings.findAll({
        include: [
          { model: Users, as: 'Users' },
          { model: Rooms, as: 'Rooms' }
        ]
      });
      response.json(bookings);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error fetching bookings', 
        error: error.message 
      });
    }
  };

  /**
   * Get booking by ID
   * 
   * Retrieves a specific booking by its ID, including associated user and room details.
   * 
   * @param {Object} request - Express request object with booking ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - Booking data with user and room details or error message
   */
  const getBookingById = async (request, response) => {
    try {
      const booking = await Bookings.findByPk(request.params.id, {
        include: [
          { model: Users, as: 'Users' },
          { model: Rooms, as: 'Rooms' }
        ]
      });
      
      if (!booking) {
        return response.status(404).json({ message: 'Booking not found' });
      }
      
      response.json(booking);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error fetching booking', 
        error: error.message 
      });
    }
  };

  /**
   * Create new booking
   * 
   * Creates a new booking in the database with the provided details.
   * Validates request data before processing.
   * 
   * @param {Object} request - Express request object with booking details in body
   * @param {Object} response - Express response object
   * @returns {JSON} - Created booking object or error message
   */
  const createBooking = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const newBooking = await Bookings.create({
        userId: request.body.userId,
        roomId: request.body.roomId,
        checkInDate: request.body.checkInDate,
        checkOutDate: request.body.checkOutDate,
        status: request.body.status || 'Pending'
      });
      
      response.status(201).json(newBooking);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error creating booking', 
        error: error.message 
      });
    }
  };

  /**
   * Update booking
   * 
   * Updates an existing booking's information in the database.
   * Validates request data before processing.
   * 
   * @param {Object} request - Express request object with booking ID parameter and updated data
   * @param {Object} response - Express response object
   * @returns {JSON} - Updated booking object or error message
   */
  const updateBooking = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const booking = await Bookings.findByPk(request.params.id);
      
      if (!booking) {
        return response.status(404).json({ message: 'Booking not found' });
      }

      await booking.update({
        userId: request.body.userId || booking.userId,
        roomId: request.body.roomId || booking.roomId,
        checkInDate: request.body.checkInDate || booking.checkInDate,
        checkOutDate: request.body.checkOutDate || booking.checkOutDate,
        status: request.body.status || booking.status
      });

      response.json(booking);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error updating booking', 
        error: error.message 
      });
    }
  };

  /**
   * Delete booking
   * 
   * Removes a booking from the database by ID.
   * 
   * @param {Object} request - Express request object with booking ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - Success message or error message
   */
  const deleteBooking = async (request, response) => {
    try {
      const booking = await Bookings.findByPk(request.params.id);
      
      if (!booking) {
        return response.status(404).json({ message: 'Booking not found' });
      }

      await booking.destroy();
      response.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      response.status(500).json({ 
        message: 'Error deleting booking', 
        error: error.message 
      });
    }
  };

  // Return all controller methods
  return {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking
  };
};

// For backward compatibility, export pre-initialized controller methods
const defaultController = createBookingsController();
export const { 
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
} = defaultController;
