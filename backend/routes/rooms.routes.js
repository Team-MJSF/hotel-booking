/**
 * Room Routes Module
 * Handles all HTTP requests related to Room operations
 */
import express from 'express';
import { body } from 'express-validator';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, checkRoomAvailability, getRoomsByAmenities } from '../controllers/rooms.controller.js';

// Create a new Express router instance for Room routes
const router = express.Router();

// Defines validation rules for Room-related operations using express-validator middleware
const validateRoom = [
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('roomType').isIn(['Single', 'Double', 'Suite']).withMessage('Invalid room type'),
  body('pricePerNight').isFloat({ gt: 0 }).withMessage('Price per night must be a positive number'),
  body('maxGuests').isInt({ gt: 0 }).withMessage('Maximum guests must be a positive integer'),
  body('availabilityStatus').optional().isIn(['Available', 'Booked', 'Maintenance']).withMessage('Invalid availability status'),
];

// Define CRUD routes for Room operations

/**
 * GET /api/rooms
 * Retrieves all rooms from the database
 */
router.get('/', getAllRooms);

/**
 * GET /api/rooms/:id
 * Retrieves a specific room by its ID
 */
router.get('/:id', getRoomById);

/**
 * POST /api/rooms
 * Creates a new room in the database
 */
router.post('/', validateRoom, createRoom);

/**
 * PUT /api/rooms/:id
 * Updates an existing room's information
 */
router.put('/:id', validateRoom, updateRoom);

/**
 * DELETE /api/rooms/:id
 * Removes a room from the system
 */
router.delete('/:id', deleteRoom);

/**
 * GET /api/rooms/availability
 * Checks room availability for a specified date range
 */
router.get('/availability', checkRoomAvailability);

/**
 * GET /api/rooms/amenities
 * Retrieves rooms that have specific amenities
 */
router.get('/amenities', getRoomsByAmenities);

export default router;
