/**
 * Unit Tests for the Bookings Controller
 *
 * This file contains comprehensive tests for the booking-related functionality in our API.
 * We test five main controller functions:
 * 1. getAllBookings - Retrieving booking lists
 * 2. getBookingById - Retrieving a specific booking by ID
 * 3. createBooking - Creating new bookings
 * 4. updateBooking - Updating existing bookings
 * 5. deleteBooking - Deleting bookings
 *
 * The tests use dependency injection to provide mock implementations of the models,
 * making testing cleaner and more maintainable.
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
// Create mock models with type assertions
const mockBookingsModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};
const mockUsersModel = {};
const mockRoomsModel = {};
// Create a simple validator mock
const mockValidator = jest.fn().mockReturnValue({
    isEmpty: () => true,
    array: () => []
});
// Import the controller factory
import { createBookingsController } from '../../controllers/bookings.controller.js';
/**
 * Helper function to create a mock response object
 */
const mockResponse = () => {
    const res = {};
    // @ts-expect-error - Jest mock return type doesn't match Express types
    res.status = jest.fn().mockReturnThis();
    // @ts-expect-error - Jest mock return type doesn't match Express types
    res.json = jest.fn().mockReturnThis();
    return res;
};
/**
 * Helper function to create a mock booking
 */
const createMockBooking = (overrides = {}) => ({
    bookingId: 1,
    userId: 101,
    roomId: 201,
    checkInDate: '2024-03-15',
    checkOutDate: '2024-03-20',
    status: 'Confirmed',
    // @ts-expect-error - Jest mock parameter type incompatibility
    update: jest.fn().mockResolvedValue(undefined),
    // @ts-expect-error - Jest mock parameter type incompatibility
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides
});
/**
 * Tests for the getAllBookings controller function
 *
 * This test suite covers various scenarios for retrieving booking lists,
 * including successful retrieval and error handling.
 */
describe('Bookings Controller - getAllBookings', () => {
    let bookingsController;
    beforeEach(() => {
        jest.clearAllMocks();
        bookingsController = createBookingsController({
            Bookings: mockBookingsModel,
            Users: mockUsersModel,
            Rooms: mockRoomsModel,
            validator: mockValidator
        });
    });
    test('should return all bookings with user and room details', async () => {
        const mockBookings = [
            createMockBooking({
                Users: { userId: 101, name: 'John Doe' },
                Rooms: { roomId: 201, roomNumber: '101' }
            }),
            createMockBooking({
                bookingId: 2,
                userId: 102,
                roomId: 202,
                Users: { userId: 102, name: 'Jane Smith' },
                Rooms: { roomId: 202, roomNumber: '102' }
            })
        ];
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findAll.mockResolvedValue(mockBookings);
        const req = {};
        const res = mockResponse();
        await bookingsController.getAllBookings(req, res);
        expect(mockBookingsModel.findAll).toHaveBeenCalledWith({
            include: [
                { model: mockUsersModel, as: 'Users' },
                { model: mockRoomsModel, as: 'Rooms' }
            ]
        });
        expect(res.json).toHaveBeenCalledWith(mockBookings);
    });
    test('should handle errors and return 500 status', async () => {
        const errorMessage = 'Database error';
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findAll.mockRejectedValue(new Error(errorMessage));
        const req = {};
        const res = mockResponse();
        await bookingsController.getAllBookings(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error fetching bookings',
            error: errorMessage
        });
    });
});
/**
 * Tests for the getBookingById controller function
 *
 * This test suite covers scenarios for retrieving a specific booking,
 * including successful retrieval, not found cases, and error handling.
 */
describe('Bookings Controller - getBookingById', () => {
    let bookingsController;
    beforeEach(() => {
        jest.clearAllMocks();
        bookingsController = createBookingsController({
            Bookings: mockBookingsModel,
            Users: mockUsersModel,
            Rooms: mockRoomsModel,
            validator: mockValidator
        });
    });
    test('should return booking with user and room details', async () => {
        const mockBooking = createMockBooking({
            Users: { userId: 101, name: 'John Doe' },
            Rooms: { roomId: 201, roomNumber: '101' }
        });
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        await bookingsController.getBookingById(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('1', {
            include: [
                { model: mockUsersModel, as: 'Users' },
                { model: mockRoomsModel, as: 'Rooms' }
            ]
        });
        expect(res.json).toHaveBeenCalledWith(mockBooking);
    });
    test('should return 404 if booking is not found', async () => {
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(null);
        const req = { params: { id: '999' } };
        const res = mockResponse();
        await bookingsController.getBookingById(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('999', {
            include: [
                { model: mockUsersModel, as: 'Users' },
                { model: mockRoomsModel, as: 'Rooms' }
            ]
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Booking not found'
        });
    });
    test('should handle database errors and return 500 status', async () => {
        const errorMessage = 'Database error during retrieval';
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockRejectedValue(new Error(errorMessage));
        const req = { params: { id: '1' } };
        const res = mockResponse();
        await bookingsController.getBookingById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error fetching booking',
            error: errorMessage
        });
    });
});
/**
 * Tests for the createBooking controller function
 *
 * This test suite covers scenarios for creating new bookings,
 * including successful creation, validation errors, and server errors.
 */
