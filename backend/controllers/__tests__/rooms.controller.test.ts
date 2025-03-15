/**
 * Unit Tests for the Rooms Controller
 * 
 * This file contains comprehensive tests for the room-related functionality in our API.
 * We test these main controller functions:
 * 1. getAllRooms - Retrieving room lists with various filtering options
 * 2. checkRoomAvailability - Checking room availability for specific date ranges
 * 3. getRoomsByAmenities - Filtering rooms by specific amenities
 * 4. createRoom - Creating new rooms
 * 5. updateRoom - Updating existing rooms
 * 6. deleteRoom - Deleting rooms
 * 
 * The tests use dependency injection to provide mock implementations of the models,
 * making testing cleaner and more maintainable.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import type { ValidationError } from 'express-validator';
import type { RoomAttributes } from '../../models/Rooms.js';

// Define more specific types for our mock functions
type UpdateFn = (data: Partial<RoomAttributes>) => Promise<void>;
type DestroyFn = () => Promise<void>;

interface MockRoom extends Partial<RoomAttributes> {
  roomId: number;
  update?: jest.MockedFunction<UpdateFn>;
  destroy?: jest.MockedFunction<DestroyFn>;
  toJSON?: () => Partial<RoomAttributes>;
}

interface MockBooking {
  roomId: number;
  checkInDate?: string;
  checkOutDate?: string;
}

// Create mock models that we'll inject into the controller
const mockRoomsModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockBookingsModel = {
  findAll: jest.fn()
};

// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => true,
  array: () => []
});

// Import the controller factory
import { createRoomsController } from '../../controllers/rooms.controller.js';

/**
 * Helper function to create a mock response object
 * This simulates Express.js response object with common methods:
 * - status(): Sets HTTP status code
 * - json(): Sends JSON response
 * 
 * Both methods use Jest's mockReturnValue to make them chainable like the real Express methods
 */
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as any; // Makes res.status().json() possible
  res.json = jest.fn().mockReturnValue(res) as any;   // Returns the res object for chaining
  return res;
};

/**
 * Tests for the getAllRooms controller function
 * 
 * This test suite covers various scenarios for retrieving room lists,
 * including different filtering options and error handling.
 */
describe('Rooms Controller - getAllRooms', () => {
  // Reset all mock function's history before each test
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test the most basic case: getting all rooms without any filters
   * The controller should return all rooms from the database
   */
  test('should return all rooms when no filters are provided', async () => {
    // SETUP - Prepare test data and mock behavior
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked' }
    ];
    
    // Configure the mock to return our test data when findAll is called
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate an HTTP request with no query parameters
    const req = { query: {} } as Request;
    const res = mockResponse();
    
    // CALL - Execute the controller function we're testing
    await roomsController.getAllRooms(req, res as Response);
    
    // ASSERTION - Verify the function behaved as expected
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by roomType
   * The controller should only return rooms matching the specified type
   */
  test('should filter rooms by roomType', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { roomType: 'Double' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: { roomType: 'Double' }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by price range
   * The controller should return rooms within the specified price range
   */
  test('should filter rooms by price range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { minPrice: '100', maxPrice: '200' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        pricePerNight: {
          [Symbol.for('gte')]: 100,
          [Symbol.for('lte')]: 200
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test error handling in the room retrieval
   * The controller should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    const errorMessage = 'Database error';
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = { query: {} } as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res as Response);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching rooms',
      error: errorMessage
    });
  });
});

/**
 * Tests for the checkRoomAvailability controller function
 * 
 * This test suite covers scenarios for checking room availability
 * for specific date ranges, including filtering and validation.
 */
describe('Rooms Controller - checkRoomAvailability', () => {
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test checking room availability for a valid date range
   * The controller should return rooms that are available and not booked
   */
  test('should return available rooms for valid date range', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    const mockBookingsData = [
      { roomId: 1 } // Room 1 is booked for the requested period
    ];
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    // @ts-expect-error - Mock implementation may not match exact types
    mockBookingsModel.findAll.mockResolvedValue(mockBookingsData);
    
    const req = {
      query: {
        checkInDate: '2023-06-01',
        checkOutDate: '2023-06-05'
      }
    } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalled();
    expect(mockBookingsModel.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: [mockRoomsData[1]], // Only room 2 is available
      totalAvailable: 1
    });
  });

  /**
   * Test validation when date parameters are missing
   * The controller should return a 400 error when required dates are not provided
   */
  test('should return 400 if checkInDate or checkOutDate is missing', async () => {
    // SETUP
    const req = { query: {} } as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res as Response);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Both checkInDate and checkOutDate are required'
    });
  });
});

/**
 * Tests for the getRoomsByAmenities controller function
 * 
 * This test suite covers scenarios for filtering rooms by specific amenities,
 * supporting different storage formats and additional filters.
 */
