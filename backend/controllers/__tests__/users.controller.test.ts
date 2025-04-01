/**
 * Unit Tests for the Users Controller
 * 
 * This file contains comprehensive tests for the user-related functionality in our API.
 * We test these main controller functions:
 * 1. getAllUsers - Retrieving user lists
 * 2. createUser - Creating new users
 * 3. updateUser - Updating existing users
 * 4. deleteUser - Deleting users
 * 
 * The tests use dependency injection to provide mock implementations of the models,
 * making testing cleaner and more maintainable.
 */
0
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import type { ValidationError } from 'express-validator';
import type { UserAttributes } from '../../models/Users.js';

// Create mock model that we'll inject into the controller
const mockUsersModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn<() => Promise<UserAttributes | null>>(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
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
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as any; // Makes res.status().json() possible
  res.json = jest.fn().mockReturnValue(res) as any;   // Returns the res object for chaining
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
  let usersController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh controller instance for each test with our mocks
    usersController = createUsersController({
      Users: mockUsersModel as any,
      validator: mockValidator as any
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
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findAll.mockResolvedValue(mockUsersData);
    
    // Simulate an HTTP request
    const req = {} as Request;
    const res = mockResponse();
    
    // CALL - Execute the controller function we're testing
    await usersController.getAllUsers(req, res as Response);
    
    // ASSERTION - Verify the function behaved as expected
    // Verify that findAll was called with the correct attributes exclusion
    expect(mockUsersModel.findAll).toHaveBeenCalledWith({ 
      attributes: { exclude: ['password'] } 
    });
    // Verify that the response contains all users
    expect(res.json).toHaveBeenCalledWith(mockUsersData);
  });

  /**
   * Test error handling when the database query fails
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors appropriately', async () => {
    // Prepare the error that will be thrown
    const mockError = new Error('Database connection failed');
    
    // Configure the mock to throw an error when findAll is called
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findAll.mockRejectedValue(mockError);
    
    // Simulate an HTTP request
    const req = {} as Request;
    const res = mockResponse();
    
    // Execute the controller function
    await usersController.getAllUsers(req, res as Response);
    
    // Verify the response has status 500 and includes the error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error fetching users',
      error: mockError.message
    });
  });
});

/**
 * Tests for the createUser controller function
 * 
 * This test suite covers creating a new user,
 * including successful creation, validation errors, and database constraints.
 */
describe('Users Controller - createUser', () => {
  let usersController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    usersController = createUsersController({
      Users: mockUsersModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful user creation
   * The controller should create a user and return it without the password
   */
  test('should create a new user and return it without password', async () => {
    // Sample new user data from the request
    const newUserData = {
      fullName: 'Alice Brown',
      email: 'alice@example.com',
      password: 'password123',
      phoneNumber: '555-1234',
      role: 'Guest'
    };
    
    // Sample created user returned from database (with ID)
    const createdUser = {
      userId: 3,
      ...newUserData,
      toJSON: () => ({
        userId: 3,
        ...newUserData
      })
    };
    
    // Configure mock behavior
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.create.mockResolvedValue(createdUser);
    
    // Replace validator for this test to simulate passed validation
    const validValidator = jest.fn().mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    // Create controller with valid validator
    const controllerWithValidValidator = createUsersController({
      Users: mockUsersModel as any,
      validator: validValidator as any
    });
    
    // Simulate HTTP request
    const req = { 
      body: newUserData 
    } as Request;
    const res = mockResponse();
    
    // Execute controller function
    await controllerWithValidValidator.createUser(req, res as Response);
    
    // Verify user was created and returned without password
    expect(mockUsersModel.create).toHaveBeenCalledWith(newUserData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      userId: 3,
      fullName: 'Alice Brown',
      email: 'alice@example.com',
      // Password should be excluded
      phoneNumber: '555-1234',
      role: 'Guest'
    }));
  });

  /**
   * Test validation errors
   * The controller should return a 400 status with validation errors
   */
  test('should return 400 with validation errors', async () => {
    // Prepare validation errors
    const validationErrors = [
      { param: 'email', msg: 'Invalid email format' },
      { param: 'password', msg: 'Password too short' }
    ];
    
    // Create invalid validator that returns errors
    const invalidValidator = jest.fn().mockReturnValue({
      isEmpty: () => false,
      array: () => validationErrors
    });
    
    // Create controller with invalid validator
    const controllerWithInvalidValidator = createUsersController({
      Users: mockUsersModel as any,
      validator: invalidValidator as any
    });
    
    // Simulate HTTP request with invalid data
    const req = { 
      body: { 
        email: 'invalid-email', 
        password: '123' 
      } 
    } as Request;
    const res = mockResponse();
    
    // Execute controller function
    await controllerWithInvalidValidator.createUser(req, res as Response);
    
    // Verify 400 response with validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
    // The create method should not be called due to validation failure
    expect(mockUsersModel.create).not.toHaveBeenCalled();
  });

  /**
   * Test unique constraint error (duplicate email)
   * The controller should return a 400 status with an appropriate message
   */
  test('should handle duplicate email error', async () => {
    // Create a sample user data
    const duplicateUserData = {
      fullName: 'Duplicate User',
      email: 'exists@example.com',
      password: 'password123',
      phoneNumber: '555-9876',
      role: 'Guest'
    };
    
    // Configure mock to throw a unique constraint error
    const uniqueConstraintError = {
      name: 'SequelizeUniqueConstraintError',
      message: 'Validation error',
      original: { sqlMessage: 'Duplicate entry' }
    };
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.create.mockRejectedValue(uniqueConstraintError);
    
    // Simulate HTTP request
    const req = { 
      body: duplicateUserData 
    } as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.createUser(req, res as Response);
    
    // Verify 400 response with duplicate email message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
  });
});

/**
 * Tests for the updateUser controller function
 * 
 * This test suite covers updating an existing user,
 * including successful updates, validation errors, and error handling.
 */
describe('Users Controller - updateUser', () => {
  let usersController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    usersController = createUsersController({
      Users: mockUsersModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful user update
   * The controller should return the updated user without the password
   */
  test('should update a user and return it without password', async () => {
    // Sample user ID to update
    const userId = '1';
    
    // Sample update data
    const updateData = {
      fullName: 'John Updated',
      email: 'john.updated@example.com',
      phoneNumber: '555-9876'
    };
    
    // Prepare a user object with methods
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'Guest',
      phoneNumber: '555-1234',
      password: 'hashedpassword123',
      // @ts-expect-error - Mock implementation may not match exact types
      update: jest.fn().mockResolvedValue({}),
      toJSON: jest.fn().mockReturnValue({
        userId: 1,
        fullName: 'John Updated',
        email: 'john.updated@example.com',
        role: 'Guest',
        phoneNumber: '555-9876',
        password: 'hashedpassword123'
      })
    };
    
    // Configure findByPk to return our mock user
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.updateUser(req, res as Response);
    
    // Verify the user was found
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(userId);
    
    // Verify update was called with correct data
    expect(mockUser.update).toHaveBeenCalled();
    
    // Verify response
    expect(res.json).toHaveBeenCalled();
  });

  /**
   * Test when user to update is not found
   * The controller should return a 404 status with a 'not found' message
   */
  test('should return 404 when user to update is not found', async () => {
    // Sample user ID that doesn't exist
    const userId = '999';
    
    // Sample update data
    const updateData = {
      fullName: 'John Updated'
    };
    
    // Configure mock to return null (user not found)
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockResolvedValue(null);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.updateUser(req, res as Response);
    
    // Verify 404 response
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  /**
   * Test validation errors
   * The controller should return a 400 status with validation errors
   */
  test('should return 400 with validation errors', async () => {
    // Sample user ID
    const userId = '1';
    
    // Sample invalid update data
    const updateData = {
      email: 'invalid-email'
    };
    
    // Prepare validation errors
    const validationErrors = [
      { param: 'email', msg: 'Invalid email format' }
    ];
    
    // Create invalid validator that returns errors
    const invalidValidator = jest.fn().mockReturnValue({
      isEmpty: () => false,
      array: () => validationErrors
    });
    
    // Create controller with invalid validator
    const controllerWithInvalidValidator = createUsersController({
      Users: mockUsersModel as any,
      validator: invalidValidator as any
    });
    
    // Simulate HTTP request with invalid data
    const req = { 
      params: { id: userId },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await controllerWithInvalidValidator.updateUser(req, res as Response);
    
    // Verify 400 response with validation errors
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
    // The findByPk method should not be called due to validation failure
    expect(mockUsersModel.findByPk).not.toHaveBeenCalled();
  });

  /**
   * Test unique constraint error (duplicate email)
   * The controller should return a 400 status with an appropriate message
   */
  test('should handle duplicate email error', async () => {
    // Sample user ID
    const userId = '1';
    
    // Sample update data with email that already exists
    const updateData = {
      email: 'exists@example.com'
    };
    
    // Prepare a user object with update method that throws error
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      update: jest.fn()
    };
    
    // Configure mock to find the user
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    
    // Configure update to throw a unique constraint error
    const uniqueConstraintError = {
      name: 'SequelizeUniqueConstraintError',
      message: 'Validation error',
      original: { sqlMessage: 'Duplicate entry' }
    };
    
    // @ts-expect-error - Mock implementation may not match exact types
    mockUser.update.mockRejectedValue(uniqueConstraintError);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.updateUser(req, res as Response);
    
    // Verify 400 response with duplicate email message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
  });

  /**
   * Test general error handling
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors appropriately', async () => {
    // Sample user ID
    const userId = '1';
    
    // Sample update data
    const updateData = {
      fullName: 'John Updated'
    };
    
    // Prepare error that will be thrown
    const mockError = new Error('Database error');
    
    // Configure mock to throw an error
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockRejectedValue(mockError);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId },
      body: updateData
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.updateUser(req, res as Response);
    
    // Verify 500 response with error details
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating user',
      error: mockError.message
    });
  });
});

/**
 * Tests for the deleteUser controller function
 * 
 * This test suite covers deleting an existing user,
 * including successful deletion, user not found, and error handling.
 */
describe('Users Controller - deleteUser', () => {
  let usersController: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    usersController = createUsersController({
      Users: mockUsersModel as any,
      validator: mockValidator as any
    });
  });

  /**
   * Test successful user deletion
   * The controller should return a success message
   */
  test('should delete a user successfully', async () => {
    // Sample user ID to delete
    const userId = '1';
    
    // Prepare a user object with destroy method
    const mockUser = {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      // @ts-expect-error - Mock implementation may not match exact types
      destroy: jest.fn().mockResolvedValue({})
    };
    
    // Configure findByPk to return our mock user
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockResolvedValue(mockUser);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId }
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.deleteUser(req, res as Response);
    
    // Verify the user was found
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(userId);
    
    // Verify destroy was called
    expect(mockUser.destroy).toHaveBeenCalled();
    
    // Verify response with success message
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'User deleted successfully' 
    });
  });

  /**
   * Test when user to delete is not found
   * The controller should return a 404 status with a 'not found' message
   */
  test('should return 404 when user to delete is not found', async () => {
    // Sample user ID that doesn't exist
    const userId = '999';
    
    // Configure mock to return null (user not found)
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockResolvedValue(null);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId }
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.deleteUser(req, res as Response);
    
    // Verify 404 response
    expect(mockUsersModel.findByPk).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  /**
   * Test error handling
   * The controller should return a 500 status with an error message
   */
  test('should handle database errors appropriately', async () => {
    // Sample user ID
    const userId = '1';
    
    // Prepare error that will be thrown
    const mockError = new Error('Database error');
    
    // Configure mock to throw an error
    // @ts-expect-error - Mock implementation may not match exact types
    mockUsersModel.findByPk.mockRejectedValue(mockError);
    
    // Simulate HTTP request
    const req = { 
      params: { id: userId }
    } as unknown as Request;
    const res = mockResponse();
    
    // Execute controller function
    await usersController.deleteUser(req, res as Response);
    
    // Verify 500 response with error details
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error deleting user',
      error: mockError.message
    });
  });
});



//unit test for getbyID
describe('Users Controller - getUserById (findOne)', () => {
  let usersController: any;

  beforeEach(() => {
    jest.clearAllMocks();
    usersController = createUsersController({
      Users: mockUsersModel as any
    });
  });

  test('should return a user by ID using findOne', async () => {
    const mockUser: UserAttributes = { 
      userId: 1, 
      fullName: 'John Doe', 
      email: 'john@example.com', 
      password: 'hashedpassword123',
      role: 'Customer',
      phoneNumber: '123-456-7890'
    };

    // Mock Sequelize's `findOne` response
    mockUsersModel.findOne.mockResolvedValue(mockUser);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockResponse();

    await usersController.getUserById(req, res as Response);

    expect(mockUsersModel.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  test('should return 404 if user is not found', async () => {
    mockUsersModel.findOne.mockResolvedValue(null);

    const req = { params: { id: '999' } } as unknown as Request;
    const res = mockResponse();

    await usersController.getUserById(req, res as Response);

    expect(mockUsersModel.findOne).toHaveBeenCalledWith({ where: { userId: 999 } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
});

export {};