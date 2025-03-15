/**
 * Room Routes Module
 * Handles all HTTP requests related to Room operations
 */
import * as express from 'express';
import { Router } from 'express';
import { body } from 'express-validator';
import type { ValidationChain } from 'express-validator';
import roomsController, { 
  createRoomsController,
  type RoomType,
  type RoomStatus
} from '../controllers/rooms.controller.js';

// Create a new Express router instance for Room routes
const router: Router = express.Router();

// Define room types and statuses as constants
const ROOM_TYPES: RoomType[] = ['Single', 'Double', 'Suite'];
const ROOM_STATUSES: RoomStatus[] = ['Available', 'Booked', 'Maintenance'];

// Defines validation rules for Room-related operations using express-validator middleware
const validateRoom: ValidationChain[] = [
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('roomType').isIn(ROOM_TYPES).withMessage('Invalid room type'),
  body('pricePerNight').isFloat({ gt: 0 }).withMessage('Price per night must be a positive number'),
  body('maxGuests').isInt({ gt: 0 }).withMessage('Maximum guests must be a positive integer'),
  body('availabilityStatus')
    .optional()
    .isIn(ROOM_STATUSES)
    .withMessage('Invalid availability status'),
];

// Define CRUD routes for Room operations

/**
 * GET /api/rooms
 * Retrieves all rooms from the database
 */
router.get('/', roomsController.getAllRooms);

/**
 * GET /api/rooms/availability
 * Checks room availability for a specified date range
 */
router.get('/availability', roomsController.checkRoomAvailability);

/**
 * GET /api/rooms/amenities
 * Retrieves rooms that have specific amenities
 */
router.get('/amenities', roomsController.getRoomsByAmenities);

/**
 * GET /api/rooms/:id
 * Retrieves a specific room by its ID
 */
router.get('/:id', roomsController.getRoomById);

/**
 * POST /api/rooms
 * Creates a new room in the database
 */
router.post('/', validateRoom, roomsController.createRoom);

/**
 * PUT /api/rooms/:id
 * Updates an existing room's information
 */
router.put('/:id', validateRoom, roomsController.updateRoom);

/**
 * DELETE /api/rooms/:id
 * Removes a room from the system
 */
router.delete('/:id', roomsController.deleteRoom);

export default router; 