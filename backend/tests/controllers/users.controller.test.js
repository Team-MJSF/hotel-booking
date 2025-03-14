/**
 * Unit Tests for the Users Controller
 * 
 * This file contains comprehensive tests for the user-related functionality in our API.
 * We test five main controller functions:
 * 1. getAllUsers - Retrieving user lists
 * 2. getUserById - Retrieving a specific user by ID
 * 3. createUser - Creating new users
 * 4. updateUser - Updating existing users
 * 5. deleteUser - Deleting users
 * 
 * The tests use dependency injection to provide mock implementations of the models,
 * making testing cleaner and more maintainable.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Create mock model that we'll inject into the controller
const mockUsersModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Create a mock validator function
const mockValidator = jest.fn().mockReturnValue({
  isEmpty: () => true,
  array: () => []
});

// Import the controller factory
import { createUsersController } from '../../controllers/users.controller.js';

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
 * Tests for the getAllUsers controller function
 * 
 * This test suite covers various scenarios for retrieving user lists,
 * including successful retrieval and error handling.
 */
describe('Users Controller - getAllUsers', () => {
  // Reset all mock function's history before each test
  // This ensures that interactions from one test don't affect another
  let usersController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    usersController = createUsersController({
      Users: mockUsersModel,
      validator: mockValidator
    });
  });

  /**
   * Test the most basic case: getting all users
   * The controller should return all users from the database
   */
  test('should return all users with passwords excluded', async () => {
    // SETUP - Prepare test data and mock behavior
    // Create sample user data for our test
    const mockUsersData = [
      { userId: 1, fullName: 'John Doe', email: 'john@example.com', role: 'Guest' },
      { userId: 2, fullName: 'Jane Smith', email: 'jane@example.com', role: 'Admin' }
    ];
    
    // Configure the mock to return our test data when findAll is called
    mockUsersModel.findAll.mockResolvedValue(mockUsersData);
    
    // Simulate an HTTP request
    const req = {};
    const res = mockResponse();
    
    // CALL - Execute the controller function we're testing
    await usersController.getAllUsers(req, res);
    
    // ASSERTION - Verify the function behaved as expected
    // Verify that findAll was called with the correct attributes exclusion
    expect(mockUsersModel.findAll).toHaveBeenCalledWith({ 
      attributes: { exclude: ['password'] } 
    });
    // Verify that the response contains all users
    expect(res.json).toHaveBeenCalledWith(mockUsersData);
  });

  /**
   * Test how the controller handles database errors
   * It should return a 500 status with an error message
   */
  test('should handle errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error';
    mockUsersModel.findAll.mockRejectedValue(new Error(errorMessage));
    
    const req = {};
    const res = mockResponse();
    
    // CALL
    await usersController.getAllUsers(req, res);
    
    // ASSERTION
    // Verify that we set a 500 status code and return an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching users',
      error: errorMessage
    });
  });
});

/**
 * Tests for the createUser controller function
 * 
 * This test suite covers scenarios for creating new users,
 * including successful creation, validation errors, duplicate email, and server errors.
 */
