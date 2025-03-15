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
  throw: () => {}
});

// Import controller factory with TypeScript types
import { createBookingsController } from '../bookings.controller.js';

/**
 * Typed mock response object
 */
const mockResponse = (): Response => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  // Add Express Response type properties as needed
} as unknown as Response);

describe('Bookings Controller', () => {
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

  describe('getAllBookings', () => {
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

  // Additional test cases for other endpoints...
});