describe('Bookings Controller - createBooking', () => {
    let bookingsController;
    beforeEach(() => {
        jest.clearAllMocks();
        mockValidator.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });
        bookingsController = createBookingsController({
            Bookings: mockBookingsModel,
            Users: mockUsersModel,
            Rooms: mockRoomsModel,
            validator: mockValidator
        });
    });
    test('should create a new booking and return 201 status', async () => {
        const mockBookingData = {
            userId: 101,
            roomId: 201,
            checkInDate: '2024-03-15',
            checkOutDate: '2024-03-20',
            status: 'Pending'
        };
        const mockCreatedBooking = {
            bookingId: 1,
            ...mockBookingData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.create.mockResolvedValue(mockCreatedBooking);
        const req = {
            body: mockBookingData
        };
        const res = mockResponse();
        await bookingsController.createBooking(req, res);
        expect(mockBookingsModel.create).toHaveBeenCalledWith(mockBookingData);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreatedBooking);
    });
    test('should return 400 status when validation fails', async () => {
        const mockValidationErrors = [
            { msg: 'User ID is required', param: 'userId', location: 'body' },
            { msg: 'Room ID is required', param: 'roomId', location: 'body' }
        ];
        mockValidator.mockReturnValue({
            isEmpty: () => false,
            array: () => mockValidationErrors
        });
        const req = { body: {} };
        const res = mockResponse();
        await bookingsController.createBooking(req, res);
        expect(mockBookingsModel.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
    });
    test('should handle database errors and return 500 status', async () => {
        const mockBookingData = {
            userId: 101,
            roomId: 201,
            checkInDate: '2024-03-15',
            checkOutDate: '2024-03-20'
        };
        const errorMessage = 'Database connection failed';
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.create.mockRejectedValue(new Error(errorMessage));
        const req = { body: mockBookingData };
        const res = mockResponse();
        await bookingsController.createBooking(req, res);
        expect(mockBookingsModel.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error creating booking',
            error: errorMessage
        });
    });
});
/**
 * Tests for the updateBooking controller function
 *
 * This test suite covers scenarios for updating bookings,
 * including successful updates, validation errors, not found cases, and error handling.
 */
describe('Bookings Controller - updateBooking', () => {
    let bookingsController;
    beforeEach(() => {
        jest.clearAllMocks();
        mockValidator.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });
        bookingsController = createBookingsController({
            Bookings: mockBookingsModel,
            Users: mockUsersModel,
            Rooms: mockRoomsModel,
            validator: mockValidator
        });
    });
    test('should update booking and return updated data', async () => {
        const mockBooking = createMockBooking();
        // @ts-expect-error - Jest mock doesn't handle 'this' with proper typing
        mockBooking.update.mockImplementation(function (data) {
            Object.assign(this, data);
            return Promise.resolve();
        });
        const updateData = {
            checkInDate: '2024-04-01',
            checkOutDate: '2024-04-05',
            status: 'Confirmed'
        };
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
        const req = {
            params: { id: '1' },
            body: updateData
        };
        const res = mockResponse();
        await bookingsController.updateBooking(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('1');
        expect(mockBooking.update).toHaveBeenCalledWith({
            userId: 101,
            roomId: 201,
            checkInDate: '2024-04-01',
            checkOutDate: '2024-04-05',
            status: 'Confirmed'
        });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            bookingId: 1,
            userId: 101,
            roomId: 201,
            checkInDate: '2024-04-01',
            checkOutDate: '2024-04-05',
            status: 'Confirmed'
        }));
    });
    test('should return 400 status when validation fails', async () => {
        const mockValidationErrors = [
            { msg: 'Check-out date must be after check-in date', param: 'checkOutDate', location: 'body' }
        ];
        mockValidator.mockReturnValue({
            isEmpty: () => false,
            array: () => mockValidationErrors
        });
        const req = {
            params: { id: '1' },
            body: {
                checkInDate: '2024-04-10',
                checkOutDate: '2024-04-01',
            }
        };
        const res = mockResponse();
        await bookingsController.updateBooking(req, res);
        expect(mockBookingsModel.findByPk).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
    });
    test('should return 404 if booking is not found', async () => {
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(null);
        const req = {
            params: { id: '999' },
            body: {
                status: 'Confirmed'
            }
        };
        const res = mockResponse();
        await bookingsController.updateBooking(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('999');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Booking not found'
        });
    });
    test('should handle database errors and return 500 status', async () => {
        const mockBooking = createMockBooking();
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBooking.update.mockRejectedValue(new Error('Database error during update'));
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
        const req = {
            params: { id: '1' },
            body: {
                status: 'Cancelled'
            }
        };
        const res = mockResponse();
        await bookingsController.updateBooking(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error updating booking',
            error: 'Database error during update'
        });
    });
});
/**
 * Tests for the deleteBooking controller function
 *
 * This test suite covers scenarios for deleting bookings,
 * including successful deletion, not found cases, and error handling.
 */
describe('Bookings Controller - deleteBooking', () => {
    let bookingsController;
    beforeEach(() => {
        jest.clearAllMocks();
        bookingsController = createBookingsController({
            Bookings: mockBookingsModel,
            Users: mockUsersModel,
            Rooms: mockRoomsModel,
            validator: mockValidator
        });
    });
    test('should delete booking and return success message', async () => {
        const mockBooking = createMockBooking();
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        await bookingsController.deleteBooking(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('1');
        expect(mockBooking.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: 'Booking deleted successfully'
        });
    });
    test('should return 404 if booking is not found', async () => {
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(null);
        const req = { params: { id: '999' } };
        const res = mockResponse();
        await bookingsController.deleteBooking(req, res);
        expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('999');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Booking not found'
        });
    });
    test('should handle database errors and return 500 status', async () => {
        const mockBooking = createMockBooking();
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBooking.destroy.mockRejectedValue(new Error('Database error during deletion'));
        // @ts-expect-error - Jest mock parameter type incompatibility
        mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
        const req = { params: { id: '1' } };
        const res = mockResponse();
        await bookingsController.deleteBooking(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error deleting booking',
            error: 'Database error during deletion'
        });
    });
});
export {};