describe('Users Controller - createUser', () => {
  // Reset mocks before each test
  let usersController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset our mock validator for each test
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create a fresh controller instance for each test with our mocks
    usersController = createUsersController({
      Users: mockUsersModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful user creation 
   * The controller should create a user and return 201 status
   */
  test('should create a new user and return 201 status with password excluded', async () => {
    // SETUP
    // Define mock request data
    const mockUserData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '123-456-7890',
      role: 'Guest'
    };

    // Mock the created user (what the database would return)
    const mockCreatedUser = {
      userId: 1,
      ...mockUserData,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: () => ({
        userId: 1,
        ...mockUserData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    };

    // Configure mocks
    mockUsersModel.create.mockResolvedValue(mockCreatedUser);
    
    // Create mock request with user data in body
    const req = { 
      body: mockUserData
    };
    const res = mockResponse();
    
    // CALL
    await usersController.createUser(req, res);
    
    // ASSERTION
    // Verify the User.create was called with the correct data
    expect(mockUsersModel.create).toHaveBeenCalledWith(mockUserData);
    
    // Verify that we return a 201 status and the created user without password
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '123-456-7890',
      role: 'Guest'
    }));
    
    // Verify that password is not included in the response
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: expect.anything() })
    );
  });

  /**
   * Test validation failure when creating a user
   * The controller should return 400 status with validation errors
   */
  test('should return 400 status when validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'Full name is required', param: 'fullName', location: 'body' },
      { msg: 'Must be a valid email address', param: 'email', location: 'body' }
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
    await usersController.createUser(req, res);
    
    // ASSERTION
    // Verify that Users.create was NOT called
    expect(mockUsersModel.create).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with the validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test unique constraint violation (duplicate email)
   * The controller should return 400 status with specific message
   */
  test('should return 400 status when email already exists', async () => {
    // SETUP
    // Define mock request data
    const mockUserData = {
      fullName: 'John Doe',
      email: 'existing@example.com',
      password: 'password123',
      phoneNumber: '123-456-7890'
    };
    
    // Simulate a unique constraint error
    const uniqueError = new Error('Duplicate email');
    uniqueError.name = 'SequelizeUniqueConstraintError';
    mockUsersModel.create.mockRejectedValue(uniqueError);
    
    // Create mock request
    const req = { body: mockUserData };
    const res = mockResponse();
    
    // CALL
    await usersController.createUser(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with the unique constraint error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email already exists'
    });
  });

  /**
   * Test database error handling when creating a user
   * The controller should return 500 status with error information
   */
  test('should handle other errors and return 500 status', async () => {
    // SETUP
    // Define mock request data
    const mockUserData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '123-456-7890'
    };
    
    // Simulate a database error
    const errorMessage = 'Database connection failed';
    mockUsersModel.create.mockRejectedValue(new Error(errorMessage));
    
    // Create mock request
    const req = { body: mockUserData };
    const res = mockResponse();
    
    // CALL
    await usersController.createUser(req, res);
    
    // ASSERTION
    // Verify that Users.create was called but resulted in error
    expect(mockUsersModel.create).toHaveBeenCalled();
    
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error creating user',
      error: errorMessage
    });
  });
});

/**
 * Tests for the updateUser controller function
 * 
 * This test suite covers scenarios for updating users,
 * including successful updates, validation errors, not found cases, 
 * duplicate email, and error handling.
 */
describe('Users Controller - updateUser', () => {
  // Reset mocks before each test
  let usersController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    usersController = createUsersController({
      Users: mockUsersModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful user update
   * The controller should update the user and return the updated data
   */
  test('should update a user and return updated data with password excluded', async () => {
    // SETUP
    // Mock user data with update method
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123',
      phoneNumber: '123-456-7890',
      role: 'Guest',
      update: jest.fn(),
      toJSON: () => ({
        userId: 1,
        fullName: 'John Updated',
        email: 'john@example.com',
        password: 'hashedpassword123',
        phoneNumber: '987-654-3210',
        role: 'Admin'
      })
    };
    
    // Configure mocks
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    mockUser.update.mockResolvedValue(mockUser);
    
    // Simulate a request with userId parameter and updated data
    const req = { 
      params: { id: 1 },
      body: {
        fullName: 'John Updated',
        email: 'john@example.com',
        phoneNumber: '987-654-3210',
        role: 'Admin'
      }
    };
    const res = mockResponse();
    
    // CALL
    await usersController.updateUser(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that update was called with the request body
    expect(mockUser.update).toHaveBeenCalledWith({
      fullName: 'John Updated',
      email: 'john@example.com',
      phoneNumber: '987-654-3210',
      role: 'Admin'
    });
    
    // Verify that we return the updated user data without password
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      fullName: 'John Updated',
      email: 'john@example.com',
      phoneNumber: '987-654-3210',
      role: 'Admin'
    }));
    
    // Verify that password is not included in the response
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: expect.anything() })
    );
  });

  /**
   * Test input validation failure
   * The controller should return a 400 status when input validation fails
   */
  test('should return 400 if input validation fails', async () => {
    // SETUP
    // Mock validation errors
    const mockValidationErrors = [
      { msg: 'Full name is required', param: 'fullName', location: 'body' },
      { msg: 'Must be a valid email address', param: 'email', location: 'body' }
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
        fullName: '',
        email: 'invalid-email'
      }
    };
    const res = mockResponse();
    
    // CALL
    await usersController.updateUser(req, res);
    
    // ASSERTION
    // Verify that findByPk was NOT called (validation failed)
    expect(mockUsersModel.findByPk).not.toHaveBeenCalled();
    
    // Verify that we return a 400 status with validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockValidationErrors });
  });

  /**
   * Test updating a non-existent user
   * The controller should return a 404 status when user is not found
   */
  test('should return 404 if user is not found', async () => {
    // SETUP
    // Make sure validator passes validation
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Configure findByPk to return null (user not found)
    mockUsersModel.findByPk = jest.fn().mockResolvedValue(null);
    
    // Simulate a request with non-existent userId
    const req = { 
      params: { id: 999 },
      body: {
        fullName: 'John Updated',
        email: 'john@example.com'
      }
    };
    const res = mockResponse();
    
    // CALL
    await usersController.updateUser(req, res);
    
    // ASSERTION
    // Verify that findByPk was called
    expect(mockUsersModel.findByPk).toHaveBeenCalled();
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found'
    });
  });

  /**
   * Test unique constraint violation (duplicate email)
   * The controller should return 400 status with specific message
   */
  test('should return 400 status when updating to an email that already exists', async () => {
    // SETUP
    // Reset validator to pass validation
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Mock user data with update method
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      update: jest.fn()
    };
    
    // Configure mocks
    mockUsersModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    
    // Simulate a unique constraint error
    const uniqueError = new Error('Duplicate email');
    uniqueError.name = 'SequelizeUniqueConstraintError';
    mockUser.update.mockRejectedValue(uniqueError);
    
    // Simulate a request with updated data
    const req = { 
      params: { id: 1 },
      body: {
        fullName: 'John Updated',
        email: 'existing@example.com'
      }
    };
    const res = mockResponse();
    
    // CALL
    await usersController.updateUser(req, res);
    
    // ASSERTION
    // Verify that we return a 400 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email already exists'
    });
  });

  /**
   * Test database error handling when updating a user
   * The controller should return a 500 status with an error message
   */
  test('should handle other errors and return 500 status', async () => {
    // SETUP
    // Reset validator to pass validation
    mockValidator.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Mock user data with update method
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      update: jest.fn()
    };
    
    // Configure mocks
    mockUsersModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    
    // Simulate a database error
    const errorMessage = 'Database error during update';
    mockUser.update.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a request with updated data
    const req = { 
      params: { id: 1 },
      body: {
        fullName: 'John Updated',
        email: 'john@example.com'
      }
    };
    const res = mockResponse();
    
    // CALL
    await usersController.updateUser(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating user',
      error: errorMessage
    });
  });
});

