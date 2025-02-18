/**
 * User Routes Module
 * Handles all HTTP requests related to User (5 CRUD operations)
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import Users from '../models/Users.js';

// Create a new Express router instance for User routes
const router = express.Router();

//Defines validation rules for User-related operations using express-validator middleware
const validateUser = [
  // Trims whitespace from the start and end of the string
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  // Checks if the provided string is a valid email address
  body('email').isEmail().withMessage('Must be a valid email address'),
  // Checks if the provided string is at least 8 characters long
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  // Checks if the provided string is not empty
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  /** 
   * If no role provided when creating User, defaults to 'Guest', so it is optional.
   * If provided, must be one of the allowed roles ('Guest', 'Customer', 'Admin')
   */
  body('role').optional().isIn(['Guest', 'Customer', 'Admin']).withMessage('Invalid role')
];

/**
 * GET /api/users
 * Retrieves all users from the database in an array with password excluded in JSON format.
 * 
 * Returns a JSON array of user objects containing all user information except password
 */
router.get('/', async (request, response) => {
  try {
    // Using Sequelize's findAll method to retrieve all users
    const users = await Users.findAll({ 
      // Excluding the 'password' field from the response
      attributes: { exclude: ['password'] } 
    });
    // If users are found, send them back as a JSON response
    response.json(users);
  } catch (error) {
    // If there's an error, send a 500 response
    response.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * GET /api/users/:id
 * Retrieves a specific user by their ID, 
 * passed as a parameter in the URL with password excluded in JSON format.
 * 
 * Returns a JSON object containing the user's information except password
 */
router.get('/:id', async (request, response) => {
  try {
    // Using Sequelize's findByPk method to retrieve a user by their ID
    const user = await Users.findByPk(request.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      // If user is not found, send a 404 'Not Found' response
      return response.status(404).json({ message: 'User not found' });
    }
    // If user is found, send them back as a JSON response
    response.json(user);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

/**
 * POST /api/users
 * Creates a new user in the database
 * Uses the validateUser middleware to validate the new user request data
 * 
 * Returns a JSON object containing the newly created user's information except password
 */
router.post('/', validateUser, async (request, response) => {
  // Using validationResult method to check for validation errors according to validateUser rules
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    // If there are validation errors, send a 400 'Bad Request' response with the array of errors
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    // Using Sequelize's create method to insert a new user into the database
    const newUser = await Users.create({
      fullName: request.body.fullName,
      email: request.body.email,
      password: request.body.password,
      phoneNumber: request.body.phoneNumber,
      role: request.body.role || 'Guest'
    });

    /** 
     * Converts newUser model to JSON and uses JavaScript object destructuring 
     * to create a new object named 'userWithoutPassword' without the password field
     */ 
    const { password, ...userWithoutPassword } = newUser.toJSON();
    // Send back a 201 'CREATED' response with the newly created user object without password
    response.status(201).json(userWithoutPassword);
  } catch (error) {
    // Using Sequelize's UniqueConstraintError to check if email already exists
    if (error.name === 'SequelizeUniqueConstraintError') {
      // If email already exists, send a 400 'Email already exists' response
      return response.status(400).json({ message: 'Email already exists' });
    }
    response.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Updates an existing user's information
 * Uses the validateUser middleware to validate the updated user request data
 * 
 * Returns a JSON object containing the updated user's information except password
 */
router.put('/:id', validateUser, async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await Users.findByPk(request.params.id);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    // Using Sequelize's update method to update the user's information
    await user.update({
      fullName: request.body.fullName,
      email: request.body.email,
      password: request.body.password,
      phoneNumber: request.body.phoneNumber,
      role: request.body.role || user.role
    });

    /** 
     * Send back a 200 'OK' response with the updated user object without password
     *
     * Converts newUser model to JSON and uses JavaScript object destructuring 
     * to create a new object named 'userWithoutPassword' without the password field
     */ 
    const { password, ...userWithoutPassword } = user.toJSON();
    // Send back a 200 'OK' response with the updated user object without password
    response.json(userWithoutPassword);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.status(400).json({ message: 'Email already exists' });
    }
    response.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Removes a user from the system
 */
router.delete('/:id', async (request, response) => {
  try {
    const user = await Users.findByPk(request.params.id);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    // Using Sequelize's destroy method to remove the user from the database
    await user.destroy();
    // If user is successfully deleted, send a 200 'User deleted successfully' response
    response.json({ message: 'User deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;