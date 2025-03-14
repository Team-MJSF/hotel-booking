/**
 * Unit Tests for the Rooms Controller
 * 
 * This file contains comprehensive tests for the room-related functionality in our API.
 * We test three main controller functions:
 * 1. getAllRooms - Retrieving room lists with various filtering options
 * 2. checkRoomAvailability - Checking room availability for specific date ranges
 * 3. getRoomsByAmenities - Filtering rooms by specific amenities
 * 
 * The tests use dependency injection to provide mock implementations of the models,
 * making testing cleaner and more maintainable.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Create mock models that we'll inject into the controller
const mockRoomsModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
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
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Makes res.status().json() possible
  res.json = jest.fn().mockReturnValue(res);   // Returns the res object for chaining
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
  // This ensures that interactions from one test don't affect another
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test the most basic case: getting all rooms without any filters
   * The controller should return all rooms from the database
   */
  test('should return all rooms when no filters are provided', async () => {
    // SETUP - Prepare test data and mock behavior
    // Create sample room data for our test
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked' }
    ];
    
    // Configure the mock to return our test data when findAll is called
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate an HTTP request with no query parameters
    const req = { query: {} }; // Empty query object
    const res = mockResponse();
    
    // CALL - Execute the controller function we're testing
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION - Verify the function behaved as expected
    // Verify that findAll was called with an empty where clause
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    // Verify that the response contains all rooms without filtering
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by roomType
   * The controller should only return rooms matching the specified type
   */
  test('should filter rooms by roomType', async () => {
    // SETUP - Prepare test data and mock behavior
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request with roomType filter
    const req = { query: { roomType: 'Double' } };
    const res = mockResponse();
    
    // CALL - Execute the controller function
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION - Verify the function behaved as expected
    // Check that the database query included the roomType filter
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: { roomType: 'Double' }
    });
    // Verify that the filtered rooms were returned in the response
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
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request with price range filters
    const req = { query: { minPrice: '100', maxPrice: '200' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Check that the database query included both min and max price constraints
    // Using Sequelize operators [Op.gte] and [Op.lte] for greater-than-or-equal and less-than-or-equal
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        pricePerNight: {
          [Symbol.for('gte')]: 100, // Simulates Sequelize's Op.gte
          [Symbol.for('lte')]: 200  // Simulates Sequelize's Op.lte
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by maximum guest capacity
   * The controller should return rooms that can accommodate at least the specified number of guests
   */
  test('should filter rooms by maxGuests', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms that can accommodate at least 3 guests
    const req = { query: { maxGuests: '3' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Check that the database query filtered for rooms with at least 3 guests capacity
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        maxGuests: {
          [Symbol.for('gte')]: 3  // Rooms with capacity for 3 or more guests
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by availability status
   * The controller should only return rooms with the specified status
   */
  test('should filter rooms by availabilityStatus', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for only available rooms
    const req = { query: { availabilityStatus: 'Available' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Check that the query filtered by availability status
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: { availabilityStatus: 'Available' }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test combining multiple filters together
   * The controller should apply all provided filters to find matching rooms
   */
  test('should combine multiple filters', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request with multiple filters applied
    const req = {
      query: {
        roomType: 'Double',
        minPrice: '100',
        maxPrice: '200',
        maxGuests: '2',
        availabilityStatus: 'Available'
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Check that the query combined all the filters together
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        roomType: 'Double',
        pricePerNight: {
          [Symbol.for('gte')]: 100,
          [Symbol.for('lte')]: 200
        },
        maxGuests: {
          [Symbol.for('gte')]: 2
        },
        availabilityStatus: 'Available'
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockRoomsData);
  });

  /**
   * Test filtering rooms by amenities when they're stored as arrays
   * The controller should identify rooms that have all the requested amenities
   */
  test('should filter rooms by amenities when amenities are stored as an array', async () => {
    // SETUP
    // Create test data with amenities as arrays of strings
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available', amenities: ['wifi', 'tv'] },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked', amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with both wifi and minibar
    const req = { query: { amenities: 'wifi,minibar' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // First, check that we fetch all rooms from the database
    // (Amenities filtering happens in the controller, not the database query)
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Verify that only rooms with both wifi AND minibar are returned
    expect(res.json).toHaveBeenCalledWith([
      mockRoomsData[0], // Room 1 has both wifi and minibar
      mockRoomsData[2]  // Room 3 has both wifi and minibar
    ]);
    // Room 2 is excluded because it doesn't have minibar
  });

  /**
   * Test filtering rooms by amenities when they're stored as objects
   * The controller should handle a different data format where amenities are
   * stored as an object with boolean values (e.g., {wifi: true, minibar: false})
   */
  test('should filter rooms by amenities when amenities are stored as an object', async () => {
    // SETUP
    // Create test data with amenities as objects with boolean values
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available', amenities: { wifi: true, tv: true, minibar: true } },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available', amenities: { wifi: true, tv: true, minibar: false } },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked', amenities: { wifi: true, tv: true, minibar: true, jacuzzi: true } }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with both wifi and minibar
    const req = { query: { amenities: 'wifi,minibar' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Verify we return only rooms where both wifi and minibar are true
    expect(res.json).toHaveBeenCalledWith([
      mockRoomsData[0], // Room 1 has both wifi and minibar set to true
      mockRoomsData[2]  // Room 3 has both wifi and minibar set to true
    ]);
    // Room 2 is excluded because minibar is false
  });

  /**
   * Test how the controller handles rooms that don't have amenities defined
   * It should gracefully handle missing amenities and not include those rooms
   * when filtering by amenities
   */
  test('should handle rooms with no amenities when filtering by amenities', async () => {
    // SETUP
    // Create test data with some rooms missing amenities
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available', amenities: null },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Booked' } // No amenities property at all
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with wifi
    const req = { query: { amenities: 'wifi' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Only Room 1 should be returned as it's the only one with the wifi amenity
    // Rooms 2 and 3 should be excluded as they don't have defined amenities
    expect(res.json).toHaveBeenCalledWith([
      mockRoomsData[0] // Only Room 1 has amenities with wifi
    ]);
  });

  /**
   * Test combining amenities filter with other filters
   * The controller should apply database filters first, then filter by amenities
   */
  test('should combine amenities filter with other filters', async () => {
    // SETUP
    // Create test data with various rooms
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available', amenities: ['wifi', 'tv'] },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 3, roomType: 'Double', pricePerNight: 180, maxGuests: 2, availabilityStatus: 'Available', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 4, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available', amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] }
    ];
    
    // For this test, we'll simulate the database filtering by only returning
    // the Double rooms in the correct price range. This is what the real database would do.
    const filteredByDatabaseMockData = [
      mockRoomsData[1], // Room 2 is Double and in price range
      mockRoomsData[2]  // Room 3 is Double and in price range
    ];
    
    // Configure our mock to return only the database-filtered rooms
    mockRoomsModel.findAll.mockResolvedValue(filteredByDatabaseMockData);
    
    // Simulate a request with multiple filters including amenities
    const req = {
      query: {
        roomType: 'Double',
        minPrice: '100',
        maxPrice: '200',
        amenities: 'wifi,minibar'
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Check that database filters were applied first
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        roomType: 'Double',
        pricePerNight: {
          [Symbol.for('gte')]: 100,
          [Symbol.for('lte')]: 200
        }
      }
    });
    
    // Verify that the controller properly filtered by amenities
    // Both room 2 and 3 have wifi and minibar
    expect(res.json).toHaveBeenCalledWith([
      mockRoomsData[1], // Room 2 matches all criteria
      mockRoomsData[2]  // Room 3 matches all criteria
    ]);
  });

  /**
   * Test how the controller handles database errors
   * It should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockRoomsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = { query: {} };
    const res = mockResponse();
    
    // CALL
    await roomsController.getAllRooms(req, res);
    
    // ASSERTION
    // Verify that we set a 500 status code and return an error message
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
  // Reset mocks before each test
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test checking room availability for a valid date range
   * The controller should return rooms that are available and not booked
   */
  test('should return available rooms for valid date range', async () => {
    // SETUP
    // Create test data for rooms
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', pricePerNight: 100, maxGuests: 1, availabilityStatus: 'Available' },
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' },
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    // Create test data for bookings that overlap with our date range
    const mockBookingsData = [
      { roomId: 1 } // Room 1 is booked for the requested period
    ];
    
    // Configure the mocks
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    mockBookingsModel.findAll.mockResolvedValue(mockBookingsData);
    
    // Simulate a request for a specific date range
    const req = {
      query: {
        checkInDate: '2023-06-01',
        checkOutDate: '2023-06-05'
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that both database queries were made
    expect(mockRoomsModel.findAll).toHaveBeenCalled();
    expect(mockBookingsModel.findAll).toHaveBeenCalled();
    
    // Verify that the response contains only available rooms (rooms 2 and 3)
    // Room 1 is excluded because it's booked for the requested period
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 2 }),
        expect.objectContaining({ roomId: 3 })
      ]),
      totalAvailable: 2
    });
  });

  /**
   * Test validation when date parameters are missing
   * The controller should return a 400 error when required dates are not provided
   */
  test('should return 400 if checkInDate or checkOutDate is missing', async () => {
    // SETUP
    // Simulate a request with missing date parameters
    const req = { query: {} };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with an appropriate error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Both checkInDate and checkOutDate are required'
    });
  });

  /**
   * Test validation when date range is invalid
   * The controller should return a 400 error when checkout date is before checkin date
   */
  test('should return 400 if checkOutDate is not after checkInDate', async () => {
    // SETUP
    // Simulate a request with an invalid date range
    const req = { 
      query: { 
        checkInDate: '2023-07-05', 
        checkOutDate: '2023-07-01' // checkOutDate before checkInDate (invalid)
      } 
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with an appropriate error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'checkOutDate must be after checkInDate'
    });
  });

  /**
   * Test filtering available rooms by room type
   * The controller should only return available rooms of the specified type
   */
  test('should filter by roomType and date range', async () => {
    // SETUP
    // Only include double rooms in our mock data
    const mockRoomsData = [
      { roomId: 2, roomType: 'Double', pricePerNight: 150, maxGuests: 2, availabilityStatus: 'Available' }
    ];
    
    // No bookings for these rooms
    const mockBookingsData = [];
    
    // Configure the mocks
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    mockBookingsModel.findAll.mockResolvedValue(mockBookingsData);
    
    // Simulate a request with room type and date range
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05',
        roomType: 'Double'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that the database query included the room type filter
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        roomType: 'Double',
        availabilityStatus: {
          [Symbol.for('ne')]: 'Maintenance' // Exclude rooms under maintenance
        }
      }
    });
    
    // Verify that only room 2 is included in the response
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 2 })
      ]),
      totalAvailable: 1
    });
  });

  /**
   * Test filtering available rooms by maximum guest capacity
   * The controller should only return rooms that can accommodate the requested number of guests
   */
  test('should filter by maxGuests and date range', async () => {
    // SETUP
    // Only include rooms with high guest capacity
    const mockRoomsData = [
      { roomId: 3, roomType: 'Suite', pricePerNight: 250, maxGuests: 4, availabilityStatus: 'Available' }
    ];
    
    // No bookings for these rooms
    const mockBookingsData = [];
    
    // Configure the mocks
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    mockBookingsModel.findAll.mockResolvedValue(mockBookingsData);
    
    // Simulate a request for rooms that accommodate at least 3 guests
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05',
        maxGuests: '3'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that the database query included the maxGuests filter
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: {
        maxGuests: {
          [Symbol.for('gte')]: 3 // Rooms with capacity for 3 or more guests
        },
        availabilityStatus: {
          [Symbol.for('ne')]: 'Maintenance'
        }
      }
    });
    
    // Verify that only room 3 is included in the response
    expect(res.json).toHaveBeenCalledWith({
      availableRooms: expect.arrayContaining([
        expect.objectContaining({ roomId: 3 })
      ]),
      totalAvailable: 1
    });
  });

  /**
   * Test error handling in the availability check
   * The controller should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockRoomsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a valid request that will trigger the error
    const req = { 
      query: { 
        checkInDate: '2023-07-01', 
        checkOutDate: '2023-07-05'
      } 
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.checkRoomAvailability(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error checking room availability',
      error: errorMessage
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
  // Reset mocks before each test
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test filtering rooms by amenities when they're stored as arrays
   * The controller should return rooms that have all the requested amenities
   */
  test('should return rooms with specified amenities (array format)', async () => {
    // SETUP
    // Create test data with amenities as arrays
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', amenities: ['wifi', 'tv'] },
      { roomId: 3, roomType: 'Suite', amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with wifi and minibar
    const req = { query: { amenities: 'wifi,minibar' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    // Verify database query was made without filters (filtering is done in the controller)
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Verify we return only rooms with both wifi and minibar, along with metadata
    expect(res.json).toHaveBeenCalledWith({
      rooms: [
        mockRoomsData[0], // Room 1 has both wifi and minibar
        mockRoomsData[2]  // Room 3 has both wifi and minibar
      ],
      totalRooms: 2,
      requestedAmenities: ['wifi,minibar']
    });
  });

  /**
   * Test filtering rooms by amenities when they're stored as objects
   * The controller should handle object format amenities correctly
   */
  test('should return rooms with specified amenities (object format)', async () => {
    // SETUP
    // Create test data with amenities as objects
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', amenities: { wifi: true, tv: true, minibar: true } },
      { roomId: 2, roomType: 'Double', amenities: { wifi: true, tv: true, minibar: false } },
      { roomId: 3, roomType: 'Suite', amenities: { wifi: true, tv: true, minibar: true, jacuzzi: true } }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with wifi and minibar
    const req = { query: { amenities: 'wifi,minibar' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Verify we return only rooms where both wifi and minibar are true
    expect(res.json).toHaveBeenCalledWith({
      rooms: [
        mockRoomsData[0], // Room 1 has both wifi and minibar set to true
        mockRoomsData[2]  // Room 3 has both wifi and minibar set to true
      ],
      totalRooms: 2,
      requestedAmenities: ['wifi,minibar']
    });
  });

  /**
   * Test combining room type filter with amenities filter
   * The controller should apply both filters to find matching rooms
   */
  test('should filter by both roomType and amenities', async () => {
    // SETUP
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 3, roomType: 'Suite', amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] }
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request with both roomType and amenities filters
    const req = { query: { amenities: 'wifi,minibar', roomType: 'Double' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    // Verify that we query the database with the roomType filter
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({
      where: { roomType: 'Double' }
    });
    
    // Verify that we filter to only include Double rooms with both amenities
    expect(res.json).toHaveBeenCalledWith({
      rooms: [
        mockRoomsData[1] // Only Room 2 is Double with both wifi and minibar
      ],
      totalRooms: 1,
      requestedAmenities: ['wifi,minibar']
    });
  });

  /**
   * Test handling rooms with no amenities
   * The controller should gracefully handle rooms that don't have amenities defined
   */
  test('should handle rooms with no amenities', async () => {
    // SETUP
    // Create test data with some rooms missing amenities
    const mockRoomsData = [
      { roomId: 1, roomType: 'Single', amenities: ['wifi', 'tv', 'minibar'] },
      { roomId: 2, roomType: 'Double', amenities: null },
      { roomId: 3, roomType: 'Suite' } // No amenities property
    ];
    
    mockRoomsModel.findAll.mockResolvedValue(mockRoomsData);
    
    // Simulate a request for rooms with wifi
    const req = { query: { amenities: 'wifi' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    expect(mockRoomsModel.findAll).toHaveBeenCalledWith({ where: {} });
    
    // Verify that only Room 1 is included (the only one with wifi)
    expect(res.json).toHaveBeenCalledWith({
      rooms: [
        mockRoomsData[0] // Only Room 1 has wifi
      ],
      totalRooms: 1,
      requestedAmenities: ['wifi']
    });
  });

  /**
   * Test validation of required parameters
   * The controller should return a 400 error when amenities parameter is missing
   */
  test('should return 400 if amenities parameter is missing', async () => {
    // SETUP
    // Simulate a request without the required amenities parameter
    const req = { query: {} };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    // Verify we return a 400 status with an appropriate error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Amenities parameter is required'
    });
  });

  /**
   * Test error handling in the amenities filter
   * The controller should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockRoomsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a valid request that will trigger the error
    const req = { query: { amenities: 'wifi' } };
    const res = mockResponse();
    
    // CALL
    await roomsController.getRoomsByAmenities(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching rooms by amenities',
      error: errorMessage
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
  // Reset mocks before each test
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset our mock validator for each test
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful room creation 
   * The controller should create a room and return 201 status
   */
  test('should create a new room and return 201 status', async () => {
    // SETUP
    // Define mock request data
    const mockRoomData = {
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      maxGuests: 1,
      description: 'Comfortable single room',
      availabilityStatus: 'Available',
      amenities: ['wifi', 'tv', 'minibar']
    };

    // Mock the created room (what the database would return)
    const mockCreatedRoom = {
      roomId: 1,
      ...mockRoomData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Configure mocks
    mockRoomsModel.create.mockResolvedValue(mockCreatedRoom);
    
    // Create mock request with room data in body
    const req = { 
      body: mockRoomData
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.createRoom(req, res);
    
    // ASSERTION
    // Verify the Room.create was called with the correct data
    expect(mockRoomsModel.create).toHaveBeenCalledWith(mockRoomData);
    
    // Verify that we return a 201 status and the created room
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreatedRoom);
  });

  /**
   * Test validation failure when creating a room
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'Room number is required', param: 'roomNumber', location: 'body' },
      { msg: 'Price must be a positive number', param: 'pricePerNight', location: 'body' }
    ];
    
    // Configure validation mock to indicate failure
    mockValidator.mockReturnValue({
      isEmpty: () => false,
      array: () => mockValidationErrors
    });
    
    // Create mock request (content doesn't matter as validation will fail)
    const req = { body: {} };
    const res = mockResponse();
    
    // CALL
    await roomsController.createRoom(req, res);
    
    // ASSERTION
    // Verify that Rooms.create was NOT called
    expect(mockRoomsModel.create).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with the validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test database error handling when creating a room
   * The controller should return 500 status with error information
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Define mock request data
    const mockRoomData = {
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      maxGuests: 1
    };
    
    // Simulate a database error
    const errorMessage = 'Database connection failed';
    mockRoomsModel.create.mockRejectedValue(new Error(errorMessage));
    
    // Create mock request
    const req = { body: mockRoomData };
    const res = mockResponse();
    
    // CALL
    await roomsController.createRoom(req, res);
    
    // ASSERTION
    // Verify that Rooms.create was called but resulted in error
    expect(mockRoomsModel.create).toHaveBeenCalled();
    
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error creating room',
      error: errorMessage
    });
  });
});

/**
 * Tests for the updateRoom controller function
 * 
 * This test suite covers scenarios for updating a room,
 * including successful updates, validation errors, not found cases, 
 * and error handling.
 */
describe('Rooms Controller - updateRoom', () => {
  // Reset mocks before each test
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful room update
   * The controller should update the room and return the updated data
   */
  test('should update a room and return updated data', async () => {
    // SETUP
    // Mock room data with update method
    const updatedRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Deluxe',
      pricePerNight: 150
    };
    
    const mockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      update: jest.fn().mockResolvedValue(updatedRoom)
    };
    
    // Configure findByPk to return our mock room
    mockRoomsModel.findByPk = jest.fn().mockResolvedValue(mockRoom);
    
    // Set validator to return true (valid input)
    mockValidator.mockReturnValue(true);
    
    // Simulate a request with roomId parameter and updated data
    const req = { 
      params: { id: 1 },
      body: {
        roomType: 'Deluxe',
        pricePerNight: 150
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that update was called with the request body
    expect(mockRoom.update).toHaveBeenCalledWith(req.body);
    
    // Verify that we return a success message with the updated room
    expect(res.json).toHaveBeenCalledWith({
      message: 'Room updated successfully',
      room: mockRoom
    });
  });

  /**
   * Test input validation failure
   * The controller should return a 400 status when input validation fails
   */
  test('should return 400 if input validation fails', async () => {
    // SETUP
    // Set validator to return false (invalid input)
    mockValidator.mockReturnValue(false);
    
    // Simulate a request with invalid data
    const req = { 
      params: { id: 1 },
      body: {
        roomType: '',  // Invalid: empty string
        pricePerNight: -100  // Invalid: negative price
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid room data provided'
    });
    
    // Verify that findByPk was not called (validation failed)
    expect(mockRoomsModel.findByPk).not.toHaveBeenCalled();
  });

  /**
   * Test updating a non-existent room
   * The controller should return a 404 status when room is not found
   */
  test('should return 404 if room is not found', async () => {
    // SETUP
    // Configure findByPk to return null (room not found)
    mockRoomsModel.findByPk = jest.fn().mockResolvedValue(null);
    
    // Set validator to return true (valid input)
    mockValidator.mockReturnValue(true);
    
    // Simulate a request with non-existent roomId
    const req = { 
      params: { id: 999 },
      body: {
        roomType: 'Deluxe',
        pricePerNight: 150
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Room not found'
    });
  });

  /**
   * Test database error handling when updating a room
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error during update';
    mockRoomsModel.findByPk = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    // Set validator to return true (valid input)
    mockValidator.mockReturnValue(true);
    
    // Simulate a request with roomId parameter
    const req = { 
      params: { id: 1 },
      body: {
        roomType: 'Deluxe',
        pricePerNight: 150
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating room',
      error: errorMessage
    });
  });

  /**
   * Test error handling when update operation fails
   * The controller should return a 500 status with error information
   */
  test('should handle errors during update operation', async () => {
    // SETUP
    // Configure a mock room with an update method that fails
    const errorMessage = 'Failed to update in database';
    const mockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      update: jest.fn().mockRejectedValue(new Error(errorMessage))
    };
    
    // Configure findByPk to return our mock room
    mockRoomsModel.findByPk = jest.fn().mockResolvedValue(mockRoom);
    
    // Set validator to return true (valid input)
    mockValidator.mockReturnValue(true);
    
    // Simulate a request with roomId parameter
    const req = { 
      params: { id: 1 },
      body: {
        roomType: 'Deluxe',
        pricePerNight: 150
      }
    };
    const res = mockResponse();
    
    // CALL
    await roomsController.updateRoom(req, res);
    
    // ASSERTION
    // Verify that update was called but resulted in error
    expect(mockRoom.update).toHaveBeenCalledWith(req.body);
    
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating room',
      error: errorMessage
    });
  });
});

/**
 * Tests for the deleteRoom controller function
 * 
 * This test suite covers scenarios for deleting rooms,
 * including successful deletion, not found cases, and error handling.
 */
describe('Rooms Controller - deleteRoom', () => {
  // Reset mocks before each test
  let roomsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create the mock destroy method for room instances
    const mockDestroy = jest.fn().mockResolvedValue();
    
    // Configure the findByPk mock to return a room with a destroy method
    mockRoomsModel.findByPk = jest.fn().mockResolvedValue({
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      pricePerNight: 100,
      destroy: mockDestroy
    });
    
    // Create a fresh controller instance for each test with our mocks
    roomsController = createRoomsController({
      Rooms: mockRoomsModel,
      Bookings: mockBookingsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful room deletion
   * The controller should delete the room and return a success message
   */
  test('should delete a room and return success message', async () => {
    // SETUP
    // Configure a mock room with a destroy method
    const mockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      destroy: jest.fn().mockResolvedValue()
    };
    
    // Configure findByPk to return our mock room
    mockRoomsModel.findByPk.mockResolvedValue(mockRoom);
    
    // Simulate a request with roomId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that destroy was called on the room
    expect(mockRoom.destroy).toHaveBeenCalled();
    
    // Verify that we return a success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'Room deleted successfully'
    });
  });

  /**
   * Test deleting a non-existent room
   * The controller should return a 404 status when room is not found
   */
  test('should return 404 if room is not found', async () => {
    // SETUP
    // Configure findByPk to return null (room not found)
    mockRoomsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent roomId
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockRoomsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Room not found'
    });
  });

  /**
   * Test database error handling when deleting a room
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error during deletion';
    mockRoomsModel.findByPk.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a request with roomId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting room',
      error: errorMessage
    });
  });

  /**
   * Test error handling when destroy operation fails
   * The controller should return a 500 status with error information
   */
  test('should handle errors during destroy operation', async () => {
    // SETUP
    // Configure a mock room with a destroy method that fails
    const errorMessage = 'Failed to delete from database';
    const mockRoom = {
      roomId: 1,
      roomNumber: '101',
      roomType: 'Single',
      destroy: jest.fn().mockRejectedValue(new Error(errorMessage))
    };
    
    // Configure findByPk to return our mock room
    mockRoomsModel.findByPk.mockResolvedValue(mockRoom);
    
    // Simulate a request with roomId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await roomsController.deleteRoom(req, res);
    
    // ASSERTION
    // Verify that destroy was called but resulted in error
    expect(mockRoom.destroy).toHaveBeenCalled();
    
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting room',
      error: errorMessage
    });
  });
});
