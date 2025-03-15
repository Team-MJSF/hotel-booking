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
import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import DefaultBookings from '../models/Bookings.js';
import DefaultUsers from '../models/Users.js';
import DefaultRooms from '../models/Rooms.js';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';
interface BookingsControllerDependencies {
    Bookings?: typeof DefaultBookings;
    Users?: typeof DefaultUsers;
    Rooms?: typeof DefaultRooms;
    validator?: typeof validationResult;
}
interface BookingsController {
    getAllBookings: (req: Request, res: Response) => Promise<void>;
    getBookingById: (req: Request, res: Response) => Promise<void>;
    createBooking: (req: Request, res: Response) => Promise<Response | void>;
    updateBooking: (req: Request, res: Response) => Promise<Response | void>;
    deleteBooking: (req: Request, res: Response) => Promise<void>;
}
/**
 * Create a Booking Controller factory
 *
 * This factory function creates booking controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 *
 * @param deps - Dependencies to inject
 * @returns Controller methods
 */
export declare const createBookingsController: (deps?: BookingsControllerDependencies) => BookingsController;
export {};
