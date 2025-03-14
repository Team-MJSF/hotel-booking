/**
 * User Controller Module
 * 
 * This module provides the business logic for all user-related operations in the hotel booking system.
 * It handles retrieving, creating, updating, and deleting users.
 * 
 * The controller implements user management operations:
 * - Get all users (with password exclusion for security)
 * - Get user by ID
 * - Create new user (with validation)
 * - Update existing user
 * - Delete user
 * 
 * Error handling is implemented throughout with appropriate HTTP status codes.
 * 
 * This controller uses dependency injection for better testability and maintainability.
 */
import { validationResult } from 'express-validator';

// Default model imports for backward compatibility
import DefaultUsers from '../models/Users.js';

/**
 * Create a User Controller factory
 * 
 * This factory function creates user controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 * 
 * @param {Object} deps - Dependencies to inject
 * @param {Object} deps.Users - Users model
 * @param {Function} deps.validator - Validation function (defaults to express-validator's validationResult)
 * @returns {Object} - Controller methods
 */
export const createUsersController = (deps = {}) => {
  // Use provided dependencies or defaults
  const {
    Users = DefaultUsers,
    validator = validationResult
  } = deps;
  
  /**
   * Get all users
   * 
   * Retrieves all users from the database, excluding password fields for security.
   * 
   * @param {Object} request - Express request object
   * @param {Object} response - Express response object
   * @returns {JSON} - JSON array of users with passwords excluded
   */
  const getAllUsers = async (request, response) => {
    try {
      const users = await Users.findAll({ 
        attributes: { exclude: ['password'] } 
      });
      response.json(users);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error fetching users', 
        error: error.message 
      });
    }
  };

  /**
   * Get user by ID
   * 
   * Retrieves a specific user by their ID, excluding the password field for security.
   * 
   * @param {Object} request - Express request object with user ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - User data or error message
   */
  const getUserById = async (request, response) => {
    try {
      const user = await Users.findByPk(request.params.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }
      
      response.json(user);
    } catch (error) {
      response.status(500).json({ 
        message: 'Error fetching user', 
        error: error.message 
      });
    }
  };

  /**
   * Create new user
   * 
   * Creates a new user in the database with the provided details.
   * Validates request data before processing.
   * Handles unique constraint errors for email addresses.
   * 
   * @param {Object} request - Express request object with user details in body
   * @param {Object} response - Express response object
   * @returns {JSON} - Created user object (excluding password) or error message
   */
  const createUser = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = await Users.create({
        fullName: request.body.fullName,
        email: request.body.email,
        password: request.body.password,
        phoneNumber: request.body.phoneNumber,
        role: request.body.role || 'Guest'
      });

      // Exclude password from the response for security
      const { password, ...userWithoutPassword } = newUser.toJSON();
      
      // Return the created user with 201 Created status
      response.status(201).json(userWithoutPassword);
    } catch (error) {
      // Handle unique constraint violations (duplicate email)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return response.status(400).json({ message: 'Email already exists' });
      }
      
      // Handle other errors
      response.status(500).json({ 
        message: 'Error creating user', 
        error: error.message 
      });
    }
  };

  /**
   * Update user
   * 
   * Updates an existing user's information in the database.
   * Validates request data before processing.
   * Handles unique constraint errors for email addresses.
   * 
   * @param {Object} request - Express request object with user ID parameter and updated data
   * @param {Object} response - Express response object
   * @returns {JSON} - Updated user object or error message
   */
  const updateUser = async (request, response) => {
    // Validate request data using the injected validator
    const errors = validator(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      // Find the user by ID
      const user = await Users.findByPk(request.params.id);
      
      // If user doesn't exist, return 404
      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      // Update the user with new data
      await user.update({
        fullName: request.body.fullName,
        email: request.body.email,
        phoneNumber: request.body.phoneNumber,
        role: request.body.role || user.role
      });

      // Exclude password from the response for security
      const { password, ...userWithoutPassword } = user.toJSON();
      
      // Return the updated user
      response.json(userWithoutPassword);
    } catch (error) {
      // Handle unique constraint violations (duplicate email)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return response.status(400).json({ message: 'Email already exists' });
      }
      
      // Handle other errors
      response.status(500).json({ 
        message: 'Error updating user', 
        error: error.message 
      });
    }
  };

  /**
   * Delete user
   * 
   * Removes a user from the database by ID.
   * 
   * @param {Object} request - Express request object with user ID parameter
   * @param {Object} response - Express response object
   * @returns {JSON} - Success message or error message
   */
  const deleteUser = async (request, response) => {
    try {
      // Find the user by ID
      const user = await Users.findByPk(request.params.id);
      
      // If user doesn't exist, return 404
      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      // Delete the user
      await user.destroy();
      
      // Return success message
      response.json({ message: 'User deleted successfully' });
    } catch (error) {
      // Handle any errors
      response.status(500).json({ 
        message: 'Error deleting user', 
        error: error.message 
      });
    }
  };

  // Return all controller methods
  return {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
  };
};

// For backward compatibility, export pre-initialized controller methods
const defaultController = createUsersController();
export const { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = defaultController;