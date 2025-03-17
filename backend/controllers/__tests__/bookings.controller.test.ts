/**
 * TypeScript Test Suite for Bookings Controller
 * 
 * Follows patterns from rooms.controller.test.ts and payments.controller.test.ts
 * Includes proper typing for Express mock objects and Sequelize models
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import type { ValidationError } from 'express-validator';

// Mock models with TypeScript interfaces
interface MockBooking {
  bookingId: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  Users?: MockUser;
  Rooms?: MockRoom;
  update?: jest.MockedFunction<(data: Partial<MockBooking>) => Promise<MockBooking>>;
  destroy?: jest.MockedFunction<() => Promise<number>>;
  toJSON?: () => Partial<MockBooking>;
}

interface MockUser {
  userId: number;
  name: string;
}

interface MockRoom {
  roomId: number;
  roomNumber: string;
}

// Create typed mock models
const mockBookingsModel = {
  findAll: jest.fn<() => Promise<MockBooking[]>>(),
  findByPk: jest.fn<() => Promise<MockBooking | null>>(),
  create: jest.fn<() => Promise<MockBooking>>(),
  update: jest.fn<() => Promise<[number]>>(),
  destroy: jest.fn<() => Promise<number>>()
};

const mockUsersModel = {
  findByPk: jest.fn<() => Promise<MockUser | null>>()
};

const mockRoomsModel = {
  findByPk: jest.fn<() => Promise<MockRoom | null>>()
};

// Mock validator with error typing
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => false,
  array: () => [],
  errors: [],
  formatter: (error: ValidationError) => error.msg,
  mapped: () => ({}),
  formatWith: () => ({}),
});

// Import controller factory with TypeScript types
import { createBookingsController } from '../bookings.controller.js';
const controller = createBookingsController({
  Bookings: mockBookingsModel as any,
  Users: mockUsersModel as any,
  Rooms: mockRoomsModel as any,
  validator: mockValidator as any
});

/**
 * Typed mock response object
 */
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn<() => Response>().mockReturnValue(res as Response);
  res.json = jest.fn<() => Response>().mockReturnValue(res as Response);
  res.send = jest.fn<() => Response>().mockReturnValue(res as Response);
  res.sendStatus = jest.fn<() => Response>().mockReturnValue(res as Response);
  return res as Response;
};

/**
 * Helper to create mock requests with typed parameters
 */
const mockRequest = (params: { id: string }) => ({
  params,
  query: {},
  body: {},
  headers: {},
  get: jest.fn()
} as unknown as Request);


describe('Bookings Controller - getAllBookings', () => {

  let bookingsController: ReturnType<typeof createBookingsController>;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel as any,
      Users: mockUsersModel as any,
      Rooms: mockRoomsModel as any,
      validator: mockValidator as any
    });
  });

  test('should return bookings with user and room details', async () => {
    const mockData: MockBooking[] = [{
      bookingId: 1,
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20',
      status: 'Confirmed',
      Users: { userId: 101, name: 'John Doe' },
      Rooms: { roomId: 201, roomNumber: '101' }
    }];

    mockBookingsModel.findAll.mockResolvedValue(mockData);
    const res = mockResponse();

    await bookingsController.getAllBookings({} as Request, res);

    expect(mockBookingsModel.findAll).toHaveBeenCalledWith({
      include: expect.any(Array)
    });
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

// Test cases for getBookingById
// Test cases will use the top-level mock helpers

describe('Bookings Controller - getBookingById', () => {

  let bookingsController: ReturnType<typeof createBookingsController>;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel as any,
      Users: mockUsersModel as any,
      Rooms: mockRoomsModel as any,
      validator: mockValidator as any
    });
  });

  test('should return 200 with booking data for valid ID', async () => {
    const mockBooking: MockBooking = {
      bookingId: 1,
      userId: 1,
      roomId: 101,
      checkInDate: '2024-01-01',
      checkOutDate: '2024-01-05',
      status: 'Confirmed'
    };

    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await bookingsController.getBookingById(req, res);

    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith('1', {
      include: expect.any(Array)
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBooking);
  });

  test('should return 404 for invalid booking ID', async () => {
    mockBookingsModel.findByPk.mockResolvedValue(null);
    const req = mockRequest({ id: '999' });
    const res = mockResponse();

    await bookingsController.getBookingById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
  });

  test('should return 500 on database error', async () => {
    const testError = new Error('Database failure');
    mockBookingsModel.findByPk.mockRejectedValue(testError);
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await bookingsController.getBookingById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching booking',
      error: 'Database failure'
    });
  });
});

