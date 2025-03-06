/**
 * Booking Routes Module
 * Handles all HTTP requests related to Booking operations
 */
import express from 'express';
import { body, param } from 'express-validator';
import { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking } from '../controllers/booking.controller.js';

// Create a new Express router instance for Booking routes
const router = express.Router();

/**
 * Validation rules for creating/updating bookings
 */
const validateBooking = [
  // Checks if the userId is provided and is a valid number 
  body('userId').isInt().withMessage('User ID must be a valid number'),
  // Checks if the bookingDate is provided and is a valid date string
  body('bookingDate').isISO8601().withMessage('Booking date must be a valid date'),
  // Checks if the status is provided and is one of the valid statuses
  body('status').optional().isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Invalid status'),
];

/**
 * Validation rule for booking ID parameter (for routes that require an ID)
 */
const validateBookingId = [
  param('id').isInt().withMessage('Booking ID must be a valid number'),
];

/**
 * GET /api/bookings
 * Retrieves all bookings from the database
 */
router.get('/', getAllBookings);

/**
 * GET /api/bookings/:id
 * Retrieves a specific booking by its ID
 */
router.get('/:id', validateBookingId, getBookingById);

/**
 * POST /api/bookings
 * Creates a new booking in the database
 */
router.post('/', validateBooking, createBooking);

/**
 * PUT /api/bookings/:id
 * Updates an existing booking's information
 */
router.put('/:id', validateBookingId, validateBooking, updateBooking);

/**
 * DELETE /api/bookings/:id
 * Removes a booking from the system
 */
router.delete('/:id', validateBookingId, deleteBooking);

export default router;