/**
 * Tests for the deleteUser controller function
 * 
 * This test suite covers scenarios for deleting users,
 * including successful deletion, not found cases, and error handling.
 */
describe('Users Controller - deleteUser', () => {
  // Reset mocks before each test
  let usersController;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh controller instance for each test with our mocks
    usersController = createUsersController({
      Users: mockUsersModel,
      validator: mockValidator
    });
  });

  /**
   * Test successful user deletion
   * The controller should delete the user and return a success message
   */
  test('should delete a user and return success message', async () => {
    // SETUP
    // Configure a mock user with a destroy method
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      destroy: jest.fn().mockResolvedValue()
    };
    
    // Configure findByPk to return our mock user
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    
    // Simulate a request with userId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await usersController.deleteUser(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the correct ID
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(1);
    
    // Verify that destroy was called on the user
    expect(mockUser.destroy).toHaveBeenCalled();
    
    // Verify that we return a success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'User deleted successfully'
    });
  });

  /**
   * Test deleting a non-existent user
   * The controller should return a 404 status when user is not found
   */
  test('should return 404 if user is not found', async () => {
    // SETUP
    // Configure findByPk to return null (user not found)
    mockUsersModel.findByPk.mockResolvedValue(null);
    
    // Simulate a request with non-existent userId
    const req = { params: { id: 999 } };
    const res = mockResponse();
    
    // CALL
    await usersController.deleteUser(req, res);
    
    // ASSERTION
    // Verify that findByPk was called with the ID
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(999);
    
    // Verify that we return a 404 status with appropriate message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found'
    });
  });

  /**
   * Test database error handling when deleting a user
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors and return 500 status', async () => {
    // SETUP
    // Simulate a database error
    const errorMessage = 'Database error during deletion';
    mockUsersModel.findByPk.mockRejectedValue(new Error(errorMessage));
    
    // Simulate a request with userId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await usersController.deleteUser(req, res);
    
    // ASSERTION
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting user',
      error: errorMessage
    });
  });

  /**
   * Test error handling when destroy operation fails
   * The controller should return a 500 status with error information
   */
  test('should handle errors during destroy operation', async () => {
    // SETUP
    // Configure a mock user with a destroy method that fails
    const errorMessage = 'Failed to delete from database';
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      destroy: jest.fn().mockRejectedValue(new Error(errorMessage))
    };
    
    // Configure findByPk to return our mock user
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    
    // Simulate a request with userId parameter
    const req = { params: { id: 1 } };
    const res = mockResponse();
    
    // CALL
    await usersController.deleteUser(req, res);
    
    // ASSERTION
    // Verify that destroy was called but resulted in error
    expect(mockUser.destroy).toHaveBeenCalled();
    
    // Verify that we return a 500 status with an error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting user',
      error: errorMessage
    });
  });
}); 