describe('Bookings Controller - deleteBooking', () => {

  let bookingsController: ReturnType<typeof createBookingsController>;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel as any,
      Users: mockUsersModel as any,
      Rooms: mockRoomsModel as any,
      validator: mockValidator as any
    });
  });

  test('should delete booking and return success', async () => {
    mockBookingsModel.destroy.mockResolvedValue(1);
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await bookingsController.deleteBooking(req as Request, res);

    expect(mockBookingsModel.destroy).toHaveBeenCalledWith({
      where: { bookingId: 1 }
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking deleted successfully'
    });
  });

  test('should return 404 if booking not found', async () => {
    mockBookingsModel.destroy.mockResolvedValue(0);
    const req = mockRequest({ id: '999' });
    const res = mockResponse();

    await bookingsController.deleteBooking(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking not found'
    });
  });

  test('should handle errors and return 500 status', async () => {
    const errorMessage = 'Database error';
    mockBookingsModel.destroy.mockRejectedValue(new Error(errorMessage));
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await bookingsController.deleteBooking(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting booking',
      error: errorMessage
    });
  });
});

describe('Bookings Controller - createBooking', () => {

  let bookingsController: ReturnType<typeof createBookingsController>;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel as any,
      Users: mockUsersModel as any,
      Rooms: mockRoomsModel as any,
      validator: mockValidator as any
    });
  });

  test('should create a new booking and return it', async () => {
    const newBooking: MockBooking = {
      bookingId: 2,
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20',
      status: 'Confirmed'
    };

    // Mock validator to return isEmpty as true to pass validation
    mockValidator.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
      errors: [],
      formatter: (error: ValidationError) => error.msg,
      mapped: () => ({}),
      formatWith: () => ({}),
    });

    // The controller extracts individual fields from req.body
    const expectedCreateParams = {
      userId: newBooking.userId,
      roomId: newBooking.roomId,
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      status: newBooking.status
    };

    mockBookingsModel.create.mockResolvedValue(newBooking);
    const req = {
      body: newBooking
    } as unknown as Request;
    const res = mockResponse();

    await bookingsController.createBooking(req, res);

    expect(mockBookingsModel.create).toHaveBeenCalledWith(expectedCreateParams);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newBooking);
  });

  test('should return 400 if validation fails', async () => {
    mockValidator.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'Validation error' }],
      errors: [],
      formatter: (error: ValidationError) => error.msg,
      mapped: () => ({}),
      formatWith: () => ({}),
    });

    const req = {
      body: {}
    } as unknown as Request;
    const res = mockResponse();

    await bookingsController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ msg: 'Validation error' }]
    });
  });

  test('should return 500 on database error', async () => {
    const testError = new Error('Database failure');
    mockBookingsModel.create.mockRejectedValue(testError);
    
    // Mock validator to return isEmpty as true to pass validation
    mockValidator.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
      errors: [],
      formatter: (error: ValidationError) => error.msg,
      mapped: () => ({}),
      formatWith: () => ({}),
    });
    
    const req = {
      body: {
        userId: 101,
        roomId: 201,
        checkInDate: '2024-03-15',
        checkOutDate: '2024-03-20',
        status: 'Confirmed'
      }
    } as unknown as Request;
    const res = mockResponse();

    await bookingsController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error creating booking',
      error: 'Database failure'
    });
  });
});

