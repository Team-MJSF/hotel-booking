import { validationResult } from 'express-validator';
// Default model imports for backward compatibility
import DefaultUsers from '../models/Users.js';
/**
 * Create a User Controller factory
 *
 * This factory function creates user controller methods with injected dependencies,
 * making the controller more testable and maintainable.
 *
 * @param {ControllerDependencies} deps - Dependencies to inject
 * @returns {Object} - Controller methods
 */
export const createUsersController = (deps = {}) => {
    // Use provided dependencies or defaults
    const { Users = DefaultUsers, validator = validationResult } = deps;
    /**
     * Get all users
     *
     * Retrieves all users from the database, excluding password fields for security.
     *
     * @param {Request} request - Express request object
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - JSON array of users with passwords excluded
     */
    const getAllUsers = async (request, response) => {
        try {
            const users = await Users.findAll({
                attributes: { exclude: ['password'] }
            });
            response.json(users);
        }
        catch (error) {
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
     * @param {Request} request - Express request object with user ID parameter
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - User data or error message
     */
    const getUserById = async (request, response) => {
        try {
            const user = await Users.findByPk(request.params.id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                response.status(404).json({ message: 'User not found' });
                return;
            }
            response.json(user);
        }
        catch (error) {
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
     * @param {Request} request - Express request object with user details in body
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Created user object (excluding password) or error message
     */
    const createUser = async (request, response) => {
        // Validate request data using the injected validator
        const errors = validator(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
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
            const userJson = newUser.toJSON();
            const { password, ...userWithoutPassword } = userJson;
            // Return the created user with 201 Created status
            response.status(201).json(userWithoutPassword);
        }
        catch (error) {
            // Handle unique constraint violations (duplicate email)
            if (error.name === 'SequelizeUniqueConstraintError') {
                response.status(400).json({ message: 'Email already exists' });
                return;
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
     * @param {Request} request - Express request object with user ID parameter and updated data
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Updated user object or error message
     */
    const updateUser = async (request, response) => {
        // Validate request data using the injected validator
        const errors = validator(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            // Find the user by ID
            const user = await Users.findByPk(request.params.id);
            // If user doesn't exist, return 404
            if (!user) {
                response.status(404).json({ message: 'User not found' });
                return;
            }
            // Update the user with new data
            await user.update({
                fullName: request.body.fullName,
                email: request.body.email,
                phoneNumber: request.body.phoneNumber,
                role: request.body.role || user.role
            });
            // Exclude password from the response for security
            const userJson = user.toJSON();
            const { password, ...userWithoutPassword } = userJson;
            // Return the updated user
            response.json(userWithoutPassword);
        }
        catch (error) {
            // Handle unique constraint violations (duplicate email)
            if (error.name === 'SequelizeUniqueConstraintError') {
                response.status(400).json({ message: 'Email already exists' });
                return;
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
     * @param {Request} request - Express request object with user ID parameter
     * @param {Response} response - Express response object
     * @returns {Promise<void>} - Success message or error message
     */
    const deleteUser = async (request, response) => {
        try {
            // Find the user by ID
            const user = await Users.findByPk(request.params.id);
            // If user doesn't exist, return 404
            if (!user) {
                response.status(404).json({ message: 'User not found' });
                return;
            }
            // Delete the user
            await user.destroy();
            // Return success message
            response.json({ message: 'User deleted successfully' });
        }
        catch (error) {
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
export const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = defaultController;
