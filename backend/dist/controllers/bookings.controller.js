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
import { Op } from 'sequelize';
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
 * @param deps - Dependencies to inject
 * @returns Controller methods
 */
export const createBookingsController = (deps = {}) => {
    const { Bookings = DefaultBookings, Users = DefaultUsers, Rooms = DefaultRooms, validator = validationResult } = deps;
    const getAllBookings = async (req, res) => {
        try {
            const bookings = await Bookings.findAll({
                include: [
                    { model: Users, as: 'Users' },
                    { model: Rooms, as: 'Rooms' }
                ]
            });
            res.json(bookings);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                message: 'Error fetching bookings',
                error: errorMessage
            });
        }
    };
    const getBookingById = async (req, res) => {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                message: 'Error fetching booking',
                error: errorMessage
            });
        }
    };
    const createBooking = async (req, res) => {
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
                status: req.body.status || 'Pending'
            });
            res.status(201).json(newBooking);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                message: 'Error creating booking',
                error: errorMessage
            });
        }
    };
    const updateBooking = async (req, res) => {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                message: 'Error updating booking',
                error: errorMessage
            });
        }
    };
    const deleteBooking = async (req, res) => {
        try {
            const booking = await Bookings.findByPk(req.params.id);
            if (!booking) {
                res.status(404).json({ message: 'Booking not found' });
                return;
            }
            await booking.destroy();
            res.json({ message: 'Booking deleted successfully' });
        }
        catch (error) {
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
