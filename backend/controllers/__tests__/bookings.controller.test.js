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

// Create mock models that we'll inject into the controller
const mockBookingsModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
};

const mockUsersModel = {
  // Add any user model methods needed for testing
};

const mockRoomsModel = {
  // Add any room model methods needed for testing
};

// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => true,
  array: () => []
});

// Import the controller factory
import { createBookingsController } from '../../controllers/bookings.controller.js';

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
 * Tests for the getAllBookings controller function
 * 
 * This test suite covers various scenarios for retrieving booking lists,
 * including successful retrieval and error handling.
 */
describe('Bookings Controller - getAllBookings', () => {
  // Reset all mock function's history before each test
  let bookingsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel,
      Users: mockUsersModel,
      Rooms: mockRoomsModel,
      validator: mockValidator
    });
  });

  /**
   * Test the most basic case: getting all bookings
   * The controller should return all bookings with their associated user and room details
   */
  test('should return all bookings with user and room details', async () => {
    // SETUP
    // Create sample booking data for our test
    const mockBookingsData = [
      { 
        bookingId: 1, 
        userId: 101,
        roomId: 201,
        checkInDate: '2024-03-15',
        checkOutDate: '2024-03-20',
        status: 'Confirmed',
        Users: { userId: 101, name: 'John Doe' },
        Rooms: { roomId: 201, roomNumber: '101' }
      },
      { 
        bookingId: 2, 
        userId: 102,
        roomId: 202,
        checkInDate: '2024-04-10',
        checkOutDate: '2024-04-15',
        status: 'Pending',
        Users: { userId: 102, name: 'Jane Smith' },
        Rooms: { roomId: 202, roomNumber: '102' }
      }
    ];
    
    // Configure the mock to return our test data when findAll is called
    mockBookingsModel.findAll.mockResolvedValue(mockBookingsData);
    
    // Simulate an HTTP request
    const req = {};
    const res = mockResponse();
    
    // CALL
    await bookingsController.getAllBookings(req, res);
    
    // ASSERTION
    // Verify that findAll was called with the correct include option
    expect(mockBookingsModel.findAll).toHaveBeenCalledWith({
      include: [
        { model: mockUsersModel, as: 'Users' },
        { model: mockRoomsModel, as: 'Rooms' }
      ]
    });
    // Verify that the response contains all bookings
    expect(res.json).toHaveBeenCalledWith(mockBookingsData);
  });

  /**
   * Test how the controller handles database errors
   * It should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockBookingsModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = {};
    const res = mockResponse();
    
    // CALL
    await bookingsController.getAllBookings(req, res);
    
    // ASSERTION
    // Verify that we set a 500 status code and return an error message
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
  // Reset mocks before each test
  let bookingsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel,
      Users: mockUsersModel,
      Rooms: mockRoomsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful booking retrieval
   * The controller should return the booking with user and room details
   */
  test('should return booking with user and room details', async () => {
    // SETUP
    // Mock booking data
    const mockBooking = {
      bookingId: 1, 
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20',
      status: 'Confirmed',
      Users: { userId: 101, name: 'John Doe' },
      Rooms: { roomId: 201, roomNumber: '101' }
    };
    
    // Configure findByPk to return our mock booking
    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    
    // Simulate a request with booking ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.getBookingById(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID and include option
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(1, {
      include: [
        { model: mockUsersModel, as: 'Users' },
        { model: mockRoomsModel, as: 'Rooms' }
      ]
    });
    
    // Verify that we return the booking data
    expect(res.json).toHaveBeenCalledWith(mockBooking);
  });

  /**
   * Test retrieving a non-existent booking
   * The controller should return a 404 status when booking is not found
   */
  test('should return 404 if booking is not found', async () => {
    // SETUP
    // Configure findByPk to return null (booking not found)
    mockBookingsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent booking ID
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.getBookingById(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(999, {
      include: [
        { model: mockUsersModel, as: 'Users' },
        { model: mockRoomsModel, as: 'Rooms' }
      ]
    });
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking not found'
    });
  });

  /**
   * Test database error handling when retrieving a booking
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error during retrieval';
    mockBookingsModel.findByPk.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a request with booking ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.getBookingById(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
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
  // Reset mocks before each test
  let bookingsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset our mock validator for each test
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create a fresh controller instance for each test with our mocks
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel,
      Users: mockUsersModel,
      Rooms: mockRoomsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful booking creation 
   * The controller should create a booking and return 201 status
   */
  test('should create a new booking and return 201 status', async () => {
    // SETUP
    // Define mock request data
    const mockBookingData = {
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20',
      status: 'Pending'
    };

    // Mock the created booking (what the database would return)
    const mockCreatedBooking = {
      bookingId: 1,
      ...mockBookingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Configure mocks
    mockBookingsModel.create.mockResolvedValue(mockCreatedBooking);
    
    // Create mock request with booking data in body
    const req = { 
      body: mockBookingData
    };
    const res = mockResponse();
    
    // CALL
    await bookingsController.createBooking(req, res);
    
    // ASSERTION
    // Verify the Bookings.create was called with the correct data
    expect(mockBookingsModel.create).toHaveBeenCalledWith(mockBookingData);
    
    // Verify that we return a 201 status and the created booking
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreatedBooking);
  });

  /**
   * Test validation failure when creating a booking
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'User ID is required', param: 'userId', location: 'body' },
      { msg: 'Room ID is required', param: 'roomId', location: 'body' }
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
    await bookingsController.createBooking(req, res);
    
    // ASSERTION
    // Verify that Bookings.create was NOT called
    expect(mockBookingsModel.create).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with the validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test database error handling when creating a booking
   * The controller should return 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Define mock request data
    const mockBookingData = {
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20'
    };
    
    // Simulate a database error
    const errorMessage = 'Database connection failed';
    mockBookingsModel.create.mockRejectedValue(new Error(errorMessage));
    
    // Create mock request
    const req = { body: mockBookingData };
    const res = mockResponse();
    
    // CALL
    await bookingsController.createBooking(req, res);
    
    // ASSERTION
    // Verify that Bookings.create was called but resulted in error
    expect(mockBookingsModel.create).toHaveBeenCalled();
    
    // Verify that we return a 500 status with an error message
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
  // Reset mocks before each test
  let bookingsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset our mock validator for each test
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create a fresh controller instance for each test with our mocks
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel,
      Users: mockUsersModel,
      Rooms: mockRoomsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful booking update
   * The controller should update the booking and return the updated data
   */
  test('should update booking and return updated data', async () => {
    // SETUP
    // Mock booking data with update method
    const mockBooking = {
      bookingId: 1,
      userId: 101,
      roomId: 201,
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-20',
      status: 'Pending',
      update: jest.fn().mockImplementation(function(data) {
        Object.assign(this, data);
        return this;
      })
    };
    
    const updateData = {
      checkInDate: '2024-04-01',
      checkOutDate: '2024-04-05',
      status: 'Confirmed'
    };
    
    // Configure mocks
    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    
    // Simulate a request with booking ID and update data
    const req = { 
      params: { id: 1 },
      body: updateData
    };
    const res = mockResponse();
    
    // CALL
    await bookingsController.updateBooking(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that update was called with the correct data
    expect(mockBooking.update).toHaveBeenCalledWith({
      userId: 101, // Original value preserved
      roomId: 201, // Original value preserved
      checkInDate: '2024-04-01', // Updated value
      checkOutDate: '2024-04-05', // Updated value
      status: 'Confirmed' // Updated value
    });
    
    // Verify that we return the updated booking
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      bookingId: 1,
      userId: 101,
      roomId: 201,
      checkInDate: '2024-04-01',
      checkOutDate: '2024-04-05',
      status: 'Confirmed'
    }));
  });

  /**
   * Test validation failure when updating a booking
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'Check-out date must be after check-in date', param: 'checkOutDate', location: 'body' }
    ];
    
    // Configure validation mock to indicate failure
    mockValidator.mockReturnValue({
      isEmpty: () => false,
      array: () => mockValidationErrors
    });
    
    // Simulate a request with invalid data
    const req = { 
      params: { id: 1 },
      body: {
        checkInDate: '2024-04-10',
        checkOutDate: '2024-04-01', // Invalid: before check-in date
      }
    };
    const res = mockResponse();
    
    // CALL
    await bookingsController.updateBooking(req, res);
    
    // ASSERTION
    // Verify that findByPk was NOT called (validation failed)
    expect(mockBookingsModel.findByPk).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test updating a non-existent booking
   * The controller should return a 404 status when booking is not found
   */
  test('should return 404 if booking is not found', async () => {
    // SETUP
    // Configure findByPk to return null (booking not found)
    mockBookingsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent booking ID
    const req = { 
      params: { id: 999 },
      body: {
        status: 'Confirmed'
      }
    };
    const res = mockResponse();
    
    // CALL
    await bookingsController.updateBooking(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking not found'
    });
  });

  /**
   * Test database error handling when updating a booking
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Mock booking data with update method that fails
    const mockBooking = {
      bookingId: 1,
      update: jest.fn().mockRejectedValue(new Error('Database error during update'))
    };
    
    // Configure mocks
    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    
    // Simulate a request with booking ID and update data
    const req = { 
      params: { id: 1 },
      body: {
        status: 'Cancelled'
      }
    };
    const res = mockResponse();
    
    // CALL
    await bookingsController.updateBooking(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
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
  // Reset mocks before each test
  let bookingsController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    bookingsController = createBookingsController({
      Bookings: mockBookingsModel,
      Users: mockUsersModel,
      Rooms: mockRoomsModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful booking deletion
   * The controller should delete the booking and return a success message
   */
  test('should delete booking and return success message', async () => {
    // SETUP
    // Mock booking data with destroy method
    const mockBooking = {
      bookingId: 1,
      userId: 101,
      roomId: 201,
      status: 'Confirmed',
      destroy: jest.fn().mockResolvedValue(undefined)
    };
    
    // Configure findByPk to return our mock booking
    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    
    // Simulate a request with booking ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.deleteBooking(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that destroy was called
    expect(mockBooking.destroy).toHaveBeenCalled();
    
    // Verify that we return a success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking deleted successfully'
    });
  });

  /**
   * Test deleting a non-existent booking
   * The controller should return a 404 status when booking is not found
   */
  test('should return 404 if booking is not found', async () => {
    // SETUP
    // Configure findByPk to return null (booking not found)
    mockBookingsModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent booking ID
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.deleteBooking(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockBookingsModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Booking not found'
    });
  });

  /**
   * Test database error handling when deleting a booking
   * The controller should return a 500 status with error information
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Mock booking data with destroy method that fails
    const mockBooking = {
      bookingId: 1,
      destroy: jest.fn().mockRejectedValue(new Error('Database error during deletion'))
    };
    
    // Configure findByPk to return our mock booking
    mockBookingsModel.findByPk.mockResolvedValue(mockBooking);
    
    // Simulate a request with booking ID
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await bookingsController.deleteBooking(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting booking',
      error: 'Database error during deletion'
    });
  });
});