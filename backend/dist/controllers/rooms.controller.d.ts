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
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import DefaultRooms from '../models/Rooms.js';
import DefaultBookings from '../models/Bookings.js';
export type RoomType = 'Single' | 'Double' | 'Suite';
export type RoomStatus = 'Available' | 'Booked' | 'Maintenance';
interface RoomsControllerDependencies {
    Rooms?: typeof DefaultRooms;
    Bookings?: typeof DefaultBookings;
    validator?: typeof validationResult;
}
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
export declare const createRoomsController: (deps?: RoomsControllerDependencies) => RoomsController;
declare const _default: RoomsController;
export default _default;
