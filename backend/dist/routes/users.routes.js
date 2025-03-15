/**
 * User Routes Module
 * Handles all HTTP requests related to User operations
 */
import express, { Router } from 'express';
import { body } from 'express-validator';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';
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
 * Retrieves all users from the database
 */
router.get('/', getAllUsers);
/**
 * GET /api/users/:id
 * Retrieves a specific user by their ID
 */
router.get('/:id', getUserById);
/**
 * POST /api/users
 * Creates a new user in the database
 */
router.post('/', validateUser, createUser);
/**
 * PUT /api/users/:id
 * Updates an existing user's information
 */
router.put('/:id', validateUser, updateUser);
/**
 * DELETE /api/users/:id
 * Removes a user from the system
 */
router.delete('/:id', deleteUser);
export default router;
