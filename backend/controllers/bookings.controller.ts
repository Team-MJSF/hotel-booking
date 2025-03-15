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
import type { ValidationChain, ValidationError } from 'express-validator';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import type { Model, ModelStatic } from 'sequelize';

// Default model imports for backward compatibility
import DefaultBookings from '../models/Bookings.js';
import DefaultUsers from '../models/Users.js';
import DefaultRooms from '../models/Rooms.js';
import type { BookingAttributes, BookingCreationAttributes } from '../models/Bookings.js';
import type { UserAttributes } from '../models/Users.js';
import type { RoomAttributes } from '../models/Rooms.js';

// Type definitions
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

// Define type for Sequelize model instances
interface BookingModel extends Model<BookingAttributes, BookingCreationAttributes>, BookingAttributes {}
interface UserModel extends Model<UserAttributes>, UserAttributes {}
interface RoomModel extends Model<RoomAttributes>, RoomAttributes {}

// Interface for controller dependencies
interface BookingsControllerDependencies {
  Bookings?: typeof DefaultBookings;
  Users?: typeof DefaultUsers;
  Rooms?: typeof DefaultRooms;
  validator?: typeof validationResult;
}

// Interface for controller methods
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
export const createBookingsController = (deps: BookingsControllerDependencies = {}): BookingsController => {
  const {
    Bookings = DefaultBookings,
    Users = DefaultUsers,
    Rooms = DefaultRooms,
    validator = validationResult
  } = deps;

  const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookings = await Bookings.findAll({
        include: [
          { model: Users, as: 'Users' },
          { model: Rooms, as: 'Rooms' }
        ]
      });
      res.json(bookings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: 'Error fetching bookings', 
        error: errorMessage 
      });
    }
  };

  const getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const booking = await Bookings.findByPk(req.params.id, {
        include: [
          { model: Users, as: 'Users' },
          { model: Rooms, as: 'Rooms' }
        ]
      });

      if (!booking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: 'Error fetching booking', 
        error: errorMessage 
      });
    }
  };

  const createBooking = async (req: Request, res: Response): Promise<Response | void> => {
    const errors = validator(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newBooking = await Bookings.create({
        userId: req.body.userId,
        roomId: req.body.roomId,
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate,
        status: req.body.status || 'Pending' as BookingStatus
      });

      res.status(201).json(newBooking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: 'Error creating booking', 
        error: errorMessage 
      });
    }
  };

  const updateBooking = async (req: Request, res: Response): Promise<Response | void> => {
    const errors = validator(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const booking = await Bookings.findByPk(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      await booking.update({
        userId: req.body.userId || booking.userId,
        roomId: req.body.roomId || booking.roomId,
        checkInDate: req.body.checkInDate || booking.checkInDate,
        checkOutDate: req.body.checkOutDate || booking.checkOutDate,
        status: req.body.status || booking.status
      });

      res.json(booking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: 'Error updating booking', 
        error: errorMessage 
      });
    }
  };

  const deleteBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const booking = await Bookings.findByPk(req.params.id);
      if (!booking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }

      await booking.destroy();
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: 'Error deleting booking', 
        error: errorMessage 
      });
    }
  };

  return {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking
  };
};