describe('Rooms Controller - getRoomsByAmenities', () => {
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test filtering rooms by amenities when they're stored as arrays
   * The controller should return rooms that have all the requested amenities
   */
  test('should return rooms with specified amenities (array format)', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', amenities: ['wifi', 'tv'] },
      { roomId: 3, roomType: 'Suite', amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] }
    ];
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    const req = { query: { amenities: 'wifi,minibar' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    expect(res.json).toHaveBeenCalledWith({
      rooms: [mockRoomsData[0], mockRoomsData[2]],
      totalRooms: 2,
      requestedAmenities: ['wifi,minibar']
    });
  });
});

/**
 * Tests for the createRoom controller function
 * 
 * This test suite covers scenarios for creating new rooms,
 * including successful creation, validation errors, and server errors.
 */
describe('Rooms Controller - createRoom', () => {
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful room creation 
   * The controller should create a room and return 201 status
   */
  test('should create a new room and return 201 status', async () => {
    // SETUP
    const mockRoomData = {
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      maxGuests: 1,
      description: 'Comfortable single room',
      availabilityStatus: 'Available',
      amenities: ['wifi', 'tv', 'minibar']
    };

    const mockCreatedRoom = {
      roomId: 1,
      ...mockRoomData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.create.mockResolvedValue(mockCreatedRoom);
    
    const req = { body: mockRoomData } as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.createRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.create).toHaveBeenCalledWith(mockRoomData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreatedRoom);
  });

  /**
   * Test validation failure when creating a room
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    const mockValidationErrors = [
      { msg: 'Room number is required', param: 'roomNumber', location: 'body' },
      { msg: 'Price must be a positive number', param: 'pricePerNight', location: 'body' }
    ];
    
    mockValidator.mockReturnValue({
      isEmpty: () => false,
      array: () => mockValidationErrors
    });
    
    const req = { body: {} } as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.createRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });
});

/**
 * Tests for the updateRoom controller function
 * 
 * This test suite covers scenarios for updating rooms,
 * including successful updates, validation errors, not found cases, and error handling.
 */
describe('Rooms Controller - updateRoom', () => {
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful room update
   * The controller should update the room and return the updated data
   */
  test('should update a room and return updated data', async () => {
    // SETUP
    const updatedData = {
      roomType: 'Suite',
      pricePerNight: 150
    };

    const mockRoom: MockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      maxGuests: 2,
      availabilityStatus: 'Available',
      update: jest.fn<UpdateFn>().mockImplementation(async (data) => {
        Object.assign(mockRoom, data);
      })
    };

    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findByPk.mockResolvedValue(mockRoom);
    
    const req = {
      params: { id: '1' },
      body: updatedData
    } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith('1');
    expect(mockRoom.update).toBeDefined();
    if (mockRoom.update) {
      expect(mockRoom.update).toHaveBeenCalledWith(updatedData);
    }

    // Create the expected room object after update
    const expectedRoom = {
      ...mockRoom,
      ...updatedData
    };

    expect(res.json).toHaveBeenCalledWith({
      message: 'Room updated successfully',
      room: expectedRoom
    });
  });

  /**
   * Test when room to update is not found
   * The controller should return a 404 status with a 'not found' message
   */
  test('should return 404 when room to update is not found', async () => {
    // SETUP
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findByPk.mockResolvedValue(null);
    
    const req = {
      params: { id: '999' },
      body: {
        roomType: 'Deluxe',
        pricePerNight: 150
      }
    } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith('999');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
  });
});

/**
 * Tests for the deleteRoom controller function
 * 
 * This test suite covers scenarios for deleting rooms,
 * including successful deletion, not found cases, and error handling.
 */
describe('Rooms Controller - deleteRoom', () => {
  let roomsController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    roomsController = createRoomsController({
      Rooms: mockRoomsModel as any,
      Bookings: mockBookingsModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful room deletion
   * The controller should delete the room and return a success message
   */
  test('should delete room and return success message', async () => {
    // SETUP
    const mockRoom: MockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      destroy: jest.fn<DestroyFn>().mockResolvedValue()
    };
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findByPk.mockResolvedValue(mockRoom);
    
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith('1');
    expect(mockRoom.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Room deleted successfully'
    });
  });

  /**
   * Test when room to delete is not found
   * The controller should return a 404 status with a 'not found' message
   */
  test('should return 404 when room to delete is not found', async () => {
    // SETUP
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findByPk.mockResolvedValue(null);
    
    const req = { params: { id: '999' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res as Response);
    
    // ASSERTION
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith('999');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
  });

  /**
   * Test error handling when deleting a room
   * The controller should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    const errorMessage = 'Database error';
    // @ts-expect-error - Mock implementation may not match exact types
    mockRoomsModel.findByPk.mockRejectedValue(new Error(errorMessage));
    
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res as Response);
    
    // ASSERTION
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting room',
      error: errorMessage
    });
  });
});

export {};